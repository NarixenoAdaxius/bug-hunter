import type { Issue } from '@bughunter/shared';
import type { AnalyzeInput, AnalyzerPlugin } from './types.js';
import { createUnsafeEvalPlugin } from './rules/unsafeEval.js';
import { createNestedLoopsPlugin } from './rules/nestedLoops.js';
import { createLongFunctionPlugin } from './rules/longFunction.js';
import { createDuplicateLinesPlugin } from './rules/duplicateLines.js';
import { createConsoleLogPlugin } from './rules/consoleLog.js';
import { createDeepNestingPlugin } from './rules/deepNesting.js';
import { createCyclomaticComplexityPlugin } from './rules/cyclomaticComplexity.js';
import { createHardcodedSecretsPlugin } from './rules/hardcodedSecrets.js';

export const builtInPlugins: AnalyzerPlugin[] = [
  createUnsafeEvalPlugin(),
  createHardcodedSecretsPlugin(),
  createNestedLoopsPlugin(),
  createDeepNestingPlugin(),
  createCyclomaticComplexityPlugin(),
  createLongFunctionPlugin(),
  createDuplicateLinesPlugin(),
  createConsoleLogPlugin(),
];

function sortKey(issue: Issue): number {
  return issue.line ?? Number.MAX_SAFE_INTEGER;
}

/**
 * Runs plugins in order, merges issues, dedupes by `id`, sorts by line.
 */
export function orchestrate(
  input: AnalyzeInput,
  plugins: AnalyzerPlugin[] = builtInPlugins
): Issue[] {
  if (input.code.trim().length === 0) {
    return [];
  }
  const seen = new Set<string>();
  const out: Issue[] = [];
  for (const plugin of plugins) {
    for (const issue of plugin.run(input)) {
      if (!seen.has(issue.id)) {
        seen.add(issue.id);
        out.push(issue);
      }
    }
  }
  out.sort((a, b) => sortKey(a) - sortKey(b));
  return out;
}

/** Convenience: run the default built-in rule set. */
export function analyze(input: AnalyzeInput): Issue[] {
  return orchestrate(input, builtInPlugins);
}
