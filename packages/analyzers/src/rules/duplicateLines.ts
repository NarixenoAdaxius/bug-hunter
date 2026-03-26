import type { Issue } from '@bughunter/shared';
import type { AnalyzeInput, AnalyzerPlugin } from '../types.js';
import { makeIssueId } from '../issueId.js';

const PLUGIN = 'duplicateLines';

const MIN_LEN = 12;
const TRIVIAL = /^\s*[{}[\]\s;,:]*$/;

function run(input: AnalyzeInput): Issue[] {
  const lines = input.code.split(/\r?\n/);
  const byText = new Map<string, number[]>();

  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t.length < MIN_LEN || TRIVIAL.test(t)) {
      continue;
    }
    const list = byText.get(t);
    if (list) {
      list.push(i + 1);
    } else {
      byText.set(t, [i + 1]);
    }
  }

  const issues: Issue[] = [];
  for (const [text, lineNos] of byText) {
    if (lineNos.length < 2) {
      continue;
    }
    const first = lineNos[0];
    const id = makeIssueId(PLUGIN, 'dup', first, shortSnippet(text));
    issues.push({
      id,
      message: `Similar or duplicate line appears ${lineNos.length} times (lines ${lineNos.join(', ')}). Consider extracting a helper.`,
      severity: 'info',
      line: first,
    });
  }
  return issues;
}

function shortSnippet(s: string): string {
  return s.length > 80 ? s.slice(0, 80) : s;
}

export function createDuplicateLinesPlugin(): AnalyzerPlugin {
  return { name: PLUGIN, run };
}
