/**
 * Visual hints for profile chrome — when you add a border in the game-engine store
 * (`cosmetics/items/borders.ts`), add a matching Tailwind class string here (or rely on `default`).
 */
export const BORDER_RING_BY_ID: Record<string, string> = {
  'border-gold': 'ring-2 ring-amber-400/80 shadow-[0_0_12px_rgba(251,191,36,0.22)]',
  'border-holo': 'ring-2 ring-cyan-400/70 shadow-[0_0_14px_rgba(34,211,238,0.18)]',
};

const DEFAULT_BORDER_RING = 'ring-1 ring-bh-border';

export function borderRingClass(borderId: string): string {
  return BORDER_RING_BY_ID[borderId] ?? DEFAULT_BORDER_RING;
}
