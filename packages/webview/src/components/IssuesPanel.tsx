import type { Issue } from '@bughunter/shared';

const severityStyles: Record<Issue['severity'], string> = {
  info: 'text-sky-300 bg-sky-950/50 border-sky-800/60',
  warning: 'text-amber-200 bg-amber-950/40 border-amber-800/50',
  error: 'text-rose-200 bg-rose-950/40 border-rose-800/50',
};

type Props = {
  issues: Issue[] | undefined;
};

export function IssuesPanel({ issues }: Props) {
  const list = issues ?? [];

  if (list.length === 0) {
    return (
      <section className="rounded-lg border border-bh-border bg-bh-surface p-panel">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted mb-2">
          Insights
        </h2>
        <p className="text-sm text-bh-muted py-4 text-center">No issues reported yet.</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-bh-border bg-bh-surface p-panel">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-bh-muted mb-3">Insights</h2>
      <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {list.map((issue) => (
          <li
            key={issue.id}
            className={`rounded-md border px-2.5 py-2 text-xs ${severityStyles[issue.severity]}`}
          >
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="font-semibold uppercase tracking-wide text-[10px] opacity-90">
                {issue.severity}
              </span>
              {issue.line != null && (
                <span className="text-[10px] opacity-75 tabular-nums">
                  L{issue.line}
                  {issue.column != null ? `:${issue.column}` : ''}
                </span>
              )}
            </div>
            {issue.fileLabel != null && issue.fileLabel.length > 0 && (
              <p
                className="text-[10px] text-bh-muted/90 truncate mb-1 font-mono"
                title={issue.sourceUri}
              >
                {issue.fileLabel}
              </p>
            )}
            <p className="text-bh-text-secondary/95 leading-snug">{issue.message}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
