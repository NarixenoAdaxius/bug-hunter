# Multi-agent development — Bug Hunter

Product spec: [spec.md](./spec.md).

## Tracks and ownership

| Track                              | Scope                                                           | Primary directories                                                    |
| ---------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------- |
| **1 — Extension core + messaging** | Activation, commands, DI, event bus, file hooks, webview bridge | [packages/extension](packages/extension)                               |
| **2 — UI**                         | Sidebar webview, React, Tailwind                                | [packages/webview](packages/webview)                                   |
| **3 — Analyzer engine**            | Orchestrator, JS rules, plugin interface                        | [packages/analyzers](packages/analyzers)                               |
| **4 — Game engine**                | Combat, XP, progression (pure TS)                               | [packages/game-engine](packages/game-engine)                           |
| **5 — AI + C++**                   | AI provider interface + stub, N-API / native                    | [packages/ai](packages/ai), [packages/cpp-engine](packages/cpp-engine) |

Shared contracts (types, event names, extension ↔ webview messages): **[packages/shared](packages/shared)** — all tracks consume; changes here affect everyone.

## Integration rules

1. **Extension ↔ webview** — Communicate only via typed messages in `@bughunter/shared` (`WebviewToHostMessage`, `HostToWebviewMessage`). Do not invent ad-hoc string payloads without updating `shared` and this document.
2. **UI** — No VS Code API in `packages/webview`; use `vscode.ts` bridge and `postMessage` only.
3. **Game logic** — Keep deterministic, testable code in `packages/game-engine` without VS Code imports.
4. **Analyzers** — No UI; return `Issue[]` and related types from `shared`.
5. **C++** — Keep build output under `packages/cpp-engine/build/` or `native/build/` (gitignored).

## Contract changes (`@bughunter/shared`)

When you add or change exported types, event names, or message shapes:

- Update [packages/shared/src/index.ts](packages/shared/src/index.ts).
- Add a one-line note under **Changelog (shared)** below (date + what changed).

### Changelog (shared)

- 2025-03-24: Documented `GameState.xp` as progress toward next level (not lifetime total).
- 2026-03-24: Added `PlayerCombatStats`, `CombatLogEntry` (with `bugMiss`), `FileAnalyzedPayload`, `EventPayloadMap` to shared. Added `xpToNextLevel` to `GameState`. Added `player` and `combatLog` fields to `AppState`. Added `combatLog` variant to `HostToWebviewMessage`. Extended `userAction` payload with optional `bugId`.
- _Scaffold: initial `AppState`, `Issue`, `Bug`, `WebviewToHostMessage`, `HostToWebviewMessage`._

## Build order

From repo root: `npm run build` — builds `shared` → `game-engine` → `analyzers` → `ai` → `webview` → `extension` (extension copies webview `dist` into `media/webview`).

## Launch

After `npm run build`, use **Run Extension** in VS Code ([.vscode/launch.json](.vscode/launch.json)) or:

`code --extensionDevelopmentPath=/absolute/path/to/packages/extension`
