import { useState } from 'react';
import type { Bug, BugRarity } from '@bughunter/shared';

const rarityText: Record<BugRarity, string> = {
  common: 'text-slate-400',
  rare: 'text-sky-300',
  epic: 'text-violet-300',
  boss: 'text-amber-300',
};

type Props = {
  bugs: Bug[] | undefined;
};

function formatTime(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function DefeatedArchive({ bugs }: Props) {
  const [expanded, setExpanded] = useState(false);
  const list = bugs ?? [];

  if (list.length === 0) return null;

  const sorted = [...list].sort((a, b) => (b.defeatedAt ?? 0) - (a.defeatedAt ?? 0));

  return (
    <section className="rounded-lg border border-bh-border bg-bh-surface p-panel">
      <button
        onClick={() => setExpanded((e) => !e)}
        className="flex items-center justify-between w-full text-left"
        aria-expanded={expanded}
      >
        <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted">
          Defeated
          <span className="ml-2 rounded-full bg-emerald-900/50 text-emerald-300 px-1.5 py-0.5 text-[10px] font-bold">
            {list.length}
          </span>
        </h2>
        <span className="text-bh-muted text-xs">{expanded ? '▾' : '▸'}</span>
      </button>

      {expanded && (
        <ul className="mt-3 space-y-1.5 max-h-48 overflow-y-auto pr-1">
          {sorted.map((bug) => (
            <li
              key={bug.id}
              className="rounded border border-bh-border/60 bg-bh-card/50 px-2.5 py-1.5 opacity-70"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-bh-text truncate">{bug.name}</span>
                <span className={`text-[10px] font-semibold uppercase ${rarityText[bug.rarity]}`}>
                  {bug.rarity}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                {bug.issue.fileLabel && (
                  <span className="text-[10px] text-bh-muted font-mono truncate">
                    {bug.issue.fileLabel}
                  </span>
                )}
                {bug.defeatedAt && (
                  <span className="text-[10px] text-bh-muted tabular-nums shrink-0">
                    {formatTime(bug.defeatedAt)}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
