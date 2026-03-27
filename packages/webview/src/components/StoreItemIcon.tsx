import type { StoreItem } from '@bughunter/game-engine';
import { storeAssetUrl } from '../storeAssetUrl';

type Props = {
  item: Pick<StoreItem, 'glyph' | 'assetPath' | 'name'>;
  className?: string;
};

/** List / header thumbnail: image when {@link StoreItem.assetPath} is set, else emoji glyph. */
export function StoreItemIcon({ item, className }: Props) {
  if (item.assetPath) {
    return (
      <img
        src={storeAssetUrl(item.assetPath)}
        alt=""
        className={className ?? 'h-5 w-5 shrink-0 object-contain'}
        draggable={false}
      />
    );
  }
  return (
    <span className={className ?? 'text-lg shrink-0 leading-none'} aria-hidden>
      {item.glyph}
    </span>
  );
}
