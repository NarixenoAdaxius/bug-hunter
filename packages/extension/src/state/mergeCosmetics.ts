import { findStoreItem } from '@bughunter/game-engine';
import { DEFAULT_COSMETICS, type CosmeticCategory, type CosmeticsState } from '@bughunter/shared';

function filterOwnedIds(raw: unknown, category: CosmeticCategory): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const id of raw) {
    if (typeof id !== 'string') continue;
    const item = findStoreItem(id);
    if (item?.category === category) out.push(id);
  }
  return out;
}

export function mergeCosmetics(input: unknown): CosmeticsState {
  const d = DEFAULT_COSMETICS;
  if (!input || typeof input !== 'object') {
    return { ...d };
  }
  const p = input as Partial<CosmeticsState>;
  return {
    boogles: typeof p.boogles === 'number' && p.boogles >= 0 ? p.boogles : d.boogles,
    ownedPetIds: [...new Set(filterOwnedIds(p.ownedPetIds, 'pet'))],
    ownedAvatarIds: [
      ...new Set([...d.ownedAvatarIds, ...filterOwnedIds(p.ownedAvatarIds, 'avatar')]),
    ],
    ownedBorderIds: [
      ...new Set([...d.ownedBorderIds, ...filterOwnedIds(p.ownedBorderIds, 'border')]),
    ],
    ownedThemeIds: [...new Set([...d.ownedThemeIds, ...filterOwnedIds(p.ownedThemeIds, 'theme')])],
    equippedPetId:
      p.equippedPetId === null
        ? null
        : typeof p.equippedPetId === 'string' && findStoreItem(p.equippedPetId)?.category === 'pet'
          ? p.equippedPetId
          : d.equippedPetId,
    equippedAvatarId:
      typeof p.equippedAvatarId === 'string' &&
      findStoreItem(p.equippedAvatarId)?.category === 'avatar'
        ? p.equippedAvatarId
        : d.equippedAvatarId,
    equippedBorderId:
      typeof p.equippedBorderId === 'string' &&
      findStoreItem(p.equippedBorderId)?.category === 'border'
        ? p.equippedBorderId
        : d.equippedBorderId,
    equippedPanelThemeId:
      typeof p.equippedPanelThemeId === 'string' &&
      findStoreItem(p.equippedPanelThemeId)?.category === 'theme'
        ? p.equippedPanelThemeId
        : d.equippedPanelThemeId,
    profileTitle:
      p.profileTitle === null || typeof p.profileTitle === 'string'
        ? p.profileTitle
        : d.profileTitle,
  };
}
