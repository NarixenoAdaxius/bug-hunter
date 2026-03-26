import type { GameState, SessionStats } from '@bughunter/shared';

type Props = {
  game?: GameState;
  session?: SessionStats;
};

export function Dashboard({ game, session }: Props) {
  const level = game?.level ?? 0;
  const xp = game?.xp ?? 0;
  const xpToNextLevel = game?.xpToNextLevel ?? 100;
  const pct = xpToNextLevel > 0 ? Math.min(100, (xp / xpToNextLevel) * 100) : 0;
  const defeated = session?.bugsDefeated ?? 0;

  return (
    <section className="rounded-lg border border-bh-border bg-bh-surface p-panel">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted mb-3">
        Dashboard
      </h2>
      <div className="flex items-baseline justify-between gap-2 mb-2">
        <span className="text-2xl font-semibold text-bh-text tabular-nums">Lv {level}</span>
        <span className="text-sm text-bh-subtle tabular-nums">{xp} XP</span>
      </div>
      <div
        className="h-2 rounded-full bg-bh-border overflow-hidden mb-3"
        role="progressbar"
        aria-label="XP progress"
        aria-valuenow={xp}
        aria-valuemin={0}
        aria-valuemax={xpToNextLevel}
      >
        <div
          className="h-full rounded-full bg-bh-xp transition-all duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>
      <dl className="grid grid-cols-2 gap-2 text-xs">
        <div className="rounded border border-bh-border-subtle bg-bh-card px-2 py-1.5">
          <dt className="text-bh-muted">Bugs defeated</dt>
          <dd className="font-medium text-bh-text-secondary tabular-nums">{defeated}</dd>
        </div>
        <div className="rounded border border-bh-border-subtle bg-bh-card px-2 py-1.5">
          <dt className="text-bh-muted">This level</dt>
          <dd className="font-medium text-bh-text-secondary tabular-nums">
            {xp}/{xpToNextLevel} XP
          </dd>
        </div>
      </dl>
    </section>
  );
}
