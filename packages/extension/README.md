# `@bughunter/extension`

**VS Code extension host** for Bug Hunter: activation, commands, dependency injection, event bus, file hooks, state management, bug mapping, and the **sidebar webview** bridge.

## Responsibilities

| Area          | Location (overview)                                    |
| ------------- | ------------------------------------------------------ |
| Lifecycle     | `src/extension.ts`                                     |
| Commands      | `src/commands/registerCommands.ts`                     |
| DI            | `src/di/container.ts`                                  |
| Events        | `src/bus/eventBus.ts`                                  |
| File analysis | `src/files/fileHooks.ts` + `@bughunter/analyzers`      |
| Game state    | `src/state/stateManager.ts` + `@bughunter/game-engine` |
| Bugs          | `src/game/bugMapper.ts`, `mergeSpawnedBugs.ts`         |
| Webview       | `src/webview/BugHunterViewProvider.ts`                 |

## Commands

| Command                       | Description                 |
| ----------------------------- | --------------------------- |
| `Bug Hunter: Refresh Webview` | Reloads the sidebar webview |

## Configuration

| Setting                        | Type    | Default | Description                          |
| ------------------------------ | ------- | ------- | ------------------------------------ |
| `bugHunter.fileHooksEnabled`   | boolean | `true`  | Enable/disable file analysis hooks   |
| `bugHunter.fileHookDebounceMs` | number  | `500`   | Debounce for file change events (ms) |

## Build

From the **repository root** (recommended):

```bash
npm install
npm run build
```

This runs `esbuild` for the extension bundle and **copies** the webview production build into `media/webview/`.

## Development

Press **F5** or use **Run Extension** in VS Code ([`.vscode/launch.json`](../../.vscode/launch.json)).

## Requirements

- VS Code >= 1.85.0

## See also

- [Webview](../webview/README.md) — UI bundled into this package.
- [Shared](../shared/README.md) — message contracts.
- [Root README](../../README.md) — monorepo overview.
