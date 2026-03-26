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
  let bugSnapshot: Bug = { ...bug };
  let p: PlayerCombatStats = { ...player };
  let state: GameState = { ...gameState };
  const log: CombatLogEntry[] = [];
  let turn = 0;

  while (bugSnapshot.hp > 0 && p.hp > 0 && turn < maxTurns) {
    turn += 1;
    log.push({ kind: 'turnStart', turn });

    const playerSwing = resolvePlayerAttack(p.attack, bugSnapshot, rng, missChance);
    if (playerSwing.miss) {
      log.push({ kind: 'playerMiss', turn });
    } else {
      bugSnapshot = {
        ...bugSnapshot,
        hp: Math.max(0, bugSnapshot.hp - playerSwing.damage),
      };
      log.push({
        kind: 'playerHit',
        turn,
        damage: playerSwing.damage,
        critical: playerSwing.critical,
        bugHpAfter: bugSnapshot.hp,
      });
    }

    if (bugSnapshot.hp <= 0) {
      const xpAwarded = xpForDefeatingBug(bug);
      state = applyXpToGameState(state, xpAwarded);
      log.push({ kind: 'bugDefeated', xpAwarded });
      return {
        gameState: state,
        player: p,
        bug: bugSnapshot,
        victory: true,
        log,
      };
    }

    const bugSwing = resolveBugAttack(bugSnapshot, p, rng, missChance);
    if (bugSwing.miss) {
      log.push({ kind: 'bugMiss', turn });
    } else {
      p = {
        ...p,
        hp: Math.max(0, p.hp - bugSwing.damage),
      };
      log.push({
        kind: 'bugHit',
        turn,
        damage: bugSwing.damage,
        critical: bugSwing.critical,
        playerHpAfter: p.hp,
      });
    }

    if (p.hp <= 0) {
      log.push({ kind: 'playerDefeated' });
      return {
        gameState: state,
        player: p,
        bug: bugSnapshot,
        victory: false,
        log,
      };
    }
  }

  return {
    gameState: state,
    player: p,
    bug: bugSnapshot,
    victory: bugSnapshot.hp <= 0,
    log,
  };
}

/** Alias for {@link simulateEncounter}. */
export const runCombat = simulateEncounter;
