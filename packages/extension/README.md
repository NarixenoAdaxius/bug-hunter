# Bug Hunter — extension host (`bug-hunter`)

**VS Code extension host** for Bug Hunter: activation, commands, dependency injection, event bus, file hooks, **workspace crawler**, state management, bug mapping, **real-combat attack flow** (navigate-to-file + fix watcher), **per-workspace state persistence**, and the **sidebar webview** bridge.

The npm workspace package name is **`bug-hunter`** (not scoped) because the VS Code extension manifest must use an unscoped `name` for **`vsce` / `.vsix`** packaging.

## Responsibilities

| Area           | Location (overview)                                                     |
| -------------- | ----------------------------------------------------------------------- |
| Lifecycle      | `src/extension.ts`                                                      |
| Commands       | `src/commands/registerCommands.ts`                                      |
| DI             | `src/di/container.ts`                                                   |
| Events         | `src/bus/eventBus.ts`                                                   |
| Workspace scan | `src/workspace/` (`WorkspaceCrawler`, `WorkspaceIssueIndex`)            |
| File hooks     | `src/files/fileHooks.ts` (live buffer refresh when enabled)             |
| Analysis       | `@bughunter/analyzers` from disk buffers + open documents               |
| Game state     | `src/state/stateManager.ts` + `@bughunter/game-engine`                  |
| Bugs           | `src/game/bugMapper.ts`, `mergeSpawnedBugs.ts`                          |
| Attack + watch | `src/di/container.ts` — open file, set fighting, watcher marks defeated |
| Persistence    | `context.workspaceState` — per-workspace AppState via debounced writes  |
| Webview        | `src/webview/BugHunterViewProvider.ts`                                  |

## Commands

| Command                        | Description                                  |
| ------------------------------ | -------------------------------------------- |
| `Bug Hunter: Refresh Webview`  | Reloads the sidebar webview                  |
| `Bug Hunter: Rescan workspace` | Full workspace crawl (`findFiles` + analyze) |

## Configuration

| Setting                               | Type    | Default                        | Description                                   |
| ------------------------------------- | ------- | ------------------------------ | --------------------------------------------- |
| `bugHunter.fileHooksEnabled`          | boolean | `true`                         | Master toggle for debounced open/change hooks |
| `bugHunter.fileHookDebounceMs`        | number  | `500`                          | Debounce (ms) for hook events                 |
| `bugHunter.workspaceScanEnabled`      | boolean | `true`                         | Crawl workspace vs. active-file-only mode     |
| `bugHunter.workspaceScanInclude`      | string  | `**/*.{js,cjs,mjs,jsx,ts,tsx}` | `findFiles` include glob                      |
| `bugHunter.workspaceScanExclude`      | string  | `""`                           | Extra comma-separated path fragments to skip  |
| `bugHunter.workspaceMaxFileSizeBytes` | number  | `524288`                       | Skip larger files                             |
| `bugHunter.workspaceScanConcurrency`  | number  | `6`                            | Parallel file analyses                        |
| `bugHunter.workspaceMaxUiIssues`      | number  | `500`                          | Max issues shown (by severity)                |
| `bugHunter.workspaceLiveBuffers`      | boolean | `true`                         | Hooks update open buffers while scan is on    |

## Build

From the **repository root** (recommended):

```bash
npm install
npm run build
```

This runs `esbuild` for the extension bundle and **copies** the webview production build into `media/webview/`.

## Pack `.vsix`

From the **repository root**:

```bash
npm run package
```

Or `./scripts/package` (use `chmod +x scripts/package` once if needed). Same as `npm run vsix`.

Produces **`bug-hunter-<version>.vsix`** at the monorepo root. Install via VS Code **Extensions: Install from VSIX…**. Uses `--no-dependencies` because the extension entrypoint is a single **`out/extension.js`** bundle.

## Development

Press **F5** or use **Run Extension** in VS Code ([`.vscode/launch.json`](../../.vscode/launch.json)).

## Requirements

- VS Code >= 1.85.0

## See also

- [Webview](../webview/README.md) — UI bundled into this package.
- [Shared](../shared/README.md) — message contracts.
- [Root README](../../README.md) — monorepo overview.
