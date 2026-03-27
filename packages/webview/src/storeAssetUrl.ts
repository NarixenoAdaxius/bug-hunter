function webviewExtensionBase(): string | undefined {
  if (typeof globalThis === 'undefined') return undefined;
  const v = (globalThis as Record<string, unknown>)['__BUGHUNTER_WEBVIEW_BASE__'];
  return typeof v === 'string' && v.length > 0 ? v : undefined;
}

/**
 * Resolve a public asset path (under `packages/webview/public/`) for `img src`.
 * In the VS Code extension, the host injects `globalThis.__BUGHUNTER_WEBVIEW_BASE__` so URLs use
 * `asWebviewUri` — relative `./store/...` paths from React do not load correctly otherwise.
 * Vite dev / plain `index.html` falls back to `import.meta.env.BASE_URL`.
 */
export function storeAssetUrl(publicPath: string): string {
  const p = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath;
  const injected = webviewExtensionBase();
  if (injected) {
    return `${injected}${p}`;
  }
  const base = import.meta.env.BASE_URL;
  return `${base}${p}`;
}
