import type {
  AiProvider,
  ExplainBugRequest,
  ExplainBugResponse,
  ExplainCodeRequest,
  ExplainCodeResponse,
} from './types.js';

export class StubAiProvider implements AiProvider {
  readonly name = 'stub';

  async explainCode(_request: ExplainCodeRequest): Promise<ExplainCodeResponse> {
    return {
      summary: 'AI provider not configured. Set up an API key in settings to enable explanations.',
    };
  }

  async explainBug(_request: ExplainBugRequest): Promise<ExplainBugResponse> {
    return {
      explanation: 'AI provider not configured.',
      impact: 'Unknown — enable AI for detailed analysis.',
    };
  }
}
