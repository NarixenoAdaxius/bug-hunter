import type { Issue } from '@bughunter/shared';
import type { AnalyzeInput, AnalyzerPlugin } from '../types.js';
import { isJsLikeLanguage } from '../language.js';
import { makeIssueId } from '../issueId.js';
import { lineNumberAtIndex } from '../utils.js';

const PLUGIN = 'consoleLog';

const CONSOLE_LOG = /console\.log\s*\(/g;

function run(input: AnalyzeInput): Issue[] {
  if (!isJsLikeLanguage(input.languageId)) {
    return [];
  }
  const { code } = input;
  const issues: Issue[] = [];
  let m: RegExpExecArray | null;
  CONSOLE_LOG.lastIndex = 0;
  while ((m = CONSOLE_LOG.exec(code)) !== null) {
    const line = lineNumberAtIndex(code, m.index);
    const id = makeIssueId(PLUGIN, 'log', line, `${m.index}`);
    issues.push({
      id,
      message: '`console.log` found — remove or replace with structured logging before shipping.',
      severity: 'info',
      line,
    });
  }
  return issues;
}

export function createConsoleLogPlugin(): AnalyzerPlugin {
  return { name: PLUGIN, run };
}
