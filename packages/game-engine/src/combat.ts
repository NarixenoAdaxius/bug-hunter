import type { Bug } from '@bughunter/shared';
import { computeHitDamage } from './damage.js';
import type { PlayerCombatStats } from './types.js';

/** Default miss chance for a player attack (spec: miss chance). */
export const DEFAULT_MISS_CHANCE = 0.1;

export type PlayerAttackResult =
  | { miss: true; hit: false; damage: 0; critical: false }
  | { miss: false; hit: true; damage: number; critical: boolean };

/**
 * Resolve one player swing: miss roll first; on hit, damage uses the same RNG stream order as
 * {@link computeHitDamage} (crit, then roll).
 */
export function resolvePlayerAttack(
  playerAttack: number,
  bug: Pick<Bug, 'defense'>,
  rng: () => number,
  missChance: number = DEFAULT_MISS_CHANCE
): PlayerAttackResult {
  if (rng() < missChance) {
    return { miss: true, hit: false, damage: 0, critical: false };
  }
  const { damage, critical } = computeHitDamage(playerAttack, bug.defense, rng);
  return { miss: false, hit: true, damage, critical };
}

/** Bug strikes the player (symmetric formula). */
export function resolveBugAttack(
  bug: Pick<Bug, 'attack'>,
  player: Pick<PlayerCombatStats, 'defense'>,
  rng: () => number,
  missChance: number = DEFAULT_MISS_CHANCE
): PlayerAttackResult {
  if (rng() < missChance) {
    return { miss: true, hit: false, damage: 0, critical: false };
  }
  const { damage, critical } = computeHitDamage(bug.attack, player.defense, rng);
  return { miss: false, hit: true, damage, critical };
}
