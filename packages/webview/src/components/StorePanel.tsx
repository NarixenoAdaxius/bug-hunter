import type { CosmeticCategory, CosmeticsState } from '@bughunter/shared';
import { ALL_STORE_ITEMS, isOwned } from '@bughunter/game-engine';
import { StoreItemIcon } from './StoreItemIcon';
import { vscode } from '../vscode';

type Props = {
  cosmetics: CosmeticsState;
};

function postCosmetic(action: 'purchase' | 'equip', category: CosmeticCategory, id: string) {
  vscode.postMessage({ type: 'cosmeticAction', payload: { action, category, id } });
}

export function StorePanel({ cosmetics }: Props) {
  return (
    <section className="rounded-lg border border-bh-border bg-bh-surface p-panel">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted mb-2">
        Boogles store
      </h2>
      <p className="text-[11px] text-bh-subtle mb-3 tabular-nums">
        Balance: <span className="text-bh-text font-medium">{cosmetics.boogles}</span> Boogles
      </p>
      <ul className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {ALL_STORE_ITEMS.map((item) => {
          const owned = isOwned(cosmetics, item.category, item.id);
          const equipped =
            (item.category === 'pet' && cosmetics.equippedPetId === item.id) ||
            (item.category === 'avatar' && cosmetics.equippedAvatarId === item.id) ||
            (item.category === 'border' && cosmetics.equippedBorderId === item.id) ||
            (item.category === 'theme' && cosmetics.equippedPanelThemeId === item.id);
          return (
            <li
              key={item.id}
              className="flex items-center justify-between gap-2 rounded border border-bh-border-subtle bg-bh-card px-2 py-1.5 text-[11px]"
            >
              <span className="flex items-center gap-2 min-w-0">
                <StoreItemIcon item={item} />
                <span className="truncate text-bh-text-secondary">
                  <span className="text-bh-text">{item.name}</span>
                  <span className="text-bh-muted"> · {item.category}</span>
                </span>
              </span>
              <span className="flex items-center gap-1 shrink-0">
                {!owned ? (
                  <button
                    type="button"
                    className="rounded px-2 py-0.5 text-[10px] font-medium bg-bh-xp/20 text-emerald-200 hover:bg-bh-xp/30 border border-emerald-800/50"
                    onClick={() => postCosmetic('purchase', item.category, item.id)}
                    disabled={cosmetics.boogles < item.price}
                  >
                    Buy {item.price}
                  </button>
                ) : equipped ? (
                  <span className="text-bh-muted text-[10px]">Equipped</span>
                ) : (
                  <button
                    type="button"
                    className="rounded px-2 py-0.5 text-[10px] font-medium bg-bh-border text-bh-text-secondary hover:bg-bh-border-subtle"
                    onClick={() => postCosmetic('equip', item.category, item.id)}
                  >
                    Equip
                  </button>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
