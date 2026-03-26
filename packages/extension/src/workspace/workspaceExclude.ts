/** Built-in noise paths plus comma-separated user fragments (substring match, lowercased). */
export function shouldSkipWorkspacePath(fsPath: string, extraExcludeCsv: string): boolean {
  const norm = fsPath.replace(/\\/g, '/').toLowerCase();
  const builtIn = [
    '/node_modules/',
    '/.git/',
    '/dist/',
    '/out/',
    '/build/',
    '/coverage/',
    '/.next/',
    '/media/webview/',
  ];
  for (const b of builtIn) {
    if (norm.includes(b)) return true;
  }
  for (const frag of extraExcludeCsv
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)) {
    const n = frag.replace(/\\/g, '/');
    if (n && norm.includes(n)) return true;
  }
  return false;
}
