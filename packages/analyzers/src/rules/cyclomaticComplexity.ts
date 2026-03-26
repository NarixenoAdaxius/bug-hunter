import type { Issue } from '@bughunter/shared';
import type { AnalyzeInput, AnalyzerPlugin } from '../types.js';
import { isJsLikeLanguage } from '../language.js';
import { makeIssueId } from '../issueId.js';
import { lineNumberAtIndex } from '../utils.js';

const PLUGIN = 'cyclomaticComplexity';
const THRESHOLD = 10;

const BRANCH_KEYWORDS = /\b(if|else\s+if|for|while|do|switch|case|\?\?|&&|\|\|)\b|\?[^?:]/g;
const FN_START = /\bfunction\s*[^(]*\(/g;

function run(input: AnalyzeInput): Issue[] {
  if (!isJsLikeLanguage(input.languageId)) {
    return [];
  }
  const { code } = input;
  const issues: Issue[] = [];

  FN_START.lastIndex = 0;
  let fnMatch: RegExpExecArray | null;
  while ((fnMatch = FN_START.exec(code)) !== null) {
    const openBrace = code.indexOf('{', fnMatch.index + fnMatch[0].length);
    if (openBrace === -1) continue;

    const bodyEnd = findMatchingBrace(code, openBrace);
    if (bodyEnd === -1) continue;

    const body = code.slice(openBrace, bodyEnd + 1);
    let complexity = 1;
    BRANCH_KEYWORDS.lastIndex = 0;
    while (BRANCH_KEYWORDS.exec(body) !== null) {
      complexity++;
    }

    if (complexity > THRESHOLD) {
      const line = lineNumberAtIndex(code, fnMatch.index);
      const id = makeIssueId(PLUGIN, 'cc', line, `${complexity}`);
      issues.push({
        id,
        message: `Cyclomatic complexity of ${complexity} exceeds threshold (${THRESHOLD}). Consider refactoring.`,
        severity: 'warning',
        line,
      });
    }
  }
  return issues;
}

function findMatchingBrace(code: string, start: number): number {
  let depth = 0;
  for (let i = start; i < code.length; i++) {
    if (code[i] === '{') depth++;
    else if (code[i] === '}') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

export function createCyclomaticComplexityPlugin(): AnalyzerPlugin {
  return { name: PLUGIN, run };
}
