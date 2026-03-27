import type { CosmeticCategory, CosmeticsState } from '@bughunter/shared';
import type { StoreItem } from '@bughunter/game-engine';
import { isOwned } from '@bughunter/game-engine';
import { StoreItemIcon } from './StoreItemIcon';
import { vscode } from '../vscode';

type Props = {
  item: StoreItem;
  cosmetics: CosmeticsState;
};

function postCosmetic(action: 'purchase' | 'equip', category: CosmeticCategory, id: string) {
  vscode.postMessage({ type: 'cosmeticAction', payload: { action, category, id } });
}

const CATEGORY_LABEL: Record<CosmeticCategory, string> = {
  pet: 'Pet',
  avatar: 'Avatar',
  border: 'Border',
  theme: 'Theme',
};

function categoryLabel(category: CosmeticCategory): string {
  return CATEGORY_LABEL[category];
}

export function StoreItemCard({ item, cosmetics }: Props) {
  const owned = isOwned(cosmetics, item.category, item.id);
  const equipped =
    (item.category === 'pet' && cosmetics.equippedPetId === item.id) ||
    (item.category === 'avatar' && cosmetics.equippedAvatarId === item.id) ||
    (item.category === 'border' && cosmetics.equippedBorderId === item.id) ||
    (item.category === 'theme' && cosmetics.equippedPanelThemeId === item.id);

  return (
    <article className="rounded-lg border border-bh-border bg-bh-card overflow-hidden flex flex-col">
      <div className="flex items-center justify-center min-h-[7rem] bg-bh-bg/60 border-b border-bh-border-subtle px-3 py-4">
        <StoreItemIcon
          key={`${item.id}-${item.assetPath ?? ''}`}
          item={item}
          className="h-20 w-20 object-contain shrink-0"
        />
      </div>
      <div className="p-3 flex flex-col gap-2 flex-1 min-h-0">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold text-bh-text leading-tight">{item.name}</h3>
          <span className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide bg-bh-border/80 text-bh-muted">
            {categoryLabel(item.category)}
          </span>
        </div>
        {item.description ? (
          <p className="text-xs text-bh-text-secondary leading-snug">{item.description}</p>
        ) : null}
        <div className="flex items-center justify-between gap-2 mt-auto pt-1">
          <span className="text-xs tabular-nums text-bh-muted">
            <span className="text-bh-text font-medium">{item.price}</span> Boogles
          </span>
          {!owned ? (
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs font-medium bg-bh-xp/20 text-emerald-200 hover:bg-bh-xp/30 border border-emerald-800/50"
              onClick={() => postCosmetic('purchase', item.category, item.id)}
              disabled={cosmetics.boogles < item.price}
            >
              Buy
            </button>
          ) : equipped ? (
            <span className="text-xs text-bh-muted">Equipped</span>
          ) : (
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs font-medium bg-bh-border text-bh-text-secondary hover:bg-bh-border-subtle"
              onClick={() => postCosmetic('equip', item.category, item.id)}
            >
              Equip
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
