import * as vscode from 'vscode';
import { createExtensionServices } from './di/container.js';

export function activate(context: vscode.ExtensionContext): void {
  try {
    createExtensionServices(context);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    vscode.window.showErrorMessage(`Bug Hunter failed to activate: ${msg}`);
    throw err;
  }
}

export function deactivate(): void {}
