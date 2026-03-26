import type { Bug } from '@bughunter/shared';

/** Critical hit probability (spec: 10%). */
export const CRITICAL_CHANCE = 0.1;

/**
 * Core hit damage: `(attack - defense) + roll(5–15)`; crit applies 1.5× to the `(attack - defense)` term
 * before adding the roll (spec names crit and random band; crit multiplier is engine convention).
 */
export function computeHitDamage(
  attackerAttack: number,
  targetDefense: number,
  rng: () => number = Math.random
): { damage: number; critical: boolean } {
  const critical = rng() < CRITICAL_CHANCE;
  const base = Math.max(0, attackerAttack - targetDefense);
  const roll = 5 + Math.floor(rng() * 11);
  const damage = critical ? Math.floor(base * 1.5) + roll : base + roll;
  return { damage, critical };
}

/**
 * Player attacks a bug — same formula as {@link computeHitDamage} using the bug's defense.
 */
export function calculateDamage(
  playerAttack: number,
  bug: Pick<Bug, 'defense'>,
  rng: () => number = Math.random
): { damage: number; critical: boolean } {
  return computeHitDamage(playerAttack, bug.defense, rng);
}

/** @deprecated Use {@link calculateDamage} instead. */
export const calculateDamageStub = calculateDamage;
