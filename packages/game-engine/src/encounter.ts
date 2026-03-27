import type { Bug, GameState } from '@bughunter/shared';
import { DEFAULT_MISS_CHANCE, resolveBugAttack, resolvePlayerAttack } from './combat.js';
import { applyXpToGameState } from './progression.js';
import { xpForDefeatingBug } from './rewards.js';
import type { CombatLogEntry, PlayerCombatStats } from './types.js';

export type EncounterOptions = {
  /** Override default miss chance for both sides (default 10%). */
  missChance?: number;
  /** Maximum number of turns before the encounter ends as a draw (default 200). */
  maxTurns?: number;
};

export type EncounterResult = {
  gameState: GameState;
  player: PlayerCombatStats;
  bug: Bug;
  victory: boolean;
  log: CombatLogEntry[];
};

type TurnState = {
  bug: Bug;
  player: PlayerCombatStats;
  gameState: GameState;
  log: CombatLogEntry[];
  /** Truthy when the encounter ended during this turn. */
  result?: EncounterResult;
};

function applyPlayerTurn(
  ts: TurnState,
  turn: number,
  rng: () => number,
  missChance: number,
  originalBug: Bug
): void {
  const swing = resolvePlayerAttack(ts.player.attack, ts.bug, rng, missChance);
  if (swing.miss) {
    ts.log.push({ kind: 'playerMiss', turn });
    return;
  }
  ts.bug = { ...ts.bug, hp: Math.max(0, ts.bug.hp - swing.damage) };
  ts.log.push({
    kind: 'playerHit',
    turn,
    damage: swing.damage,
    critical: swing.critical,
    bugHpAfter: ts.bug.hp,
  });

  if (ts.bug.hp <= 0) {
    const xpAwarded = xpForDefeatingBug(originalBug);
    ts.gameState = applyXpToGameState(ts.gameState, xpAwarded);
    ts.log.push({ kind: 'bugDefeated', xpAwarded });
    ts.result = {
      gameState: ts.gameState,
      player: ts.player,
      bug: ts.bug,
      victory: true,
      log: ts.log,
    };
  }
}

function applyBugTurn(ts: TurnState, turn: number, rng: () => number, missChance: number): void {
  const swing = resolveBugAttack(ts.bug, ts.player, rng, missChance);
  if (swing.miss) {
    ts.log.push({ kind: 'bugMiss', turn });
    return;
  }
  ts.player = { ...ts.player, hp: Math.max(0, ts.player.hp - swing.damage) };
  ts.log.push({
    kind: 'bugHit',
    turn,
    damage: swing.damage,
    critical: swing.critical,
    playerHpAfter: ts.player.hp,
  });

  if (ts.player.hp <= 0) {
    ts.log.push({ kind: 'playerDefeated' });
    ts.result = {
      gameState: ts.gameState,
      player: ts.player,
      bug: ts.bug,
      victory: false,
      log: ts.log,
    };
  }
}

/**
 * Turn-based fight: player acts first each round, then the bug if still alive.
 * On victory, applies XP via {@link applyXpToGameState} and {@link xpForDefeatingBug}.
 */
export function simulateEncounter(
  gameState: GameState,
  player: PlayerCombatStats,
  bug: Bug,
  rng: () => number,
  options?: EncounterOptions
): EncounterResult {
  const missChance = options?.missChance ?? DEFAULT_MISS_CHANCE;
  const maxTurns = options?.maxTurns ?? 200;
  const ts: TurnState = {
    bug: { ...bug },
    player: { ...player },
    gameState: { ...gameState },
    log: [],
  };

  for (let turn = 1; ts.bug.hp > 0 && ts.player.hp > 0 && turn <= maxTurns; turn++) {
    ts.log.push({ kind: 'turnStart', turn });

    applyPlayerTurn(ts, turn, rng, missChance, bug);
    if (ts.result) return ts.result;

    applyBugTurn(ts, turn, rng, missChance);
    if (ts.result) return ts.result;
  }

  return {
    gameState: ts.gameState,
    player: ts.player,
    bug: ts.bug,
    victory: ts.bug.hp <= 0,
    log: ts.log,
  };
}

/** Alias for {@link simulateEncounter}. */
export const runCombat = simulateEncounter;
