import { useCallback, useEffect, useRef, useState } from 'react';
import type { CosmeticsState } from '@bughunter/shared';
import { findStoreItem, type StoreItem } from '@bughunter/game-engine';
import { storeAssetUrl } from '../storeAssetUrl';

function PetFace({ item }: { item: StoreItem }) {
  const [imgFailed, setImgFailed] = useState(false);
  if (item.assetPath && !imgFailed) {
    return (
      <img
        src={storeAssetUrl(item.assetPath)}
        alt=""
        className="h-11 w-11 object-contain pointer-events-none"
        draggable={false}
        onError={() => setImgFailed(true)}
      />
    );
  }
  return (
    <span className="pointer-events-none" aria-hidden>
      {item.glyph}
    </span>
  );
}

type Props = {
  cosmetics: CosmeticsState;
  /** Opens the Boogles store tab when the user has no pet equipped. */
  onOpenStore?: () => void;
};

export function CompanionPet({ cosmetics, onOpenStore }: Props) {
  const id = cosmetics.equippedPetId;
  const item = id ? findStoreItem(id) : undefined;
  const boxRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 20, y: 16 });
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!item) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      dragRef.current = { sx: e.clientX, sy: e.clientY, ox: pos.x, oy: pos.y };
    },
    [item, pos.x, pos.y]
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const el = boxRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = d.ox + (e.clientX - d.sx);
    const ny = d.oy + (e.clientY - d.sy);
    const maxX = Math.max(8, rect.width - 48);
    const maxY = Math.max(8, rect.height - 48);
    setPos({
      x: Math.min(maxX, Math.max(8, nx)),
      y: Math.min(maxY, Math.max(8, ny)),
    });
  }, []);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    dragRef.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    return () => {
      dragRef.current = null;
    };
  }, []);

  if (!item) {
    return (
      <section className="rounded-lg border border-dashed border-bh-border bg-bh-card/30 p-panel">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted mb-2">
          Companion
        </h2>
        <div className="text-xs text-bh-muted text-center py-6 space-y-3">
          <p>Buy and equip a pet from the store to keep you company while you debug.</p>
          {onOpenStore ? (
            <button
              type="button"
              className="rounded-md px-3 py-1.5 text-xs font-medium bg-bh-border text-bh-text-secondary hover:bg-bh-border-subtle"
              onClick={onOpenStore}
            >
              Open Boogles store
            </button>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-bh-border bg-bh-surface p-panel">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted mb-2">
        Companion
      </h2>
      <div
        ref={boxRef}
        className="relative h-28 rounded-md border border-bh-border-subtle bg-bh-bg/80 overflow-hidden touch-none"
      >
        <button
          type="button"
          className="absolute z-10 flex h-12 w-12 items-center justify-center text-4xl leading-none cursor-grab active:cursor-grabbing select-none motion-safe:animate-bh-bounce focus:outline-none focus:ring-2 focus:ring-bh-xp/50 rounded"
          style={{ left: pos.x, top: pos.y }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          aria-label={`${item.name} — drag to move`}
        >
          <PetFace key={item.id} item={item} />
        </button>
      </div>
      <p className="text-[10px] text-bh-muted mt-2 text-center">
        Drag the pet · click is ready for future reactions
      </p>
    </section>
  );
}
