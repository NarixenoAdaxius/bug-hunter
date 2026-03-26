import * as vscode from 'vscode';

export class BugHunterConfiguration {
  get fileHooksEnabled(): boolean {
    return vscode.workspace.getConfiguration('bugHunter').get('fileHooksEnabled', true);
  }

  get fileHookDebounceMs(): number {
    return vscode.workspace.getConfiguration('bugHunter').get('fileHookDebounceMs', 500);
  }
}
