import type { Issue } from '@bughunter/shared';
import type { AnalyzeInput, AnalyzerPlugin } from '../types.js';
import { isJsLikeLanguage } from '../language.js';
import { makeIssueId } from '../issueId.js';

const PLUGIN = 'deepNesting';
const MAX_DEPTH = 4;

function run(input: AnalyzeInput): Issue[] {
  if (!isJsLikeLanguage(input.languageId)) {
    return [];
  }
  const lines = input.code.split(/\r?\n/);
  const issues: Issue[] = [];
  let depth = 0;
  const reported = new Set<number>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const ch of line) {
      if (ch === '{') depth++;
      else if (ch === '}') depth = Math.max(0, depth - 1);
    }
    if (depth > MAX_DEPTH && !reported.has(depth)) {
      reported.add(depth);
      const lineNo = i + 1;
      const id = makeIssueId(PLUGIN, 'deep', lineNo, `${depth}`);
      issues.push({
        id,
        message: `Nesting depth of ${depth} exceeds threshold (${MAX_DEPTH}). Consider extracting logic.`,
        severity: 'warning',
        line: lineNo,
      });
    }
  }
  return issues;
}

export function createDeepNestingPlugin(): AnalyzerPlugin {
  return { name: PLUGIN, run };
}
