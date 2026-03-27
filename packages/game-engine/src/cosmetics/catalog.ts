import type { StoreItem } from './storeTypes.js';
import { ALL_STORE_ITEMS } from './items/index.js';

export type { StoreItem } from './storeTypes.js';

/** @deprecated Prefer {@link ALL_STORE_ITEMS} from `./items/index.js` for new code. */
export const STORE_CATALOG: readonly StoreItem[] = ALL_STORE_ITEMS;

const byId = new Map<string, StoreItem>();
for (const item of ALL_STORE_ITEMS) {
  byId.set(item.id, item);
}

export function findStoreItem(id: string): StoreItem | undefined {
  return byId.get(id);
}
