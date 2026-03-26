# Bug Hunter

A gamified developer intelligence platform for VS Code that turns code analysis into an interactive, turn-based combat experience in the sidebar.

## Documentation

| Document                   | Description                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------ |
| **[spec.md](spec.md)**     | Full product specification (vision, architecture, modules).                          |
| **[AGENTS.md](AGENTS.md)** | Multi-agent tracks, package ownership, integration rules, shared contract changelog. |
| **Package READMEs**        | Each workspace under `packages/*` has its own `README.md` (scope, build, links).     |

### Package index

| Package                  | Path                                         | Role                                   |
| ------------------------ | -------------------------------------------- | -------------------------------------- |
| `@bughunter/shared`      | [packages/shared](packages/shared)           | Types and extension ↔ webview messages |
| `@bughunter/extension`   | [packages/extension](packages/extension)     | VS Code extension host                 |
| `@bughunter/webview`     | [packages/webview](packages/webview)         | React + Tailwind sidebar UI            |
| `@bughunter/analyzers`   | [packages/analyzers](packages/analyzers)     | Analysis orchestrator and rules        |
| `@bughunter/game-engine` | [packages/game-engine](packages/game-engine) | Combat, XP, progression (pure TS)      |
| `@bughunter/ai`          | [packages/ai](packages/ai)                   | AI provider interface + stub           |
| `@bughunter/cpp-engine`  | [packages/cpp-engine](packages/cpp-engine)   | Optional N-API native analyzer         |

## Overview

Bug Hunter analyzes your code in real time, spawns **bugs** from detected issues, and lets you fight them in turn-based combat — all inside a VS Code sidebar webview.

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

1. **File hooks** detect when you open or edit a file (debounced).
2. The **analyzer** scans JS/TS-like sources and emits **issues**.
3. Issues become **bugs** with stats (HP, attack, defense, rarity).
4. You **attack** bugs in the sidebar; the **game engine** resolves turns, XP, and level-ups.
5. State and **combat log** updates flow to the webview via typed messages from `@bughunter/shared`.

## License

MIT — see [LICENSE](LICENSE).

## Repository

Upstream: `https://github.com/NarixenoAdaxius/bug-hunter`
