const JS_LIKE = new Set([
  'javascript',
  'typescript',
  'javascriptreact',
  'typescriptreact',
  'jsx',
  'tsx',
]);

/** When `languageId` is omitted, all language-gated rules run (caller decides). */
export function isJsLikeLanguage(languageId: string | undefined): boolean {
  if (languageId === undefined) {
    return true;
  }
  return JS_LIKE.has(languageId.toLowerCase());
}
