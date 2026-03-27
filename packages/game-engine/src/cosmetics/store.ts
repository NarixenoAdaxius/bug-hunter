import type { CosmeticCategory, CosmeticsState } from '@bughunter/shared';
import { COSMETIC_CATEGORY_OWNED_KEY } from './categoryRegistry.js';
import { findStoreItem } from './catalog.js';

export function isOwned(
  cosmetics: CosmeticsState,
  category: CosmeticCategory,
  id: string
): boolean {
  const key = COSMETIC_CATEGORY_OWNED_KEY[category];
  return cosmetics[key].includes(id);
}

/** Returns updated cosmetics or `null` if purchase invalid. */
export function purchaseCosmetic(
  cosmetics: CosmeticsState,
  category: CosmeticCategory,
  id: string
): CosmeticsState | null {
  const item = findStoreItem(id);
  if (!item || item.category !== category) return null;
  if (isOwned(cosmetics, category, id)) return null;
  if (cosmetics.boogles < item.price) return null;
  const key = COSMETIC_CATEGORY_OWNED_KEY[category];
  return {
    ...cosmetics,
    boogles: cosmetics.boogles - item.price,
    [key]: [...cosmetics[key], id],
  };
}

/** Returns updated cosmetics or `null` if not owned or unknown item. */
export function equipCosmetic(
  cosmetics: CosmeticsState,
  category: CosmeticCategory,
  id: string
): CosmeticsState | null {
  if (!isOwned(cosmetics, category, id)) return null;
  const item = findStoreItem(id);
  if (!item || item.category !== category) return null;
  switch (category) {
    case 'pet':
      return { ...cosmetics, equippedPetId: id };
    case 'avatar':
      return { ...cosmetics, equippedAvatarId: id };
    case 'border':
      return { ...cosmetics, equippedBorderId: id };
    case 'theme':
      return { ...cosmetics, equippedPanelThemeId: id };
  }
}
