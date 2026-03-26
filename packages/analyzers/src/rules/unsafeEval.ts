import type { Issue } from '@bughunter/shared';
import type { AnalyzeInput, AnalyzerPlugin } from '../types.js';
import { isJsLikeLanguage } from '../language.js';
import { makeIssueId } from '../issueId.js';
import { lineNumberAtIndex } from '../utils.js';

const PLUGIN = 'unsafeEval';

const PATTERNS: { key: string; re: RegExp; message: string; severity: Issue['severity'] }[] = [
  {
    key: 'eval',
    re: /\beval\s*\(/g,
    message: '`eval` can execute arbitrary code and is a security risk.',
    severity: 'error',
  },
  {
    key: 'newFunction',
    re: /new\s+Function\s*\(/g,
    message: '`new Function()` is similar to eval and can be unsafe.',
    severity: 'warning',
  },
];

function run(input: AnalyzeInput): Issue[] {
  if (!isJsLikeLanguage(input.languageId)) {
    return [];
  }
  const { code } = input;
  const issues: Issue[] = [];
  for (const { key, re, message, severity } of PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      const line = lineNumberAtIndex(code, m.index);
      const id = makeIssueId(PLUGIN, key, line, `${m.index}`);
      issues.push({ id, message, severity, line });
    }
  }
  return issues;
}

export function createUnsafeEvalPlugin(): AnalyzerPlugin {
  return { name: PLUGIN, run };
}
