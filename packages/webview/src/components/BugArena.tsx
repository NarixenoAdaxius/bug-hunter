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
  const list = bugs ?? [];

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
      </h2>
      <ul className="space-y-3">
        {list.map((bug) => {
          const hpPct = bug.maxHp > 0 ? Math.round((bug.hp / bug.maxHp) * 100) : 0;
          const alive = bug.hp > 0;
          return (
            <li
              key={bug.id}
              className={`rounded-lg border border-bh-border/90 bg-bh-card p-panel transition ${alive ? 'hover:border-slate-700' : 'opacity-50'}`}
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
              <div
                className="h-1.5 rounded-full bg-bh-border overflow-hidden mb-2"
                role="progressbar"
                aria-label={`${bug.name} HP`}
                aria-valuenow={bug.hp}
                aria-valuemin={0}
                aria-valuemax={bug.maxHp}
              >
                <div
                  className="h-full rounded-full bg-bh-hp transition-all duration-300"
                  style={{ width: `${hpPct}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] text-bh-muted tabular-nums mb-2">
                <span>
                  HP {bug.hp}/{bug.maxHp}
                </span>
                <span>
                  ATK {bug.attack} · DEF {bug.defense}
                </span>
              </div>
              <p className="text-xs text-bh-subtle line-clamp-2 mb-2">{bug.issue.message}</p>
              {alive && (
                <button
                  onClick={() => handleAttack(bug.id)}
                  aria-label={`Attack ${bug.name}`}
                  className="w-full rounded bg-bh-attack hover:bg-bh-attack-hover active:bg-bh-attack-active text-xs font-semibold text-white py-1.5 transition-colors"
                >
                  Attack
                </button>
              )}
              {!alive && (
                <p className="text-xs text-bh-victory text-center font-medium">Defeated</p>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
