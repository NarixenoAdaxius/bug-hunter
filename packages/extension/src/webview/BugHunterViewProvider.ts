import * as fs from 'node:fs';
import * as path from 'node:path';
import * as vscode from 'vscode';
import type {
  AppState,
  CombatLogEntry,
  HostToWebviewMessage,
  WebviewToHostMessage,
} from '@bughunter/shared';
import type { BugHunterConfiguration } from '../config/configuration.js';
import type { EventBus } from '../bus/eventBus.js';
import type { StateManager } from '../state/stateManager.js';

export type CosmeticActionHandler = (
  payload: Extract<WebviewToHostMessage, { type: 'cosmeticAction' }>['payload']
) => void;

export class BugHunterViewProvider implements vscode.WebviewViewProvider {
  static readonly viewType = 'bugHunter.sidebar';

  private view?: vscode.WebviewView;
  private unsubscribeState?: () => void;

  constructor(
    private readonly extensionUri: vscode.Uri,
    private readonly bus: EventBus,
    private readonly stateManager: StateManager,
    private readonly configuration: BugHunterConfiguration,
    private readonly onCosmeticAction: CosmeticActionHandler
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
        } else if (msg.type === 'cosmeticAction') {
          this.onCosmeticAction(msg.payload);
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

  /** Re-push state when only VS Code settings (e.g. sidebar toggles) changed. */
  notifyUiSettingsChanged(): void {
    if (this.view) {
      this.postState(this.stateManager.get());
    }
  }

  postCombatLog(log: CombatLogEntry[]): void {
    const message: HostToWebviewMessage = { type: 'combatLog', payload: log };
    void this.view?.webview.postMessage(message);
  }

  private postState(state: AppState): void {
    const message: HostToWebviewMessage = {
      type: 'stateUpdate',
      payload: { ...state, uiVisibility: this.configuration.sidebarUiVisibility },
    };
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
  if (obj.type === 'cosmeticAction') {
    const payload = obj.payload;
    if (payload == null || typeof payload !== 'object') return false;
    const p = payload as Record<string, unknown>;
    const cat = p.category;
    const okCat = cat === 'pet' || cat === 'avatar' || cat === 'border' || cat === 'theme';
    return okCat && (p.action === 'purchase' || p.action === 'equip') && typeof p.id === 'string';
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
