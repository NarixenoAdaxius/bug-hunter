import type { Issue } from '@bughunter/shared';
import type { AnalyzeInput, AnalyzerPlugin } from '../types.js';
import { isJsLikeLanguage } from '../language.js';
import { makeIssueId } from '../issueId.js';

const PLUGIN = 'nestedLoops';

const LOOP_HEADER = /^\s*(for|while)\s*\(/;

function leadingWidth(line: string): number {
  const m = line.match(/^\s*/);
  return m ? m[0].length : 0;
}

function run(input: AnalyzeInput): Issue[] {
  if (!isJsLikeLanguage(input.languageId)) {
    return [];
  }
  const lines = input.code.split(/\r?\n/);
  const issues: Issue[] = [];
  let prev: { line: number; indent: number } | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!LOOP_HEADER.test(line)) {
      continue;
    }
    const indent = leadingWidth(line);
    const lineNo = i + 1;
    if (prev !== null && indent > prev.indent) {
      const id = makeIssueId(PLUGIN, 'nested', lineNo, `${prev.line}-${lineNo}`);
      issues.push({
        id,
        message:
          'Nested loop headers detected (heuristic). Consider algorithmic complexity and extracting inner work.',
        severity: 'warning',
        line: lineNo,
      });
    }
    prev = { line: lineNo, indent };
  }
  return issues;
}

export function createNestedLoopsPlugin(): AnalyzerPlugin {
  return { name: PLUGIN, run };
}
