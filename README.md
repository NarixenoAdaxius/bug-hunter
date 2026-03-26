# Bug Hunter

A gamified developer intelligence platform for VS Code that turns code analysis into an interactive bug-hunting experience in the sidebar — find bugs, attack them by navigating to the source, fix the code, and watch them fall.

## Documentation

| Document                   | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **[spec.md](spec.md)**     | Full product specification (vision, architecture, modules).                          |
| **[AGENTS.md](AGENTS.md)** | Multi-agent tracks, package ownership, integration rules, shared contract changelog. |
| **Package READMEs**        | Each workspace under `packages/*` has its own `README.md` (scope, build, links).     |

### Package index

| Package                  | Path                                         | Role                                                                      |
| ------------------------ | -------------------------------------------- | ------------------------------------------------------------------------- |
| `@bughunter/shared`      | [packages/shared](packages/shared)           | Types and extension ↔ webview messages                                    |
| `bug-hunter`             | [packages/extension](packages/extension)     | VS Code extension host (unscoped npm name; required for `.vsix` / `vsce`) |
| `@bughunter/webview`     | [packages/webview](packages/webview)         | React + Tailwind sidebar UI                                               |
| `@bughunter/analyzers`   | [packages/analyzers](packages/analyzers)     | Analysis orchestrator and rules                                           |
| `@bughunter/game-engine` | [packages/game-engine](packages/game-engine) | Combat, XP, progression (pure TS)                                         |
| `@bughunter/ai`          | [packages/ai](packages/ai)                   | AI provider interface + stub                                              |
| `@bughunter/cpp-engine`  | [packages/cpp-engine](packages/cpp-engine)   | Optional N-API native analyzer                                            |

## Overview

Bug Hunter scans your workspace for code issues, spawns **bugs** from them, and lets you hunt them down by navigating to the source and fixing the code — all tracked inside a VS Code sidebar webview with XP, levels, and a defeated archive.

## Monorepo layout

npm **workspaces** (`packages/*`). The **build order** is fixed: `shared` → `game-engine` → `analyzers` → `ai` → `webview` → `extension` (extension copies the webview `dist` into `media/webview`).

## Getting started

### Prerequisites

- Node.js >= 18
- npm >= 10

### Install and build

```bash
npm install
npm run build
```

### Run the extension

1. Open this repository in VS Code.
2. Press **F5** or use **Run Extension** ([.vscode/launch.json](.vscode/launch.json)).
3. In the Extension Development Host, open the Bug Hunter view from the activity bar.

CLI alternative:

```bash
code --extensionDevelopmentPath=/absolute/path/to/packages/extension
```

### Pack a `.vsix` (installable build)

From the repository root:

```bash
npm run package
```

Same as `npm run vsix`. You can also run the repo script directly (executable after clone: `chmod +x scripts/package`):

```bash
./scripts/package
```

Writes **`bug-hunter-<version>.vsix`** at the repo root (gitignored). In VS Code: **Extensions: Install from VSIX…** and select that file.

### Quality checks

```bash
npm run lint
npm run format:check
npm run format
npm test
```

### Continuous integration

[.github/workflows/ci.yml](.github/workflows/ci.yml) runs on pushes and pull requests to `main`: install, build, lint, Prettier check, and tests (Node 18, 20, 22).

## How it works

1. **Workspace scan** (default): on load, after folder changes, and on save, the extension discovers matching files with `vscode.workspace.findFiles`, reads them with `workspace.fs` (works over Remote-SSH), and runs the **analyzer** on each file. Issues are merged across the repo (with a configurable UI cap). This is **not** the VS Code Problems list (e.g. ESLint / Markdownlint live diagnostics).
2. **Live buffers** (optional): debounced **file hooks** refresh the slice for files you are editing when “workspace live buffers” is enabled.
3. Issues become **bugs** with stats (attack, defense, rarity); Insights shows **file paths** when present.
4. **Attack = navigate to bug**: clicking Attack opens the file at the issue line and sets the bug to "fighting" status. Fix the code; on save the watcher re-analyzes and automatically marks the bug **defeated** once the issue disappears, awarding XP.
5. **Defeated archive**: defeated bugs move out of the Bug Arena into a collapsible Defeated section.
6. **Per-workspace state**: game progress, bugs, and defeated archive persist per workspace via VS Code `workspaceState` — each project has its own independent Bug Hunter session.
7. Activity log and state updates flow to the webview via typed messages from `@bughunter/shared`.

Use the command **Bug Hunter: Rescan workspace** for a full crawl on demand. Tune globs and limits under **Settings → Bug Hunter** (workspace include/exclude, max file size, concurrency, max issues in UI).

## License

MIT — see [LICENSE](LICENSE).

## Repository

Upstream: `https://github.com/NarixenoAdaxius/bug-hunter`
