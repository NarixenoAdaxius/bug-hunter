import * as vscode from 'vscode';
import type { CompanionPanelMode, SidebarUiVisibility } from '@bughunter/shared';

const COMPANION_MODES: readonly CompanionPanelMode[] = ['none', 'always', 'equippedOnly'];

export class BugHunterConfiguration {
  get fileHooksEnabled(): boolean {
    return vscode.workspace.getConfiguration('bugHunter').get('fileHooksEnabled', true);
  }

  get fileHookDebounceMs(): number {
    return vscode.workspace.getConfiguration('bugHunter').get('fileHookDebounceMs', 500);
  }

  get workspaceScanEnabled(): boolean {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceScanEnabled', true);
  }

  get workspaceScanInclude(): string {
    return vscode.workspace
      .getConfiguration('bugHunter')
      .get('workspaceScanInclude', '**/*.{js,cjs,mjs,jsx,ts,tsx}');
  }

  /** Comma-separated path fragments (substring match) to skip in addition to built-in excludes. */
  get workspaceScanExcludeExtra(): string {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceScanExclude', '') ?? '';
  }

  get workspaceMaxFileSizeBytes(): number {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceMaxFileSizeBytes', 524_288);
  }

  get workspaceScanConcurrency(): number {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceScanConcurrency', 6);
  }

  get workspaceMaxUiIssues(): number {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceMaxUiIssues', 500);
  }

  /** When workspace scan is on, debounce open/change hooks to refresh in-memory buffers. */
  get workspaceLiveBuffers(): boolean {
    return vscode.workspace.getConfiguration('bugHunter').get('workspaceLiveBuffers', true);
  }

  /** Sidebar webview panel toggles (Settings → Bug Hunter). */
  get sidebarUiVisibility(): SidebarUiVisibility {
    const c = vscode.workspace.getConfiguration('bugHunter');
    const raw = c.get<string>('sidebar.companion', 'always');
    const companionMode: CompanionPanelMode = COMPANION_MODES.includes(raw as CompanionPanelMode)
      ? (raw as CompanionPanelMode)
      : 'always';
    return {
      showDashboard: c.get('sidebar.dashboard', true),
      showStore: c.get('sidebar.store', true),
      showBugArena: c.get('sidebar.bugArena', true),
      showDefeatedArchive: c.get('sidebar.defeatedArchive', true),
      showActivityLog: c.get('sidebar.activityLog', true),
      showIssuesPanel: c.get('sidebar.issues', true),
      showHeaderProfile: c.get('sidebar.headerProfile', true),
      companionMode,
    };
  }
}
