import { describe, it, expect } from 'vitest';
import { capIssuesForUi } from '../workspace/issueCaps.js';
import { scopeIssuesToWorkspaceFile } from '../workspace/issueNamespace.js';
import { shouldSkipWorkspacePath } from '../workspace/workspaceExclude.js';
import { WorkspaceIssueIndex } from '../workspace/workspaceIssueIndex.js';

describe('scopeIssuesToWorkspaceFile', () => {
  it('makes ids unique across files with same raw issue id', () => {
    const raw = [{ id: 'plugin/k/1/h', message: 'm', severity: 'info' as const }];
    const a = scopeIssuesToWorkspaceFile('file:///src/a.ts', 'a.ts', raw);
    const b = scopeIssuesToWorkspaceFile('file:///src/b.ts', 'b.ts', raw);
    expect(a[0].id).not.toBe(b[0].id);
    expect(a[0].sourceUri).toBe('file:///src/a.ts');
    expect(a[0].fileLabel).toBe('a.ts');
  });
});

describe('WorkspaceIssueIndex', () => {
  it('flattens multiple files and removes empty slices', () => {
    const idx = new WorkspaceIssueIndex();
    idx.set('u1', [{ id: '1', message: 'a', severity: 'error' }]);
    idx.set('u2', [{ id: '2', message: 'b', severity: 'info' }]);
    expect(idx.flatten()).toHaveLength(2);
    idx.set('u1', []);
    expect(idx.flatten()).toHaveLength(1);
    idx.clear();
    expect(idx.flatten()).toHaveLength(0);
  });
});

describe('capIssuesForUi', () => {
  it('prefers errors when capping', () => {
    const issues = [
      { id: 'i', message: '', severity: 'info' as const },
      { id: 'e', message: '', severity: 'error' as const },
    ];
    const capped = capIssuesForUi(issues, 1);
    expect(capped).toHaveLength(1);
    expect(capped[0].severity).toBe('error');
  });
});

describe('shouldSkipWorkspacePath', () => {
  it('skips node_modules and optional user fragments', () => {
    expect(shouldSkipWorkspacePath('/proj/node_modules/foo/x.js', '')).toBe(true);
    expect(shouldSkipWorkspacePath('/proj/src/x.ts', '')).toBe(false);
    expect(shouldSkipWorkspacePath('/proj/vendor/pkg/x.ts', 'vendor')).toBe(true);
  });
});
