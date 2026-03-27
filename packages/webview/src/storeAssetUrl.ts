/** Resolve a path relative to `packages/webview/public/` for use in `src` (Vite `base` is `./`). */
export function storeAssetUrl(publicPath: string): string {
  const base = import.meta.env.BASE_URL;
  const p = publicPath.startsWith('/') ? publicPath.slice(1) : publicPath;
  return `${base}${p}`;
}
