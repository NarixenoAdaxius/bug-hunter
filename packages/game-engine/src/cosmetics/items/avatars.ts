import type { StoreItem } from '../storeTypes.js';

/** Add new avatars here only — they are merged in `./index.ts`. */
export const AVATAR_STORE_ITEMS: readonly StoreItem[] = [
  {
    id: 'avatar-neon',
    name: 'Neon Node',
    price: 25,
    category: 'avatar',
    glyph: '◆',
    assetPath: 'store/avatars/avatar-neon.svg',
    description: 'Sharp, glowing profile icon for graph and UI-minded hunters.',
  },
  {
    id: 'avatar-hex',
    name: 'Hex Core',
    price: 25,
    category: 'avatar',
    glyph: '⬡',
    assetPath: 'store/avatars/avatar-hex.svg',
    description: 'Low-level flair — hexagon core for systems-style bragging rights.',
  },
];
