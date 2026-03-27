import * as vscode from 'vscode';
import type { AiProvider } from '@bughunter/ai';
import { StubAiProvider } from '@bughunter/ai';
import { analyze } from '@bughunter/analyzers';
import {
  applyXpToGameState,
  booglesForDefeatingBug,
  equipCosmetic,
  purchaseCosmetic,
  rewardsForLevelRange,
  xpForDefeatingBug,
  xpRequiredToLevelUp,
} from '@bughunter/game-engine';
import type {
  ActivityLogEntry,
  Bug,
  FileAnalyzedPayload,
  Issue,
  WebviewToHostMessage,
} from '@bughunter/shared';
import { EventBus } from '../bus/eventBus.js';
import { registerCommands } from '../commands/registerCommands.js';
import { BugHunterConfiguration } from '../config/configuration.js';
import { analyzeCurrentlyActiveDocument, registerFileHooks } from '../files/fileHooks.js';
import { spawnBugs } from '../game/bugMapper.js';
import { mergeSpawnedBugs } from '../game/mergeSpawnedBugs.js';
import { StateManager, DEFAULT_APP_STATE } from '../state/stateManager.js';
import { mergeCosmetics } from '../state/mergeCosmetics.js';
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
  const initial = {
    ...DEFAULT_APP_STATE,
    ...(persisted ?? {}),
    cosmetics: mergeCosmetics(persisted?.cosmetics),
  } as import('@bughunter/shared').AppState;
  const stateManager = new StateManager(initial);

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

  const applyCosmeticAction = (
    payload: Extract<WebviewToHostMessage, { type: 'cosmeticAction' }>['payload']
  ) => {
    const st = stateManager.get();
    const cosmetics = { ...st.cosmetics };
    if (payload.action === 'purchase') {
      const next = purchaseCosmetic(cosmetics, payload.category, payload.id);
      if (next) {
        stateManager.update({ cosmetics: next });
      } else {
        void vscode.window.showWarningMessage(
          'Bug Hunter: could not complete purchase (unknown item, already owned, or not enough Boogles).'
        );
      }
    } else {
      const next = equipCosmetic(cosmetics, payload.category, payload.id);
      if (next) {
        stateManager.update({ cosmetics: next });
      } else {
        void vscode.window.showWarningMessage(
          'Bug Hunter: could not equip that item (not owned or invalid for this category).'
        );
      }
    }
  };

  const viewProvider = new BugHunterViewProvider(
    context.extensionUri,
    bus,
    stateManager,
    configuration,
    applyCosmeticAction
  );
  const issueIndex = new WorkspaceIssueIndex();

  const pushIssuesToState = (issues: Issue[]): void => {
    const previousBugs = stateManager.get().bugs;
    const spawned = spawnBugs(issues);
    const bugs = mergeSpawnedBugs(previousBugs, spawned);
    stateManager.update({ issues, bugs });
    bus.emit('BUG_SPAWNED', { bugs });
    resolveFightingBugs(previousBugs, bugs);
  };

  /**
   * Compares the previous bug list to the current one after a rescan.
   * Fighting bugs that are no longer present have been resolved by the user;
   * mark them defeated and award XP, Boogles, and level-up bonuses.
   */
  const resolveFightingBugs = (previousBugs: Bug[], currentBugs: Bug[]): void => {
    const previousFighting = previousBugs.filter((b) => b.status === 'fighting');
    if (previousFighting.length === 0) return;

    const currentBugIds = new Set(currentBugs.map((b) => b.id));
    const nowDefeated: Bug[] = [];

    for (const bug of previousFighting) {
      if (!currentBugIds.has(bug.id)) {
        nowDefeated.push({
          ...bug,
          status: 'defeated',
          defeatedAt: Date.now(),
        });
      }
    }

    if (nowDefeated.length === 0) return;

    const state = stateManager.get();
    let game = { ...state.game };
    let cosmetics = { ...state.cosmetics };
    const newLogEntries: ActivityLogEntry[] = [];
    let totalDefeated = 0;

    for (const bug of nowDefeated) {
      const xp = xpForDefeatingBug(bug);
      const bg = booglesForDefeatingBug(bug);
      const levelBefore = game.level;
      game = applyXpToGameState(game, xp);
      game = { ...game, xpToNextLevel: xpRequiredToLevelUp(game.level) };
      cosmetics = { ...cosmetics, boogles: cosmetics.boogles + bg };
      totalDefeated += 1;
      newLogEntries.push({
        kind: 'defeated',
        bugName: bug.name,
        xpAwarded: xp,
        booglesAwarded: bg,
      });
      bus.emit('BUG_DEFEATED', { bug, xpAwarded: xp });

      if (game.level > levelBefore) {
        const { totalBoogles, title } = rewardsForLevelRange(levelBefore, game.level);
        cosmetics = {
          ...cosmetics,
          boogles: cosmetics.boogles + totalBoogles,
          profileTitle: title ?? cosmetics.profileTitle,
        };
        newLogEntries.push({
          kind: 'levelUp',
          newLevel: game.level,
          booglesBonus: totalBoogles,
          ...(title ? { title } : {}),
        });
        void vscode.window.showInformationMessage(
          `Bug Hunter: Level ${game.level}!${title ? ` — ${title}` : ''} (+${totalBoogles} Boogles)`
        );
      }
    }

    const defeatedBugs = [...state.defeatedBugs, ...nowDefeated];
    const session = { ...state.session, bugsDefeated: state.session.bugsDefeated + totalDefeated };
    const activityLog = [...state.activityLog, ...newLogEntries];

    stateManager.update({ defeatedBugs, game, session, activityLog, cosmetics });
  };

  const crawler = new WorkspaceCrawler(configuration, issueIndex, pushIssuesToState);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(BugHunterViewProvider.viewType, viewProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('bugHunter')) {
        viewProvider.notifyUiSettingsChanged();
      }
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
      const previousBugs = stateManager.get().bugs;
      const spawned = spawnBugs(issues);
      const bugs = mergeSpawnedBugs(previousBugs, spawned);
      stateManager.update({ issues, bugs });
      bus.emit('BUG_SPAWNED', { bugs });
      resolveFightingBugs(previousBugs, bugs);
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
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Bug Hunter: attack action failed — ${msg}`);
    }
  });

  context.subscriptions.push(fileAnalyzedSub, userActionSub);

  return { bus, configuration, stateManager, viewProvider, aiProvider };
}
