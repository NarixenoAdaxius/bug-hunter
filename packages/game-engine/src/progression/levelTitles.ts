/**
 * Level-up title milestones — append rows to add new titles (sorted by level is conventional).
 * Used by `rewardsForLevelRange` in `levelUpRewards.ts`.
 */
export type LevelTitleMilestone = { readonly level: number; readonly title: string };

export const LEVEL_TITLE_MILESTONES: readonly LevelTitleMilestone[] = [
  { level: 3, title: 'Apprentice Debugger' },
  { level: 5, title: 'Patch Pilot' },
  { level: 8, title: 'Merge Main Character' },
  { level: 10, title: 'Production Whisperer' },
  { level: 15, title: 'Heisenbug Hunter' },
  { level: 20, title: 'Legend of the CI Green' },
];

/** Built once — O(1) lookup by level when processing level-ups. */
export function buildTitleAtLevelMap(
  milestones: readonly LevelTitleMilestone[]
): ReadonlyMap<number, string> {
  const m = new Map<number, string>();
  for (const row of milestones) {
    m.set(row.level, row.title);
  }
  return m;
}
