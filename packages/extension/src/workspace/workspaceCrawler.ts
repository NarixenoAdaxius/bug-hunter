import * as vscode from 'vscode';
import { analyze } from '@bughunter/analyzers';
import type { Issue } from '@bughunter/shared';
import type { BugHunterConfiguration } from '../config/configuration.js';
import { capIssuesForUi } from './issueCaps.js';
import { scopeIssuesToWorkspaceFile } from './issueNamespace.js';
import { languageIdFromPath } from './languageId.js';
import { shouldSkipWorkspacePath } from './workspaceExclude.js';
import { fileLabelForUri, isAnalyzableWorkspaceUri } from './workspacePaths.js';
import { WorkspaceIssueIndex } from './workspaceIssueIndex.js';

export type WorkspaceAnalysisHooks = {
  onAfterApply?: (summary: { filesWithIssues: number; issueCount: number }) => void;
};

async function runPool(
  items: vscode.Uri[],
  limit: number,
  token: vscode.CancellationToken,
  worker: (uri: vscode.Uri) => Promise<void>
): Promise<void> {
  if (items.length === 0) return;
  let next = 0;
  const nWorkers = Math.min(Math.max(1, limit), items.length);
  const runners = Array.from({ length: nWorkers }, async () => {
    while (next < items.length) {
      if (token.isCancellationRequested) return;
      const idx = next++;
      if (idx >= items.length) return;
      await worker(items[idx]);
    }
  });
  await Promise.all(runners);
}

export class WorkspaceCrawler {
  private scanGen = 0;
  private cancelSource = new vscode.CancellationTokenSource();

  constructor(
    private readonly config: BugHunterConfiguration,
    private readonly index: WorkspaceIssueIndex,
    private readonly applyFlattened: (issues: Issue[]) => void,
    private readonly hooks?: WorkspaceAnalysisHooks
  ) {}

  dispose(): void {
    this.cancelSource.cancel();
    this.cancelSource.dispose();
  }

  requestFullScan(): void {
    this.cancelSource.cancel();
    this.cancelSource.dispose();
    this.cancelSource = new vscode.CancellationTokenSource();
    const token = this.cancelSource.token;
    const gen = ++this.scanGen;
    void this.runFullScan(token, gen);
  }

  async rescanUri(uri: vscode.Uri, token?: vscode.CancellationToken): Promise<void> {
    const t = token ?? this.cancelSource.token;
    if (!this.config.workspaceScanEnabled) return;
    if (!isAnalyzableWorkspaceUri(uri)) return;
    if (shouldSkipWorkspacePath(uri.fsPath, this.config.workspaceScanExcludeExtra)) {
      this.index.delete(uri.toString());
      this.applyFlattenedFromIndex();
      return;
    }
    await this.analyzeOneUri(uri, t);
    this.applyFlattenedFromIndex();
  }

  private applyFlattenedFromIndex(): void {
    const raw = this.index.flatten();
    const capped = capIssuesForUi(raw, this.config.workspaceMaxUiIssues);
    this.applyFlattened(capped);
    this.hooks?.onAfterApply?.({
      filesWithIssues: this.index.trackedFileCount,
      issueCount: capped.length,
    });
  }

  private async runFullScan(token: vscode.CancellationToken, gen: number): Promise<void> {
    if (!this.config.workspaceScanEnabled) return;
    if (!vscode.workspace.workspaceFolders?.length) {
      this.index.clear();
      this.applyFlattenedFromIndex();
      return;
    }

    this.index.clear();

    let uris: vscode.Uri[];
    try {
      uris = await vscode.workspace.findFiles(
        this.config.workspaceScanInclude,
        '**/node_modules/**',
        undefined,
        token
      );
    } catch {
      return;
    }

    if (gen !== this.scanGen || token.isCancellationRequested) return;

    const filtered = uris.filter(
      (u) =>
        isAnalyzableWorkspaceUri(u) &&
        !shouldSkipWorkspacePath(u.fsPath, this.config.workspaceScanExcludeExtra)
    );

    const concurrency = Math.max(1, this.config.workspaceScanConcurrency);

    await runPool(filtered, concurrency, token, async (uri) => {
      if (gen !== this.scanGen || token.isCancellationRequested) return;
      await this.analyzeOneUri(uri, token);
    });

    if (gen !== this.scanGen || token.isCancellationRequested) return;
    this.applyFlattenedFromIndex();
  }

  private async analyzeOneUri(uri: vscode.Uri, token: vscode.CancellationToken): Promise<void> {
    try {
      const data = await vscode.workspace.fs.readFile(uri);
      if (token.isCancellationRequested) return;
      if (data.byteLength > this.config.workspaceMaxFileSizeBytes) {
        this.index.delete(uri.toString());
        return;
      }
      const code = new TextDecoder('utf-8').decode(data);
      const lang = languageIdFromPath(uri.fsPath);
      const raw = analyze({ code, languageId: lang });
      const label = fileLabelForUri(uri);
      const scoped = scopeIssuesToWorkspaceFile(uri.toString(), label, raw);
      this.index.set(uri.toString(), scoped);
    } catch {
      this.index.delete(uri.toString());
    }
  }
}
