import type { GameState, SessionStats } from '@bughunter/shared';

export type Achievement = {
  id: string;
  name: string;
  description: string;
  check: (stats: AchievementContext) => boolean;
};

export type AchievementContext = {
  game: GameState;
  session: SessionStats;
  totalBugsDefeated: number;
  fastestKillMs?: number;
};

export type UnlockedAchievement = {
  id: string;
  name: string;
  description: string;
  unlockedAt: number;
};

export const BUILT_IN_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-blood',
    name: 'First Blood',
    description: 'Defeat your first bug.',
    check: (ctx) => ctx.totalBugsDefeated >= 1,
  },
  {
    id: 'bug-slayer',
    name: 'Bug Slayer',
    description: 'Defeat 100 bugs.',
    check: (ctx) => ctx.totalBugsDefeated >= 100,
  },
  {
    id: 'level-5',
    name: 'Rising Hunter',
    description: 'Reach level 5.',
    check: (ctx) => ctx.game.level >= 5,
  },
  {
    id: 'level-10',
    name: 'Veteran Hunter',
    description: 'Reach level 10.',
    check: (ctx) => ctx.game.level >= 10,
  },
  {
    id: 'speed-runner',
    name: 'Speed Runner',
    description: 'Defeat a bug in under 5 seconds.',
    check: (ctx) => ctx.fastestKillMs !== undefined && ctx.fastestKillMs < 5000,
  },
  {
    id: 'session-10',
    name: 'Session Warrior',
    description: 'Defeat 10 bugs in a single session.',
    check: (ctx) => ctx.session.bugsDefeated >= 10,
  },
];

export function checkAchievements(
  context: AchievementContext,
  alreadyUnlocked: Set<string>,
  achievements: Achievement[] = BUILT_IN_ACHIEVEMENTS
): UnlockedAchievement[] {
  const newly: UnlockedAchievement[] = [];
  const now = Date.now();
  for (const achievement of achievements) {
    if (alreadyUnlocked.has(achievement.id)) continue;
    if (achievement.check(context)) {
      newly.push({
        id: achievement.id,
        name: achievement.name,
        description: achievement.description,
        unlockedAt: now,
      });
    }
  }
  return newly;
}
