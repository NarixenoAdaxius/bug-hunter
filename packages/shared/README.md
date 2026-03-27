# `@bughunter/shared`

Shared **domain types** and **extension ↔ webview message contracts**. Every workspace package depends on this layer; changes here ripple through the whole monorepo.

## Contents

| Area         | Description                                                                                                                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Domain**   | `Issue`, `Bug`, `BugStatus`, `BugRarity`, `GameState`, `AppState`, `PlayerCombatStats`, `CosmeticsState`, `SidebarUiVisibility`, `CompanionPanelMode`, `ActivityLogEntry`, `CombatLogEntry`, `Settings`, `SessionStats` |
| **Events**   | `BugHunterEvent`, `EventPayloadMap`, `BUG_HUNTER_EVENTS` — typed payloads for the extension event bus                                                                                                                   |
| **Messages** | `WebviewToHostMessage`, `HostToWebviewMessage` — the only shapes allowed over the webview `postMessage` bridge                                                                                                          |

## Rules

- Do **not** import VS Code, React, or analyzer internals here — keep types serializable and UI-agnostic.
- When you add or change exports, update [AGENTS.md](../../AGENTS.md) **Changelog (shared)** and any consumers in extension/webview.

## Build

```bash
npm run build -w @bughunter/shared
```

From the repo root, `npm run build` compiles `shared` first.

## See also

- [Extension](../extension/README.md) — consumes messages and pushes `AppState` updates to the webview.
- [Webview](../webview/README.md) — sends `WebviewToHostMessage`, receives `HostToWebviewMessage`.
