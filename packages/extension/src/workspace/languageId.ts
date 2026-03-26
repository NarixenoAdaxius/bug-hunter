/** Infer VS Code–style language id from a filesystem path (no document open required). */
export function languageIdFromPath(fsPath: string): string {
  const lower = fsPath.toLowerCase();
  if (lower.endsWith('.tsx')) return 'typescriptreact';
  if (lower.endsWith('.ts')) return 'typescript';
  if (lower.endsWith('.jsx')) return 'javascriptreact';
  if (lower.endsWith('.mjs') || lower.endsWith('.cjs') || lower.endsWith('.js'))
    return 'javascript';
  return 'plaintext';
}
