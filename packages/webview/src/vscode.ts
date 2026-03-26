import type { WebviewToHostMessage } from '@bughunter/shared';

declare global {
  interface Window {
    acquireVsCodeApi?: () => {
      postMessage: (msg: WebviewToHostMessage) => void;
    };
  }
}

function getApi() {
  const api = window.acquireVsCodeApi?.();
  if (!api) {
    return {
      postMessage: (msg: WebviewToHostMessage) => {
        // Dev outside VS Code
        console.debug('[webview] postMessage', msg);
      },
    };
  }
  return api;
}

export const vscode = getApi();
