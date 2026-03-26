import type { Bug, BugRarity } from '@bughunter/shared';

const RARITY_XP: Record<BugRarity, number> = {
  common: 10,
  rare: 25,
  epic: 60,
  boss: 150,
};

function severityMultiplier(severity: Bug['issue']['severity']): number {
  switch (severity) {
    case 'error':
      return 1.2;
    case 'warning':
      return 1;
    case 'info':
      return 0.8;
  }
}

/** Base XP for defeating a bug, before severity modifier. */
export function baseXpForBugRarity(rarity: BugRarity): number {
  return RARITY_XP[rarity];
}

/** Total XP award for defeating this bug (rarity base × issue severity). */
export function xpForDefeatingBug(bug: Bug): number {
  const base = baseXpForBugRarity(bug.rarity);
  return Math.floor(base * severityMultiplier(bug.issue.severity));
}
