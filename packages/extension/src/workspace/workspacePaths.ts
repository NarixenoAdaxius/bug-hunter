import * as path from 'node:path';
import * as vscode from 'vscode';

export function fileLabelForUri(uri: vscode.Uri): string {
  const folder = vscode.workspace.getWorkspaceFolder(uri);
  if (!folder) {
    return uri.fsPath;
  }
  const rel = path.relative(folder.uri.fsPath, uri.fsPath);
  return rel || uri.fsPath;
}

export { shouldSkipWorkspacePath } from './workspaceExclude.js';

export function isAnalyzableWorkspaceUri(uri: vscode.Uri): boolean {
  const s = uri.scheme;
  return s !== 'git' && s !== 'output' && s !== 'debug';
}
