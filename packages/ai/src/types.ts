import type { Issue } from '@bughunter/shared';

export type ExplainCodeRequest = {
  code: string;
  languageId?: string;
};

export type ExplainCodeResponse = {
  summary: string;
};

export type ExplainBugRequest = {
  issue: Issue;
  code?: string;
};

export type ExplainBugResponse = {
  explanation: string;
  impact: string;
  suggestedFix?: string;
};

export interface AiProvider {
  readonly name: string;
  explainCode(request: ExplainCodeRequest): Promise<ExplainCodeResponse>;
  explainBug(request: ExplainBugRequest): Promise<ExplainBugResponse>;
}
