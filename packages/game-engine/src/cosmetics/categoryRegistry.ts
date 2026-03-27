import type { CosmeticCategory, CosmeticsState } from '@bughunter/shared';

/**
 * When adding a **new** `CosmeticCategory` in `@bughunter/shared`:
 * 1. Extend `CosmeticsState` with `owned…Ids` + equipped field.
 * 2. Add one row here.
 * 3. Extend `equipCosmetic` / purchase paths if equip shape differs (e.g. nullable pet).
 */
export type CosmeticOwnedKey = keyof Pick<
  CosmeticsState,
  'ownedPetIds' | 'ownedAvatarIds' | 'ownedBorderIds' | 'ownedThemeIds'
>;

export const COSMETIC_CATEGORY_OWNED_KEY: Record<CosmeticCategory, CosmeticOwnedKey> = {
  pet: 'ownedPetIds',
  avatar: 'ownedAvatarIds',
  border: 'ownedBorderIds',
  theme: 'ownedThemeIds',
};
