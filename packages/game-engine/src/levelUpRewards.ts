import { buildTitleAtLevelMap, LEVEL_TITLE_MILESTONES } from './progression/levelTitles.js';

const TITLE_AT_LEVEL = buildTitleAtLevelMap(LEVEL_TITLE_MILESTONES);

/**
 * Bonus Boogles and optional titles when crossing level thresholds.
 * `previousLevel` = level before XP was applied; `newLevel` = level after.
 */
export function rewardsForLevelRange(
  previousLevel: number,
  newLevel: number
): {
  totalBoogles: number;
  title?: string;
} {
  if (newLevel <= previousLevel) {
    return { totalBoogles: 0 };
  }
  let totalBoogles = 0;
  let title: string | undefined;
  for (let L = previousLevel + 1; L <= newLevel; L += 1) {
    totalBoogles += 12 + L * 3;
    const t = TITLE_AT_LEVEL.get(L);
    if (t) title = t;
  }
  return { totalBoogles, title };
}
