import type { Issue } from '@bughunter/shared';
import type { AnalyzeInput, AnalyzerPlugin } from '../types.js';
import { isJsLikeLanguage } from '../language.js';
import { makeIssueId } from '../issueId.js';
import { lineNumberAtIndex } from '../utils.js';

const PLUGIN = 'longFunction';

const LONG_THRESHOLD = 45;

const FN_PATTERNS = [
  /\bfunction\s*[^(]*\(/g,
  /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\([^)]*\)\s*=>/g,
  /(?:const|let|var)\s+\w+\s*=\s*(?:async\s+)?\w+\s*=>/g,
];

function run(input: AnalyzeInput): Issue[] {
  if (!isJsLikeLanguage(input.languageId)) {
    return [];
  }
  const code = input.code;
  const issues: Issue[] = [];
  const seen = new Set<number>();

  for (const pattern of FN_PATTERNS) {
    pattern.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = pattern.exec(code)) !== null) {
      const openBrace = code.indexOf('{', m.index + m[0].length);
      if (openBrace === -1 || seen.has(openBrace)) {
        continue;
      }
      seen.add(openBrace);
      const span = braceSpanLines(code, openBrace);
      if (span !== null && span.lines > LONG_THRESHOLD) {
        const id = makeIssueId(PLUGIN, 'longFn', span.startLine, `${m.index}`);
        issues.push({
          id,
          message: `Function body spans about ${span.lines} lines (heuristic). Consider splitting for readability.`,
          severity: 'info',
          line: span.startLine,
        });
      }
    }
  }
  return issues;
}

function braceSpanLines(
  code: string,
  startBrace: number
): { startLine: number; lines: number } | null {
  let depth = 0;
  let end = -1;
  for (let i = startBrace; i < code.length; i++) {
    const c = code[i];
    if (c === '{') {
      depth++;
    } else if (c === '}') {
      depth--;
      if (depth === 0) {
        end = i;
        break;
      }
    }
  }
  if (end === -1) {
    return null;
  }
  const startLine = lineNumberAtIndex(code, startBrace);
  const endLine = lineNumberAtIndex(code, end);
  return { startLine, lines: endLine - startLine + 1 };
}

export function createLongFunctionPlugin(): AnalyzerPlugin {
  return { name: PLUGIN, run };
}
