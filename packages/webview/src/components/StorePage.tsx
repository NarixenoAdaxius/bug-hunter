import type { CosmeticCategory, CosmeticsState } from '@bughunter/shared';
import { ALL_STORE_ITEMS } from '@bughunter/game-engine';
import type { StoreItem } from '@bughunter/game-engine';
import { StoreItemCard } from './StoreItemCard';

type Props = {
  cosmetics: CosmeticsState;
};

const SECTION_ORDER: readonly CosmeticCategory[] = ['pet', 'avatar', 'border', 'theme'];

const SECTION_TITLE: Record<CosmeticCategory, string> = {
  pet: 'Pets',
  avatar: 'Avatars',
  border: 'Borders',
  theme: 'Panel themes',
};

function groupByCategory(items: readonly StoreItem[]): Map<CosmeticCategory, StoreItem[]> {
  const map = new Map<CosmeticCategory, StoreItem[]>();
  for (const cat of SECTION_ORDER) {
    map.set(cat, []);
  }
  for (const item of items) {
    map.get(item.category)?.push(item);
  }
  return map;
}

export function StorePage({ cosmetics }: Props) {
  const groups = groupByCategory(ALL_STORE_ITEMS);

  return (
    <div className="space-y-6 pb-2">
      <header className="sticky top-0 z-[1] -mx-panel px-panel py-2 -mt-1 bg-bh-bg/95 backdrop-blur-sm border-b border-bh-border mb-1">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted">
          Boogles store
        </h2>
        <p className="text-sm text-bh-text-secondary mt-1 tabular-nums">
          Balance: <span className="text-bh-text font-semibold">{cosmetics.boogles}</span> Boogles
        </p>
      </header>

      {SECTION_ORDER.map((cat) => {
        const list = groups.get(cat) ?? [];
        if (list.length === 0) return null;
        return (
          <section key={cat} className="space-y-3">
            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-bh-muted px-0.5">
              {SECTION_TITLE[cat]}
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {list.map((item) => (
                <StoreItemCard key={item.id} item={item} cosmetics={cosmetics} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
