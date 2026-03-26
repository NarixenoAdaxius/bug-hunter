import type { Issue } from '@bughunter/shared';

/** Aggregates per-file issue lists keyed by document URI string. */
export class WorkspaceIssueIndex {
  private readonly byUri = new Map<string, Issue[]>();

  clear(): void {
    this.byUri.clear();
  }

  set(uriStr: string, issues: Issue[]): void {
    if (issues.length === 0) {
      this.byUri.delete(uriStr);
    } else {
      this.byUri.set(uriStr, issues);
    }
  }

  delete(uriStr: string): void {
    this.byUri.delete(uriStr);
  }

  flatten(): Issue[] {
    return [...this.byUri.values()].flat();
  }

  get trackedFileCount(): number {
    return this.byUri.size;
  }
}
