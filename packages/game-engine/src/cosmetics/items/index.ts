/**
 * Store content registry — add a new `*-store-items.ts` file or extend an existing one,
 * export a `readonly StoreItem[]`, and append it to `ALL_STORE_ITEM_GROUPS` below.
 * Duplicate ids across the merged list throw at module load.
 */
import type { StoreItem } from '../storeTypes.js';
import { AVATAR_STORE_ITEMS } from './avatars.js';
import { BORDER_STORE_ITEMS } from './borders.js';
import { PET_STORE_ITEMS } from './pets.js';
import { THEME_STORE_ITEMS } from './themes.js';

const ALL_STORE_ITEM_GROUPS: readonly (readonly StoreItem[])[] = [
  PET_STORE_ITEMS,
  AVATAR_STORE_ITEMS,
  BORDER_STORE_ITEMS,
  THEME_STORE_ITEMS,
];

function mergeStoreItems(groups: readonly (readonly StoreItem[])[]): StoreItem[] {
  const seen = new Set<string>();
  const out: StoreItem[] = [];
  for (const group of groups) {
    for (const item of group) {
      if (seen.has(item.id)) {
        throw new Error(`Bug Hunter store: duplicate item id "${item.id}"`);
      }
      seen.add(item.id);
      out.push(item);
    }
  }
  return out;
}

/** Flat list used by the webview and purchase/equip logic. */
export const ALL_STORE_ITEMS: readonly StoreItem[] = mergeStoreItems(ALL_STORE_ITEM_GROUPS);
