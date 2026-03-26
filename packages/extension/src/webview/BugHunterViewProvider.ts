import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import type {
  ActivityLogEntry,
  AppState,
  CombatLogEntry,
  HostToWebviewMessage,
  WebviewToHostMessage,
} from '@bughunter/shared';
import type { EventBus } from '../bus/eventBus.js';
import type { StateManager } from '../state/stateManager.js';

export class BugHunterViewProvider implements vscode.WebviewViewProvider {
  static readonly viewType = 'bugHunter.sidebar';

  private view?: vscode.WebviewView;
  private unsubscribeState?: () => void;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly bus: EventBus,
    private readonly stateManager: StateManager
  ) {}

  resolveWebviewView(
    webviewView: vscode.WebviewView,
    _context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ): void {
    this.view = webviewView;
    const { webview } = webviewView;
    webview.options = {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'media', 'webview')],
    };

    try {
      webview.html = this.getHtmlForWebview(webview);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Bug Hunter: failed to load webview — ${msg}`);
      webview.html = `<html><body><p>Failed to load Bug Hunter UI.</p></body></html>`;
    }

    webview.onDidReceiveMessage((raw: unknown) => {
      try {
        if (!isValidWebviewMessage(raw)) return;
        const msg = raw as WebviewToHostMessage;
        if (msg.type === 'ready') {
          this.postState(this.stateManager.get());
        } else if (msg.type === 'userAction') {
          this.bus.emit('USER_ACTION', msg.payload);
        }
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        vscode.window.showErrorMessage(`Bug Hunter: message handling error — ${detail}`);
      }
    });

    this.unsubscribeState = this.stateManager.subscribe((state) => {
      this.postState(state);
    });

    webviewView.onDidDispose(() => {
      this.unsubscribeState?.();
    });
  }

  refresh(): void {
    if (this.view) {
      this.view.webview.html = this.getHtmlForWebview(this.view.webview);
    }
  }

  postActivityLog(entries: ActivityLogEntry[]): void {
    const message: HostToWebviewMessage = { type: 'activityLog', payload: entries };
    void this.view?.webview.postMessage(message);
  }

  postCombatLog(log: CombatLogEntry[]): void {
    const message: HostToWebviewMessage = { type: 'combatLog', payload: log };
    void this.view?.webview.postMessage(message);
  }

  private postState(payload: Partial<AppState>): void {
    const message: HostToWebviewMessage = { type: 'stateUpdate', payload };
    void this.view?.webview.postMessage(message);
  }

  private getHtmlForWebview(webview: vscode.Webview): string {
    const webviewRoot = vscode.Uri.joinPath(this.extensionUri, 'media', 'webview');
    const indexPath = path.join(this.extensionUri.fsPath, 'media', 'webview', 'index.html');
    const raw = fs.readFileSync(indexPath, 'utf8');
    return this.transformHtml(webview, webviewRoot, raw);
  }

  private transformHtml(webview: vscode.Webview, webviewRoot: vscode.Uri, html: string): string {
    const nonce = getNonce();
    const csp = [
      `default-src 'none'`,
      `style-src ${webview.cspSource} 'nonce-${nonce}'`,
      `script-src ${webview.cspSource} 'nonce-${nonce}'`,
      `font-src ${webview.cspSource}`,
      `img-src ${webview.cspSource} https: data:`,
    ].join('; ');

    let withCsp = html.replace(
      /<head([^>]*)>/i,
      `<head$1><meta http-equiv="Content-Security-Policy" content="${csp}">`
    );

    withCsp = withCsp.replace(/(href|src)="([^"]+)"/g, (_match, attr: string, rel: string) => {
      if (rel.startsWith('http') || rel.startsWith('data:')) {
        return `${attr}="${rel}"`;
      }
      const clean = rel.replace(/^\.\//, '');
      const diskPath = vscode.Uri.joinPath(webviewRoot, ...clean.split('/').filter(Boolean));
      const uri = webview.asWebviewUri(diskPath);
      return `${attr}="${uri}"`;
    });

    let withNonce = withCsp.replace(
      /<script type="module"/,
      `<script type="module" nonce="${nonce}"`
    );
    withNonce = withNonce.replace(
      /<link rel="stylesheet"/g,
      `<link rel="stylesheet" nonce="${nonce}"`
    );
    return withNonce;
  }
}

function isValidWebviewMessage(data: unknown): data is WebviewToHostMessage {
  if (data == null || typeof data !== 'object' || !('type' in data)) return false;
  const obj = data as Record<string, unknown>;
  if (obj.type === 'ready') return true;
  if (obj.type === 'userAction') {
    const payload = obj.payload;
    if (payload == null || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    return typeof p.action === 'string';
  }
  return false;
}

function getNonce(): string {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}
