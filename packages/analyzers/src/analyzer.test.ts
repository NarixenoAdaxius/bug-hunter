import { describe, it, expect } from 'vitest';
import {
  analyze,
  orchestrate,
  builtInPlugins,
  createUnsafeEvalPlugin,
  createDuplicateLinesPlugin,
  createHardcodedSecretsPlugin,
  createDeepNestingPlugin,
  createConsoleLogPlugin,
  createLongFunctionPlugin,
  createCyclomaticComplexityPlugin,
} from './index.js';

describe('orchestrate', () => {
  it('returns empty array for whitespace-only code', () => {
    expect(analyze({ code: '   \n\t  ' })).toEqual([]);
  });

  it('dedupes by issue id and sorts by line', () => {
    const plugins = [createUnsafeEvalPlugin(), createUnsafeEvalPlugin()];
    const issues = orchestrate({ code: 'eval("x")', languageId: 'javascript' }, plugins);
    expect(issues.length).toBe(1);
    expect(issues[0].line).toBe(1);
  });
});

describe('unsafeEval', () => {
  it('reports eval usage for javascript', () => {
    const issues = analyze({ code: 'foo();\neval("bad");\n', languageId: 'javascript' });
    const ev = issues.filter((i) => i.message.includes('eval'));
    expect(ev.length).toBeGreaterThanOrEqual(1);
    expect(ev[0].severity).toBe('error');
    expect(ev[0].line).toBe(2);
  });

  it('skips JS rules for non-JS languageId', () => {
    const issues = analyze({ code: 'eval("x")', languageId: 'markdown' });
    expect(issues.filter((i) => i.message.includes('eval'))).toHaveLength(0);
  });
});

describe('duplicateLines', () => {
  it('flags repeated non-trivial lines', () => {
    const p = createDuplicateLinesPlugin();
    const line = '    const x = duplicateWorkload + 1;';
    const code = `${line}\n${line}\n`;
    const issues = p.run({ code });
    expect(issues.length).toBe(1);
    expect(issues[0].message).toContain('duplicate');
  });
});

describe('nestedLoops', () => {
  it('warns when a loop header is more indented than a previous loop header', () => {
    const code = `for (let i = 0; i < n; i++) {
  for (let j = 0; j < m; j++) {
    x++;
  }
}`;
    const issues = analyze({ code, languageId: 'javascript' });
    const nested = issues.filter((i) => i.message.includes('Nested loop'));
    expect(nested.length).toBeGreaterThanOrEqual(1);
  });
});

describe('hardcodedSecrets', () => {
  it('detects hardcoded API key', () => {
    const p = createHardcodedSecretsPlugin();
    const code = `const api_key = "abcdef1234567890abcdef";`;
    const issues = p.run({ code });
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues[0].severity).toBe('error');
    expect(issues[0].message).toContain('API key');
  });

  it('detects hardcoded password', () => {
    const p = createHardcodedSecretsPlugin();
    const code = `const password = "supersecretpassword123";`;
    const issues = p.run({ code });
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues[0].message).toContain('secret');
  });

  it('detects private key headers', () => {
    const p = createHardcodedSecretsPlugin();
    const code = `const key = \`-----BEGIN PRIVATE KEY-----\nMIIEvQ...\`;`;
    const issues = p.run({ code });
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues[0].message).toContain('Private key');
  });
});

describe('deepNesting', () => {
  it('flags deeply nested code (> 4 braces)', () => {
    const p = createDeepNestingPlugin();
    const code = [
      'if (a) {',
      '  if (b) {',
      '    if (c) {',
      '      if (d) {',
      '        if (e) {',
      '          x++;',
      '        }',
      '      }',
      '    }',
      '  }',
      '}',
    ].join('\n');
    const issues = p.run({ code, languageId: 'typescript' });
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues[0].message).toContain('Nesting depth');
  });

  it('skips non-JS languages', () => {
    const p = createDeepNestingPlugin();
    const code = `if (a) { if (b) { if (c) { if (d) { if (e) { x++; } } } } }`;
    const issues = p.run({ code, languageId: 'python' });
    expect(issues).toHaveLength(0);
  });
});

describe('consoleLog', () => {
  it('reports console.log usage for JS', () => {
    const p = createConsoleLogPlugin();
    const code = `console.log("debug");\nconsole.log("more");`;
    const issues = p.run({ code, languageId: 'javascript' });
    expect(issues.length).toBe(2);
    expect(issues[0].severity).toBe('info');
  });

  it('skips non-JS languages', () => {
    const p = createConsoleLogPlugin();
    const code = `console.log("test");`;
    const issues = p.run({ code, languageId: 'rust' });
    expect(issues).toHaveLength(0);
  });
});

describe('longFunction', () => {
  it('flags functions longer than threshold', () => {
    const p = createLongFunctionPlugin();
    const bodyLines = Array(50).fill('  x++;').join('\n');
    const code = `function bigFn() {\n${bodyLines}\n}`;
    const issues = p.run({ code, languageId: 'javascript' });
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues[0].message).toContain('lines');
  });

  it('does not flag short functions', () => {
    const p = createLongFunctionPlugin();
    const code = `function small() {\n  return 1;\n}`;
    const issues = p.run({ code, languageId: 'javascript' });
    expect(issues).toHaveLength(0);
  });
});

describe('cyclomaticComplexity', () => {
  it('flags high complexity functions', () => {
    const p = createCyclomaticComplexityPlugin();
    const branches = Array(12).fill('  if (x) { y++; }').join('\n');
    const code = `function complex() {\n${branches}\n}`;
    const issues = p.run({ code, languageId: 'typescript' });
    expect(issues.length).toBeGreaterThanOrEqual(1);
    expect(issues[0].message).toContain('Cyclomatic complexity');
  });

  it('does not flag simple functions', () => {
    const p = createCyclomaticComplexityPlugin();
    const code = `function simple() {\n  return 1;\n}`;
    const issues = p.run({ code, languageId: 'javascript' });
    expect(issues).toHaveLength(0);
  });
});

describe('builtInPlugins', () => {
  it('exports a non-empty default plugin list', () => {
    expect(builtInPlugins.length).toBeGreaterThanOrEqual(5);
  });
});
