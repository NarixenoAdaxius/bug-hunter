import type { StoreItem } from '../storeTypes.js';

/**
 * Add new pets here only — they are merged in `./index.ts`.
 * Webview art: `packages/webview/public/store/pets/<id>.svg` (or PNG from MCP `outputPath`).
 */
export const PET_STORE_ITEMS: readonly StoreItem[] = [
  {
    id: 'pet-beetle',
    name: 'Byte Beetle',
    price: 40,
    category: 'pet',
    glyph: '🪲',
    assetPath: 'store/pets/pet-beetle.svg',
  },
  {
    id: 'pet-duck',
    name: 'Rubber Duck',
    price: 35,
    category: 'pet',
    glyph: '🦆',
    assetPath: 'store/pets/pet-duck.svg',
  },
  {
    id: 'pet-bot',
    name: 'Debug Bot',
    price: 55,
    category: 'pet',
    glyph: '🤖',
    assetPath: 'store/pets/pet-bot.svg',
  },
];
