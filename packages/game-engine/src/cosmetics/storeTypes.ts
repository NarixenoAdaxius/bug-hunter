import type { CosmeticCategory } from '@bughunter/shared';

/** One purchasable / equippable row in the Boogles store (content data). */
export type StoreItem = {
  id: string;
  name: string;
  price: number;
  category: CosmeticCategory;
  /** Emoji or short label for lightweight UI */
  glyph: string;
  /**
   * Optional file under the webview `public/` folder (e.g. `store/pets/pet-duck.svg`).
   * Replace with PNG/WebP from MCP (`mcp-game-asset-gen`) by overwriting the same path after build.
   */
  assetPath?: string;
};
