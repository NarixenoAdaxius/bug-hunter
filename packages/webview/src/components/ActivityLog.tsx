import type { CombatLogEntry } from '@bughunter/shared';
import { useRef, useEffect } from 'react';

type Props = {
  entries: CombatLogEntry[];
};

function formatEntry(entry: CombatLogEntry): string {
  switch (entry.kind) {
    case 'turnStart':
      return `── Turn ${entry.turn} ──`;
    case 'playerMiss':
      return `You missed!`;
    case 'bugMiss':
      return `Bug missed!`;
    case 'playerHit':
      return `You hit for ${entry.damage} dmg${entry.critical ? ' (CRIT!)' : ''}  →  Bug HP: ${entry.bugHpAfter}`;
    case 'bugHit':
      return `Bug hit you for ${entry.damage} dmg${entry.critical ? ' (CRIT!)' : ''}  →  Your HP: ${entry.playerHpAfter}`;
    case 'bugDefeated':
      return `Bug defeated! +${entry.xpAwarded} XP`;
    case 'playerDefeated':
      return `You were defeated…`;
  }
}

function entryColor(kind: CombatLogEntry['kind']): string {
  switch (kind) {
    case 'turnStart':
      return 'text-slate-500';
    case 'playerMiss':
    case 'bugMiss':
      return 'text-slate-400';
    case 'playerHit':
      return 'text-emerald-300';
    case 'bugHit':
      return 'text-rose-300';
    case 'bugDefeated':
      return 'text-amber-300';
    case 'playerDefeated':
      return 'text-rose-400';
  }
}

export function ActivityLog({ entries }: Props) {
  const scrollRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [entries.length]);

  if (entries.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-700 bg-slate-950/30 p-panel">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted mb-2">
          Activity
        </h2>
        <p className="text-sm text-bh-muted text-center py-5">
          Waiting for events from the extension…
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-bh-border bg-bh-surface p-panel">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted mb-2">Activity</h2>
      <ul
        ref={scrollRef}
        aria-live="polite"
        aria-label="Combat activity log"
        className="space-y-0.5 max-h-48 overflow-y-auto pr-1 font-mono text-[11px] leading-relaxed"
      >
        {entries.map((entry, i) => (
          <li key={`${i}-${entry.kind}`} className={entryColor(entry.kind)}>
            {formatEntry(entry)}
          </li>
        ))}
      </ul>
    </section>
  );
}
