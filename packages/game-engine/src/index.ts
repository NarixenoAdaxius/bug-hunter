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
export { booglesForDefeatingBug } from './boogles.js';
export { rewardsForLevelRange } from './levelUpRewards.js';
export type { StoreItem } from './cosmetics/storeTypes.js';
export { STORE_CATALOG, findStoreItem } from './cosmetics/catalog.js';
export { ALL_STORE_ITEMS } from './cosmetics/items/index.js';
export type { LevelTitleMilestone } from './progression/levelTitles.js';
export { LEVEL_TITLE_MILESTONES, buildTitleAtLevelMap } from './progression/levelTitles.js';
export { isOwned, purchaseCosmetic, equipCosmetic } from './cosmetics/store.js';
export type { CosmeticOwnedKey } from './cosmetics/categoryRegistry.js';
export { COSMETIC_CATEGORY_OWNED_KEY } from './cosmetics/categoryRegistry.js';
