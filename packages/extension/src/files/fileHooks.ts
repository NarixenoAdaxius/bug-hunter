import * as vscode from 'vscode';
import type { FileAnalyzedPayload } from '@bughunter/shared';
import type { EventBus } from '../bus/eventBus.js';
import type { BugHunterConfiguration } from '../config/configuration.js';

export function registerFileHooks(
  bus: EventBus,
  config: BugHunterConfiguration
): vscode.Disposable {
  const pending = new Map<string, ReturnType<typeof setTimeout>>();

  const flush = (
    uri: vscode.Uri,
    languageId: string,
    reason: FileAnalyzedPayload['reason']
  ): void => {
    const payload: FileAnalyzedPayload = {
      uri: uri.toString(),
      languageId,
      reason,
    };
    bus.emit('FILE_ANALYZED', payload);
  };

  const schedule = (
    uri: vscode.Uri,
    languageId: string,
    reason: FileAnalyzedPayload['reason']
  ): void => {
    if (!config.fileHooksEnabled) {
      return;
    }
    const key = uri.toString();
    const existing = pending.get(key);
    if (existing !== undefined) {
      clearTimeout(existing);
    }
    const ms = config.fileHookDebounceMs;
    pending.set(
      key,
      setTimeout(() => {
        pending.delete(key);
        flush(uri, languageId, reason);
      }, ms)
    );
  };

  const subChange = vscode.workspace.onDidChangeTextDocument((e) => {
    schedule(e.document.uri, e.document.languageId, 'change');
  });

  const subOpen = vscode.workspace.onDidOpenTextDocument((doc) => {
    schedule(doc.uri, doc.languageId, 'open');
  });

  return vscode.Disposable.from(
    subChange,
    subOpen,
    new vscode.Disposable(() => {
      for (const t of pending.values()) {
        clearTimeout(t);
      }
      pending.clear();
    })
  );
}
