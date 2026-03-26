import type { Issue } from '@bughunter/shared';
import type { AnalyzeInput, AnalyzerPlugin } from '../types.js';
import { makeIssueId } from '../issueId.js';
import { lineNumberAtIndex } from '../utils.js';

const PLUGIN = 'hardcodedSecrets';

const PATTERNS: { key: string; re: RegExp; message: string }[] = [
  {
    key: 'apiKey',
    re: /(?:api[_-]?key|apikey)\s*[:=]\s*['"][A-Za-z0-9_-]{16,}['"]/gi,
    message: 'Possible hardcoded API key detected. Use environment variables instead.',
  },
  {
    key: 'secret',
    re: /(?:secret|password|passwd|token)\s*[:=]\s*['"][^'"]{8,}['"]/gi,
    message: 'Possible hardcoded secret/password. Use environment variables or a secrets manager.',
  },
  {
    key: 'privateKey',
    re: /-----BEGIN\s+(RSA\s+)?PRIVATE\s+KEY-----/g,
    message: 'Private key found in source code. Never commit private keys.',
  },
];

function run(input: AnalyzeInput): Issue[] {
  const { code } = input;
  const issues: Issue[] = [];
  for (const { key, re, message } of PATTERNS) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(code)) !== null) {
      const line = lineNumberAtIndex(code, m.index);
      const id = makeIssueId(PLUGIN, key, line, `${m.index}`);
      issues.push({ id, message, severity: 'error', line });
    }
  }
  return issues;
}

export function createHardcodedSecretsPlugin(): AnalyzerPlugin {
  return { name: PLUGIN, run };
}
