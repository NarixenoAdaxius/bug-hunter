import * as vscode from 'vscode';

export class BugHunterConfiguration {
  get fileHooksEnabled(): boolean {
    return vscode.workspace.getConfiguration('bugHunter').get('fileHooksEnabled', true);
  }

  get fileHookDebounceMs(): number {
    return vscode.workspace.getConfiguration('bugHunter').get('fileHookDebounceMs', 500);
  }

  get workspaceScanEnabled(): boolean {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceScanEnabled', true);
  }

  get workspaceScanInclude(): string {
    return vscode.workspace
      .getConfiguration('bugHunter')
      .get('workspaceScanInclude', '**/*.{js,cjs,mjs,jsx,ts,tsx}');
  }

  /** Comma-separated path fragments (substring match) to skip in addition to built-in excludes. */
  get workspaceScanExcludeExtra(): string {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceScanExclude', '') ?? '';
  }

  get workspaceMaxFileSizeBytes(): number {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceMaxFileSizeBytes', 524_288);
  }

  get workspaceScanConcurrency(): number {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceScanConcurrency', 6);
  }

  get workspaceMaxUiIssues(): number {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceMaxUiIssues', 500);
  }

  /** When workspace scan is on, debounce open/change hooks to refresh in-memory buffers. */
  get workspaceLiveBuffers(): boolean {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceLiveBuffers', true);
  }
}
