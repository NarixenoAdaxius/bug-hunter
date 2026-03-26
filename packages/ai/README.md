# `@bughunter/ai`

**AI provider abstraction** for future features (code explanations, bug explanations, refactors). Ships a **`StubAiProvider`** that returns placeholder content so the rest of the stack can compile and run without external API keys.

## Types

- **`AiProvider`** — Interface for `explainCode` / `explainBug`-style calls (see [types.ts](src/types.ts)).
- **`StubAiProvider`** — No network; deterministic stub responses for development.

## Build

```bash
npm run build -w @bughunter/ai
```

## See also

- [Extension](../extension/README.md) — will construct and inject a real provider when wired.
- [Spec](../../spec.md) — product vision for AI-assisted explanations.
