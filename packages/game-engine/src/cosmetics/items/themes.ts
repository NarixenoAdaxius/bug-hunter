import type { StoreItem } from '../storeTypes.js';

/**
 * Panel theme ids must match `[data-bh-theme="…"]` in the webview CSS
 * (`packages/webview/src/index.css`). Add a row here and a matching block there.
 */
export const THEME_STORE_ITEMS: readonly StoreItem[] = [
  {
    id: 'theme-spring',
    name: 'Spring',
    price: 50,
    category: 'theme',
    glyph: '🌸',
    assetPath: 'store/themes/theme-spring.svg',
  },
  {
    id: 'theme-summer',
    name: 'Summer',
    price: 50,
    category: 'theme',
    glyph: '☀️',
    assetPath: 'store/themes/theme-summer.svg',
  },
  {
    id: 'theme-autumn',
    name: 'Autumn',
    price: 50,
    category: 'theme',
    glyph: '🍂',
    assetPath: 'store/themes/theme-autumn.svg',
  },
  {
    id: 'theme-winter',
    name: 'Winter',
    price: 50,
    category: 'theme',
    glyph: '❄️',
    assetPath: 'store/themes/theme-winter.svg',
  },
  {
    id: 'theme-dawn',
    name: 'Dawn',
    price: 55,
    category: 'theme',
    glyph: '🌅',
    assetPath: 'store/themes/theme-dawn.svg',
  },
  {
    id: 'theme-dusk',
    name: 'Dusk',
    price: 55,
    category: 'theme',
    glyph: '🌆',
    assetPath: 'store/themes/theme-dusk.svg',
  },
];
