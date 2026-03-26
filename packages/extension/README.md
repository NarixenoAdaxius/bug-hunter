# Bug Hunter — VS Code Extension

A gamified code analysis extension that turns detected issues into bugs you fight in a turn-based RPG combat system.

## Features

- **Real-time analysis** — Scans files on open and edit with debounced hooks.
- **Bug arena** — Issues become creatures with HP, attack, defense, and rarity tiers (common, rare, epic, boss).
- **Turn-based combat** — Attack bugs to defeat them; earn XP and level up.
- **Combat log** — Live activity feed of hits, misses, crits, and victories.
- **Sidebar webview** — Full React + Tailwind UI inside the VS Code sidebar.

## Commands

| Command                       | Description                 |
| ----------------------------- | --------------------------- |
| `Bug Hunter: Refresh Webview` | Reloads the sidebar webview |

## Configuration

| Setting                        | Type    | Default | Description                                |
| ------------------------------ | ------- | ------- | ------------------------------------------ |
| `bugHunter.fileHooksEnabled`   | boolean | `true`  | Enable/disable file analysis hooks         |
| `bugHunter.fileHookDebounceMs` | number  | `500`   | Debounce delay for file change events (ms) |

## Development

This package is part of the [Bug Hunter monorepo](../../README.md). Build from the repo root:

```bash
npm install
npm run build
```

Then press **F5** to launch the Extension Development Host.

## Requirements

- VS Code >= 1.85.0
