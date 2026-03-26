import * as vscode from 'vscode';
import type { AiProvider } from '@bughunter/ai';
import { StubAiProvider } from '@bughunter/ai';
import { analyze } from '@bughunter/analyzers';
import { applyXpToGameState, xpRequiredToLevelUp, xpForDefeatingBug } from '@bughunter/game-engine';
import type { ActivityLogEntry, Bug, FileAnalyzedPayload, Issue } from '@bughunter/shared';
import { EventBus } from '../bus/eventBus.js';
import { registerCommands } from '../commands/registerCommands.js';
import { BugHunterConfiguration } from '../config/configuration.js';
import { analyzeCurrentlyActiveDocument, registerFileHooks } from '../files/fileHooks.js';
import { spawnBugs } from '../game/bugMapper.js';
import { mergeSpawnedBugs } from '../game/mergeSpawnedBugs.js';
import { StateManager, DEFAULT_APP_STATE } from '../state/stateManager.js';
import { BugHunterViewProvider } from '../webview/BugHunterViewProvider.js';
import { capIssuesForUi } from '../workspace/issueCaps.js';
import { scopeIssuesToWorkspaceFile } from '../workspace/issueNamespace.js';
import { shouldSkipWorkspacePath } from '../workspace/workspaceExclude.js';
import { fileLabelForUri } from '../workspace/workspacePaths.js';
import { WorkspaceCrawler } from '../workspace/workspaceCrawler.js';
import { WorkspaceIssueIndex } from '../workspace/workspaceIssueIndex.js';

export type ExtensionServices = {
  bus: EventBus;
  configuration: BugHunterConfiguration;
  stateManager: StateManager;
  viewProvider: BugHunterViewProvider;
  aiProvider: AiProvider;
};

const STATE_KEY = 'bugHunterState';
const PERSIST_DEBOUNCE_MS = 1500;

export function createExtensionServices(context: vscode.ExtensionContext): ExtensionServices {
  const bus = new EventBus();
  const configuration = new BugHunterConfiguration();

  const persisted = context.workspaceState.get<Record<string, unknown>>(STATE_KEY);
  const initial = persisted ? { ...DEFAULT_APP_STATE, ...persisted } : { ...DEFAULT_APP_STATE };
  const stateManager = new StateManager(initial as import('@bughunter/shared').AppState);

  let persistTimer: ReturnType<typeof setTimeout> | undefined;
  const persistState = () => {
    if (persistTimer !== undefined) clearTimeout(persistTimer);
    persistTimer = setTimeout(() => {
      void context.workspaceState.update(STATE_KEY, stateManager.get());
    }, PERSIST_DEBOUNCE_MS);
  };
  stateManager.subscribe(() => persistState());
  context.subscriptions.push(
    new vscode.Disposable(() => {
      if (persistTimer !== undefined) clearTimeout(persistTimer);
      void context.workspaceState.update(STATE_KEY, stateManager.get());
    })
  );

  const aiProvider: AiProvider = new StubAiProvider();
  const viewProvider = new BugHunterViewProvider(context.extensionUri, bus, stateManager);
  const issueIndex = new WorkspaceIssueIndex();

  const pushIssuesToState = (issues: Issue[]): void => {
    const spawned = spawnBugs(issues);
    const bugs = mergeSpawnedBugs(stateManager.get().bugs, spawned);
    stateManager.update({ issues, bugs });
    bus.emit('BUG_SPAWNED', { bugs });
    checkFightingBugsResolved();
  };

  /** After any rescan, check if fighting bugs had their issues resolved. */
  const checkFightingBugsResolved = (): void => {
    const state = stateManager.get();
    const fighting = state.bugs.filter((b) => b.status === 'fighting');
    if (fighting.length === 0) return;

    const currentIssueIds = new Set(state.issues.map((i) => i.id));
    const nowDefeated: Bug[] = [];
    const stillActive: Bug[] = [];

    for (const bug of state.bugs) {
      if (bug.status === 'fighting' && !currentIssueIds.has(bug.issue.id)) {
        nowDefeated.push({
          ...bug,
          status: 'defeated',
          defeatedAt: Date.now(),
        });
      } else {
        stillActive.push(bug);
      }
    }

    if (nowDefeated.length === 0) return;

    let game = { ...state.game };
    const newLogEntries: ActivityLogEntry[] = [];
    let totalDefeated = 0;

    for (const bug of nowDefeated) {
      const xp = xpForDefeatingBug(bug);
      game = applyXpToGameState(game, xp);
      game = { ...game, xpToNextLevel: xpRequiredToLevelUp(game.level) };
      totalDefeated += 1;
      newLogEntries.push({ kind: 'defeated', bugName: bug.name, xpAwarded: xp });
      bus.emit('BUG_DEFEATED', { bug, xpAwarded: xp });
    }

    const defeatedBugs = [...state.defeatedBugs, ...nowDefeated];
    const session = { ...state.session, bugsDefeated: state.session.bugsDefeated + totalDefeated };
    const activityLog = [...state.activityLog, ...newLogEntries];

    stateManager.update({
      bugs: stillActive,
      defeatedBugs,
      game,
      session,
      activityLog,
    });
    viewProvider.postActivityLog(newLogEntries);
  };

  const crawler = new WorkspaceCrawler(configuration, issueIndex, pushIssuesToState);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(BugHunterViewProvider.viewType, viewProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    registerFileHooks(bus, configuration),
    new vscode.Disposable(() => crawler.dispose()),
    vscode.workspace.onDidSaveTextDocument((doc) => {
      if (configuration.workspaceScanEnabled) {
        void crawler.rescanUri(doc.uri);
      }
    }),
    vscode.workspace.onDidChangeWorkspaceFolders(() => {
      if (configuration.workspaceScanEnabled) {
        crawler.requestFullScan();
      }
    })
  );

  if (configuration.workspaceScanEnabled) {
    const t = setTimeout(() => crawler.requestFullScan(), 400);
    context.subscriptions.push(new vscode.Disposable(() => clearTimeout(t)));
  } else {
    analyzeCurrentlyActiveDocument(bus, configuration);
  }

  registerCommands(context, viewProvider, {
    rescanWorkspace: () => {
      if (configuration.workspaceScanEnabled) {
        crawler.requestFullScan();
      } else {
        void vscode.window.showInformationMessage(
          'Bug Hunter: enable "Workspace scan" in settings to crawl the repository.'
        );
      }
    },
  });

  const fileAnalyzedSub = bus.on('FILE_ANALYZED', (payload: FileAnalyzedPayload) => {
    try {
      if (configuration.workspaceScanEnabled) {
        const doc = vscode.workspace.textDocuments.find((d) => d.uri.toString() === payload.uri);
        if (!doc || doc.isClosed) return;
        const uri = doc.uri;
        if (shouldSkipWorkspacePath(uri.fsPath, configuration.workspaceScanExcludeExtra)) {
          issueIndex.delete(uri.toString());
          pushIssuesToState(
            capIssuesForUi(issueIndex.flatten(), configuration.workspaceMaxUiIssues)
          );
          return;
        }
        const code = doc.getText();
        const raw = analyze({ code, languageId: payload.languageId });
        const label = fileLabelForUri(uri);
        const scoped = scopeIssuesToWorkspaceFile(uri.toString(), label, raw);
        issueIndex.set(uri.toString(), scoped);
        pushIssuesToState(capIssuesForUi(issueIndex.flatten(), configuration.workspaceMaxUiIssues));
        return;
      }

      const doc = vscode.workspace.textDocuments.find((d) => d.uri.toString() === payload.uri);
      if (!doc || doc.isClosed) return;
      const code = doc.getText();
      const issues = analyze({ code, languageId: payload.languageId });
      const spawned = spawnBugs(issues);
      const bugs = mergeSpawnedBugs(stateManager.get().bugs, spawned);
      stateManager.update({ issues, bugs });
      bus.emit('BUG_SPAWNED', { bugs });
      checkFightingBugsResolved();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Bug Hunter: analysis failed — ${msg}`);
    }
  });

  const userActionSub = bus.on('USER_ACTION', (payload) => {
    try {
      if (payload.action === 'attack' && payload.bugId) {
        const state = stateManager.get();
        const bug = state.bugs.find((b: Bug) => b.id === payload.bugId);
        if (!bug || bug.status === 'defeated') return;

        const sourceUri = bug.issue.sourceUri;
        if (!sourceUri) {
          void vscode.window.showWarningMessage(
            `Bug Hunter: cannot navigate — no source file recorded for "${bug.name}".`
          );
          return;
        }

        const uri = vscode.Uri.parse(sourceUri);
        const line = Math.max(0, (bug.issue.line ?? 1) - 1);
        const range = new vscode.Range(line, 0, line, 0);

        void vscode.workspace.openTextDocument(uri).then((doc) => {
          void vscode.window.showTextDocument(doc, {
            selection: range,
            preserveFocus: false,
          });
        });

        const updatedBugs = state.bugs.map((b: Bug) =>
          b.id === bug.id ? { ...b, status: 'fighting' as const } : b
        );

        const logEntry: ActivityLogEntry = {
          kind: 'engaging',
          bugName: bug.name,
          fileLabel: bug.issue.fileLabel ?? 'unknown file',
        };

        stateManager.update({
          bugs: updatedBugs,
          activityLog: [...state.activityLog, logEntry],
        });
        viewProvider.postActivityLog([logEntry]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Bug Hunter: attack action failed — ${msg}`);
    }
  });

  context.subscriptions.push(fileAnalyzedSub, userActionSub);

  return { bus, configuration, stateManager, viewProvider, aiProvider };
}
