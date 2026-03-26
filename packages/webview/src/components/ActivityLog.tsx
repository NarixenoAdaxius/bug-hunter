import type { ActivityLogEntry } from '@bughunter/shared';
import { useRef, useEffect } from 'react';

type Props = {
  entries: ActivityLogEntry[];
};

function formatEntry(entry: ActivityLogEntry): string {
  switch (entry.kind) {
    case 'engaging':
      return `Engaging ${entry.bugName} in ${entry.fileLabel}…`;
    case 'defeated':
      return `Defeated ${entry.bugName}! +${entry.xpAwarded} XP`;
    case 'scanning':
      return entry.message;
  }
}

function entryColor(kind: ActivityLogEntry['kind']): string {
  switch (kind) {
    case 'engaging':
      return 'text-amber-300';
    case 'defeated':
      return 'text-emerald-300';
    case 'scanning':
      return 'text-slate-400';
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
        aria-label="Activity log"
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
