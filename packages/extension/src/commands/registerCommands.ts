import * as vscode from 'vscode';
import type { BugHunterViewProvider } from '../webview/BugHunterViewProvider.js';

const COMMAND_HANDLERS: Record<string, (provider: BugHunterViewProvider) => void> = {
  'bugHunter.refresh': (provider) => provider.refresh(),
  'bugHunter.focus': () => {
    void vscode.commands.executeCommand('bugHunter.sidebar.focus');
  },
};

export function registerCommands(
  context: vscode.ExtensionContext,
  provider: BugHunterViewProvider
): void {
  for (const [commandId, run] of Object.entries(COMMAND_HANDLERS)) {
    context.subscriptions.push(
      vscode.commands.registerCommand(commandId, () => {
        try {
          run(provider);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(`Bug Hunter command "${commandId}" failed: ${msg}`);
        }
      })
    );
  }
}
