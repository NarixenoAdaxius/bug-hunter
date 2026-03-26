import * as vscode from 'vscode';
import type { BugHunterViewProvider } from '../webview/BugHunterViewProvider.js';

type CommandContext = {
  provider: BugHunterViewProvider;
  rescanWorkspace?: () => void;
};

const COMMAND_HANDLERS: Record<string, (ctx: CommandContext) => void> = {
  'bugHunter.refresh': (ctx) => ctx.provider.refresh(),
  'bugHunter.focus': () => {
    void vscode.commands.executeCommand('bugHunter.sidebar.focus');
  },
  'bugHunter.rescanWorkspace': (ctx) => ctx.rescanWorkspace?.(),
};

export function registerCommands(
  context: vscode.ExtensionContext,
  provider: BugHunterViewProvider,
  options?: { rescanWorkspace?: () => void }
): void {
  const ctx: CommandContext = { provider, rescanWorkspace: options?.rescanWorkspace };
  for (const [commandId, run] of Object.entries(COMMAND_HANDLERS)) {
    context.subscriptions.push(
      vscode.commands.registerCommand(commandId, () => {
        try {
          run(ctx);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          vscode.window.showErrorMessage(`Bug Hunter command "${commandId}" failed: ${msg}`);
        }
      })
    );
  }
}
