# `@bughunter/webview`

**Sidebar UI** for Bug Hunter: React 18, Tailwind CSS, Vite. Runs inside a VS Code webview; it has **no** access to the VS Code API except through the host.

## Responsibilities

- Render game state: Bug Arena (idle/fighting bugs), Defeated Archive, Issues panel, Activity Log, Dashboard.
- Send user intent to the extension via typed [`WebviewToHostMessage`](../shared/src/index.ts) (`ready`, `userAction`).
- Apply incoming [`HostToWebviewMessage`](../shared/src/index.ts) (`stateUpdate`, `activityLog`, `combatLog`, `ping`).

## Bridge

All host communication goes through [src/vscode.ts](src/vscode.ts) (acquire `vscode` API from the webview) and `postMessage` — **no** `import 'vscode'` in this package.

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
