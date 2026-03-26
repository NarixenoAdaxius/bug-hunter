export {
  calculateDamage,
  calculateDamageStub,
  computeHitDamage,
  CRITICAL_CHANCE,
} from './damage.js';
export { DEFAULT_MISS_CHANCE, resolveBugAttack, resolvePlayerAttack } from './combat.js';
export type { PlayerAttackResult } from './combat.js';
export { applyXpToGameState, xpRequiredToLevelUp } from './progression.js';
export { baseXpForBugRarity, xpForDefeatingBug } from './rewards.js';
export type { EncounterOptions, EncounterResult } from './encounter.js';
export { runCombat, simulateEncounter } from './encounter.js';
export type { CombatLogEntry, PlayerCombatStats } from './types.js';
export type { Achievement, AchievementContext, UnlockedAchievement } from './achievements.js';
export { BUILT_IN_ACHIEVEMENTS, checkAchievements } from './achievements.js';
