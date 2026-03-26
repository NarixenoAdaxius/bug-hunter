import * as vscode from 'vscode';
import type { FileAnalyzedPayload } from '@bughunter/shared';
import type { EventBus } from '../bus/eventBus.js';
import type { BugHunterConfiguration } from '../config/configuration.js';

/** Skip virtual / output buffers; allow `file`, `untitled`, `vscode-remote`, etc. */
function isAnalyzableUri(uri: vscode.Uri): boolean {
  const s = uri.scheme;
  return s !== 'git' && s !== 'output' && s !== 'debug';
}

/**
 * Emit analysis for whatever editor is active now. Use once after registration: the extension often
 * activates when the sidebar opens, after `onDidOpenTextDocument` already ran for restored tabs.
 */
export function analyzeCurrentlyActiveDocument(
  bus: EventBus,
  config: BugHunterConfiguration
): void {
  if (!config.fileHooksEnabled) {
    return;
  }
  const ed = vscode.window.activeTextEditor;
  const doc = ed?.document;
  if (!doc || !isAnalyzableUri(doc.uri)) {
    return;
  }
  const payload: FileAnalyzedPayload = {
    uri: doc.uri.toString(),
    languageId: doc.languageId,
    reason: 'open',
  };
  bus.emit('FILE_ANALYZED', payload);
}

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
    if (config.workspaceScanEnabled && !config.workspaceLiveBuffers) {
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
    if (!isAnalyzableUri(e.document.uri)) {
      return;
    }
    schedule(e.document.uri, e.document.languageId, 'change');
  });

  const subOpen = vscode.workspace.onDidOpenTextDocument((doc) => {
    if (!isAnalyzableUri(doc.uri)) {
      return;
    }
    schedule(doc.uri, doc.languageId, 'open');
  });

  const subActive = vscode.window.onDidChangeActiveTextEditor((ed) => {
    const doc = ed?.document;
    if (!doc || !isAnalyzableUri(doc.uri)) {
      return;
    }
    schedule(doc.uri, doc.languageId, 'open');
  });

  return vscode.Disposable.from(
    subChange,
    subOpen,
    subActive,
    new vscode.Disposable(() => {
      for (const t of pending.values()) {
        clearTimeout(t);
      }
      pending.clear();
    })
  );
}
