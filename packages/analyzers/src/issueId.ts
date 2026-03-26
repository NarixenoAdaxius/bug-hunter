/** Deterministic short hash for stable issue ids. */
export function shortHash(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

export function makeIssueId(
  pluginName: string,
  ruleKey: string,
  line: number,
  detail: string
): string {
  return `${pluginName}/${ruleKey}/${line}/${shortHash(detail)}`;
}
