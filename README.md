# Bug Hunter

A gamified developer intelligence platform for VS Code that transforms code analysis into an interactive, turn-based combat experience.

## Overview

Bug Hunter analyzes your code in real time, spawns bugs based on detected issues, and lets you fight them in a turn-based RPG-style combat system — all inside a VS Code sidebar.

## Monorepo Structure

| Package                | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| `packages/shared`      | Shared types, message contracts, and event definitions        |
| `packages/extension`   | VS Code extension core — activation, commands, webview bridge |
| `packages/webview`     | React + Tailwind sidebar UI                                   |
| `packages/analyzers`   | Code analysis rules and orchestrator                          |
| `packages/game-engine` | Combat, XP, progression (pure TS, deterministic)              |
| `packages/ai`          | AI provider interface and stub                                |
| `packages/cpp-engine`  | Optional C++ N-API module for high-performance analysis       |

## Getting Started

### Prerequisites

- Node.js >= 18
- npm >= 10

### Install & Build

```bash
npm install
npm run build
```

The build script compiles packages in dependency order: `shared` -> `game-engine` -> `analyzers` -> `ai` -> `webview` -> `extension`.

### Run in Development

1. Open this repo in VS Code.
2. Press **F5** (or use the **Run Extension** launch configuration).
3. The Bug Hunter sidebar appears in the activity bar of the Extension Development Host.

### Lint & Format

```bash
npm run lint
npm run format:check
npm run format
```

## How It Works

1. **File hooks** detect when you open or edit a file.
2. The **analyzer engine** scans the code for issues (complexity, security, code smells).
3. Issues are transformed into **bugs** with HP, attack, defense, and rarity.
4. You **attack bugs** in the sidebar arena — turn-based combat with crits, misses, and XP rewards.
5. Defeat bugs to **level up** and track your progress.

## License

MIT — see [LICENSE](LICENSE).
