import type { Bug, BugRarity } from '@bughunter/shared';
import { vscode } from '../vscode';

const rarityStyles: Record<BugRarity, string> = {
  common: 'bg-slate-600/40 text-slate-300 border-slate-500/40',
  rare: 'bg-sky-600/30 text-sky-200 border-sky-500/40',
  epic: 'bg-violet-600/30 text-violet-200 border-violet-500/40',
  boss: 'bg-amber-600/35 text-amber-100 border-amber-500/50 motion-safe:animate-pulse',
};

type Props = {
  bugs: Bug[] | undefined;
};

function handleAttack(bugId: string) {
  vscode.postMessage({ type: 'userAction', payload: { action: 'attack', bugId } });
}

export function BugArena({ bugs }: Props) {
  const all = bugs ?? [];
  const list = all.filter((b) => b.status === 'idle' || b.status === 'fighting');

  if (list.length === 0) {
    return (
      <section className="rounded-lg border border-bh-border bg-bh-surface p-panel">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted mb-2">
          Bug arena
        </h2>
        <p className="text-sm text-bh-muted py-6 text-center">No bugs spawned yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-bh-border bg-bh-surface p-panel">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted mb-3">
        Bug arena
        <span className="ml-2 text-bh-subtle font-normal">{list.length}</span>
      </h2>
      <ul className="space-y-3">
        {list.map((bug) => (
          <li
            key={bug.id}
            className={`rounded-lg border border-bh-border/90 bg-bh-card p-panel transition ${
              bug.status === 'fighting'
                ? 'border-amber-500/60 ring-1 ring-amber-500/30'
                : 'hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="min-w-0">
                <p className="font-medium text-bh-text truncate">{bug.name}</p>
                <p className="text-xs text-bh-muted">{bug.type}</p>
              </div>
              <span
                className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide border ${rarityStyles[bug.rarity]}`}
              >
                {bug.rarity}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-bh-muted tabular-nums mb-2">
              <span>
                ATK {bug.attack} · DEF {bug.defense}
              </span>
            </div>
            {bug.issue.fileLabel != null && bug.issue.fileLabel.length > 0 && (
              <p
                className="text-[10px] text-bh-muted font-mono truncate mb-1"
                title={bug.issue.sourceUri}
              >
                {bug.issue.fileLabel}
                {bug.issue.line != null && `:${bug.issue.line}`}
              </p>
            )}
            <p className="text-xs text-bh-subtle line-clamp-2 mb-2">{bug.issue.message}</p>

            {bug.status === 'idle' && (
              <button
                onClick={() => handleAttack(bug.id)}
                aria-label={`Attack ${bug.name}`}
                className="w-full rounded bg-bh-attack hover:bg-bh-attack-hover active:bg-bh-attack-active text-xs font-semibold text-white py-1.5 transition-colors"
              >
                Attack
              </button>
            )}
            {bug.status === 'fighting' && (
              <div className="flex gap-2">
                <span className="flex-1 text-center rounded bg-amber-600/30 border border-amber-500/40 text-amber-200 text-xs font-semibold py-1.5 motion-safe:animate-pulse">
                  Fighting...
                </span>
                <button
                  onClick={() => handleAttack(bug.id)}
                  aria-label={`Go to ${bug.name} in file`}
                  className="rounded bg-slate-700 hover:bg-slate-600 text-xs text-slate-200 px-3 py-1.5 transition-colors"
                >
                  Go to file
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
