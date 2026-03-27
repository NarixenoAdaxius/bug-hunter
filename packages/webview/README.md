# `@bughunter/webview`

**Sidebar UI** for Bug Hunter: React 18, Tailwind CSS, Vite. Runs inside a VS Code webview; it has **no** access to the VS Code API except through the host.

## Responsibilities

- Render game state: Dashboard (XP, Boogles), themed shell, optional companion pet, **Boogles store** (dedicated tab + cards when `showStore` is on), Bug Arena, Defeated Archive, Activity Log, Issues panel. Section visibility follows `uiVisibility` on `stateUpdate` (from VS Code `bugHunter.sidebar.*` settings). Store images use `storeAssetUrl()` (extension-injected webview base in production).
- Send user intent via typed [`WebviewToHostMessage`](../shared/src/index.ts): `ready`, `userAction`, `cosmeticAction` (purchase / equip).
- Apply incoming [`HostToWebviewMessage`](../shared/src/index.ts): `stateUpdate` (full `AppState` plus optional `uiVisibility`), `activityLog` (incremental append, optional), `combatLog`, `ping`.

## Bridge

All host communication goes through [src/vscode.ts](src/vscode.ts) (acquire `vscode` API from the webview) and `postMessage` — **no** `import 'vscode'` in this package.

## `@bughunter/game-engine`

This package depends on `game-engine` for **read-only** store catalog data (`ALL_STORE_ITEMS`, `findStoreItem`, `isOwned`) so the UI stays aligned with the authoritative item list. Do not reimplement prices or item ids in the webview.

## Scripts

| Script            | Description                                                                        |
| ----------------- | ---------------------------------------------------------------------------------- |
| `npm run dev`     | Vite dev server (useful for UI iteration; full behavior needs the extension host). |
| `npm run build`   | Typecheck + production bundle to `dist/`.                                          |
| `npm run preview` | Preview the production build locally.                                              |

The extension build copies `dist/` into `packages/extension/media/webview/` (see root `npm run build`).

## Build

```bash
npm run build -w @bughunter/webview
```

## See also

- [Extension](../extension/README.md) — hosts the webview and forwards messages.
- [Shared](../shared/README.md) — message and state types.
