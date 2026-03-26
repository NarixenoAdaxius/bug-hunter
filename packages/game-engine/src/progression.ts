import type { GameState } from '@bughunter/shared';

/** XP required in the current level bar to advance from `level` to `level + 1`. */
export function xpRequiredToLevelUp(level: number): number {
  if (level < 1) {
    return xpRequiredToLevelUp(1);
  }
  return 100 * level;
}

/**
 * Apply XP to game state. Convention: `xp` is progress toward the **next** level (resets on level-up);
 * `level` is the current level (minimum 1).
 */
export function applyXpToGameState(state: GameState, amount: number): GameState {
  if (amount <= 0) {
    return { ...state };
  }
  let level = Math.max(1, state.level);
  let xp = state.xp + amount;
  let need = xpRequiredToLevelUp(level);
  while (xp >= need) {
    xp -= need;
    level += 1;
    need = xpRequiredToLevelUp(level);
  }
  return { level, xp, xpToNextLevel: need };
}
