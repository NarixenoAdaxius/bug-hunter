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
    description: 'Fresh, light accents across the sidebar — new growth, new fixes.',
  },
  {
    id: 'theme-summer',
    name: 'Summer',
    price: 50,
    category: 'theme',
    glyph: '☀️',
    assetPath: 'store/themes/theme-summer.svg',
    description: 'Bright, high-contrast palette for sunny debugging sessions.',
  },
  {
    id: 'theme-autumn',
    name: 'Autumn',
    price: 50,
    category: 'theme',
    glyph: '🍂',
    assetPath: 'store/themes/theme-autumn.svg',
    description: 'Warm tones when you are refactoring the harvest.',
  },
  {
    id: 'theme-winter',
    name: 'Winter',
    price: 50,
    category: 'theme',
    glyph: '❄️',
    assetPath: 'store/themes/theme-winter.svg',
    description: 'Cool, crisp colors — focus mode for deep bug traces.',
  },
  {
    id: 'theme-dawn',
    name: 'Dawn',
    price: 55,
    category: 'theme',
    glyph: '🌅',
    assetPath: 'store/themes/theme-dawn.svg',
    description: 'Soft sunrise gradient — start the day with a calmer panel.',
  },
  {
    id: 'theme-dusk',
    name: 'Dusk',
    price: 55,
    category: 'theme',
    glyph: '🌆',
    assetPath: 'store/themes/theme-dusk.svg',
    description: 'Evening city hues — easy on the eyes for late-night hunts.',
  },
];
