import type { Issue } from '@bughunter/shared';

function severityRank(s: Issue['severity']): number {
  return s === 'error' ? 0 : s === 'warning' ? 1 : 2;
}

/** Prefer errors, then warnings; cap count for UI performance on huge repos. */
export function sortIssuesForUi(issues: Issue[]): Issue[] {
  return [...issues].sort((a, b) => {
    const dr = severityRank(a.severity) - severityRank(b.severity);
    if (dr !== 0) return dr;
    const la = a.line ?? Number.MAX_SAFE_INTEGER;
    const lb = b.line ?? Number.MAX_SAFE_INTEGER;
    return la - lb;
  });
}

export function capIssuesForUi(issues: Issue[], max: number): Issue[] {
  if (issues.length <= max) return issues;
  return sortIssuesForUi(issues).slice(0, max);
}
