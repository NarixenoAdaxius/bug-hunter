import type { Issue } from '@bughunter/shared';

/** Input passed to the analyzer pipeline (e.g. from a document or test fixture). */
export type AnalyzeInput = {
  code: string;
  /** When set, JS-oriented rules no-op for non-JS/TS languages. */
  languageId?: string;
};

export interface AnalyzerPlugin {
  name: string;
  run(input: AnalyzeInput): Issue[];
}

export type { Issue };
