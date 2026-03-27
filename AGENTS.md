# Multi-agent development — Bug Hunter

Product spec: [spec.md](./spec.md).

## Documentation map

| Resource                                                           | Purpose                                                    |
| ------------------------------------------------------------------ | ---------------------------------------------------------- |
| [README.md](./README.md)                                           | Install, build, run, `.vsix` packaging, CI, package index  |
| [spec.md](./spec.md)                                               | Full product specification                                 |
| This file (`AGENTS.md`)                                            | Tracks, ownership, integration rules, **shared changelog** |
| [packages/shared/README.md](./packages/shared/README.md)           | Contract types and messages                                |
| [packages/extension/README.md](./packages/extension/README.md)     | Extension host, commands, settings                         |
| [packages/webview/README.md](./packages/webview/README.md)         | Sidebar UI bridge rules                                    |
| [packages/analyzers/README.md](./packages/analyzers/README.md)     | Orchestrator and rules                                     |
| [packages/game-engine/README.md](./packages/game-engine/README.md) | Combat and progression                                     |
| [packages/ai/README.md](./packages/ai/README.md)                   | AI provider stub                                           |
| [packages/cpp-engine/README.md](./packages/cpp-engine/README.md)   | Optional native N-API module                               |

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
2. **UI** — No VS Code API in `packages/webview`; use `vscode.ts` bridge and `postMessage` only. The webview may import `@bughunter/game-engine` for **read-only** catalog or display helpers (e.g. store item metadata, `findStoreItem`); purchases, equips, and progression still run in the extension using engine APIs and shared messages.
3. **Game logic** — Keep deterministic, testable code in `packages/game-engine` without VS Code imports.
4. **Analyzers** — No UI; return `Issue[]` and related types from `shared`.
5. **C++** — Keep build output under `packages/cpp-engine/build/` or `native/build/` (gitignored).

## Contract changes (`@bughunter/shared`)

When you add or change exported types, event names, or message shapes:

- Update [packages/shared/src/index.ts](packages/shared/src/index.ts).
- Add a one-line note under **Changelog (shared)** below (date + what changed).

### Changelog (shared)

- 2026-03-27: Added `CompanionPanelMode`, `SidebarUiVisibility`, `DEFAULT_SIDEBAR_UI_VISIBILITY`, and optional `uiVisibility` on `stateUpdate` payloads for sidebar feature toggles.
- 2025-03-24: Documented `GameState.xp` as progress toward next level (not lifetime total).
- 2026-03-26: Added `BugStatus`, `Bug.status`, `Bug.defeatedAt`, `defeatedBugs` to `AppState`, `ActivityLogEntry` type, `activityLog` variant to `HostToWebviewMessage`. Attack now opens file instead of running simulated combat.
- 2026-03-27: Added `CosmeticsState`, `DEFAULT_COSMETICS`, `cosmetics` on `AppState`, `booglesAwarded` and `levelUp` on `ActivityLogEntry`, and `cosmeticAction` on `WebviewToHostMessage` for the Boogles store (pets, avatars, borders, panel themes).
- 2026-03-26: Extended `Issue` with optional `sourceUri`, `fileLabel` for workspace-scoped analysis UI.
- 2026-03-24: Added `PlayerCombatStats`, `CombatLogEntry` (with `bugMiss`), `FileAnalyzedPayload`, `EventPayloadMap` to shared. Added `xpToNextLevel` to `GameState`. Added `player` and `combatLog` fields to `AppState`. Added `combatLog` variant to `HostToWebviewMessage`. Extended `userAction` payload with optional `bugId`.
- _Scaffold: initial `AppState`, `Issue`, `Bug`, `WebviewToHostMessage`, `HostToWebviewMessage`._

## Build order

From repo root: `npm run build` — builds `shared` → `game-engine` → `analyzers` → `ai` → `webview` → `extension` (extension copies webview `dist` into `media/webview`).

## Launch

After `npm run build`, use **Run Extension** in VS Code ([.vscode/launch.json](.vscode/launch.json)) or:

`code --extensionDevelopmentPath=/absolute/path/to/packages/extension`

**Packaged install:** the extension workspace npm name is `bug-hunter` (required for valid `vsce` manifests). From repo root, `npm run package` (or `npm run vsix`, or `./scripts/package`) writes `bug-hunter-<version>.vsix` at the repository root; install with **Extensions: Install from VSIX…**. The extension crawls the workspace for JS/TS by default; use **Bug Hunter: Rescan workspace** after changing scan settings or to refresh on demand.
