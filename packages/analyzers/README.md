# `@bughunter/analyzers`

**Static analysis** for Bug Hunter: a small **orchestrator** plus **pluggable rules** that scan source text and emit [`Issue`](../shared/src/index.ts) values. No UI and no VS Code imports.

## Architecture

- **`orchestrate` / `analyze`** — Run the built-in plugin pipeline over `AnalyzeInput` (source, language id, optional path).
- **`builtInPlugins`** — Default rules registered by the orchestrator.
- **Rules** (`src/rules/`) — Each rule is an `AnalyzerPlugin`: e.g. cyclomatic complexity, deep nesting, duplicate lines, hardcoded secrets, long functions, nested loops, `console.log`, `unsafeEval`.

## Adding a rule

1. Implement `AnalyzerPlugin` in `src/rules/<name>.ts` (see existing files).
2. Export a factory (e.g. `createMyRulePlugin`) and register it in [orchestrator.ts](src/orchestrator.ts) / `builtInPlugins` as appropriate.
3. Add tests in [analyzer.test.ts](src/analyzer.test.ts) or a dedicated test file.

## Build & test

```bash
npm run build -w @bughunter/analyzers
npm test -w @bughunter/analyzers
```

## See also

- [Shared](../shared/README.md) — `Issue` shape.
- [Extension](../extension/README.md) — wires the orchestrator to file hooks and bug spawning.
