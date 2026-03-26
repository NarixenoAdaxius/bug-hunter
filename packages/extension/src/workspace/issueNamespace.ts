import type { Issue } from '@bughunter/shared';

/** Stable short key derived from a URI string (FNV-1a style). */
export function uriKey(uriString: string): string {
  let h = 2166136261;
  for (let i = 0; i < uriString.length; i++) {
    h ^= uriString.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

/** Makes issue ids unique across the workspace and attaches provenance for the UI. */
export function scopeIssuesToWorkspaceFile(
  sourceUri: string,
  fileLabel: string,
  raw: Issue[]
): Issue[] {
  const key = uriKey(sourceUri);
  return raw.map((issue) => ({
    ...issue,
    id: `${key}::${issue.id}`,
    sourceUri,
    fileLabel,
  }));
}
