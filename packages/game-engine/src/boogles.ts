import type { Bug } from '@bughunter/shared';
import { xpForDefeatingBug } from './rewards.js';

/** Boogles earned when a bug is defeated (soft currency for the cosmetic store). */
export function booglesForDefeatingBug(bug: Bug): number {
  const xp = xpForDefeatingBug(bug);
  return Math.max(1, Math.floor(xp * 0.45));
}
