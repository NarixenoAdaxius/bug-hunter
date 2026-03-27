import type { StoreItem } from '../storeTypes.js';

/** Add new profile borders here only — they are merged in `./index.ts`. */
export const BORDER_STORE_ITEMS: readonly StoreItem[] = [
  {
    id: 'border-gold',
    name: 'Gold Frame',
    price: 30,
    category: 'border',
    glyph: '✦',
    assetPath: 'store/borders/border-gold.svg',
  },
  {
    id: 'border-holo',
    name: 'Holo Rim',
    price: 45,
    category: 'border',
    glyph: '✧',
    assetPath: 'store/borders/border-holo.svg',
  },
];
