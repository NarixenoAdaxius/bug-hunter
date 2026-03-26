# `@bughunter/game-engine`

**Deterministic game rules** in pure TypeScript: combat resolution, damage, XP progression, rewards, encounters, and optional achievements. **No** VS Code, React, or file I/O.

## Public API (overview)

| Module              | Role                                                                                                      |
| ------------------- | --------------------------------------------------------------------------------------------------------- |
| `damage` / `combat` | Hit/miss, crits, player vs bug attacks (`resolvePlayerAttack`, `resolveBugAttack`, `calculateDamage`, …). |
| `progression`       | Level-ups: `applyXpToGameState`, `xpRequiredToLevelUp`.                                                   |
| `rewards`           | XP for defeating bugs by rarity.                                                                          |
| `encounter`         | `runCombat`, `simulateEncounter` — full turn loops producing `CombatLogEntry` sequences.                  |
| `achievements`      | `BUILT_IN_ACHIEVEMENTS`, `checkAchievements` — side-effect-free checks.                                   |

Types like `CombatLogEntry` and `PlayerCombatStats` are aligned with [`@bughunter/shared`](../shared/README.md); the engine may re-export compatible shapes for consumers.

## Build & test

```bash
npm run build -w @bughunter/game-engine
npm test -w @bughunter/game-engine
```

## See also

- [Shared](../shared/README.md) — `GameState`, `CombatLogEntry` contract with the UI.
- [Extension](../extension/README.md) — integrates engine results into `AppState`.
