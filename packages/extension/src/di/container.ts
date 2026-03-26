import * as vscode from 'vscode';
import type { AiProvider } from '@bughunter/ai';
import { StubAiProvider } from '@bughunter/ai';
import { analyze } from '@bughunter/analyzers';
import { simulateEncounter, xpRequiredToLevelUp } from '@bughunter/game-engine';
import type { Bug, FileAnalyzedPayload } from '@bughunter/shared';
import { EventBus } from '../bus/eventBus.js';
import { registerCommands } from '../commands/registerCommands.js';
import { BugHunterConfiguration } from '../config/configuration.js';
import { registerFileHooks } from '../files/fileHooks.js';
import { spawnBugs } from '../game/bugMapper.js';
import { mergeSpawnedBugs } from '../game/mergeSpawnedBugs.js';
import { StateManager } from '../state/stateManager.js';
import { BugHunterViewProvider } from '../webview/BugHunterViewProvider.js';

export type ExtensionServices = {
  bus: EventBus;
  configuration: BugHunterConfiguration;
  stateManager: StateManager;
  viewProvider: BugHunterViewProvider;
  aiProvider: AiProvider;
};

export function createExtensionServices(context: vscode.ExtensionContext): ExtensionServices {
  const bus = new EventBus();
  const configuration = new BugHunterConfiguration();
  const stateManager = new StateManager();
  const aiProvider: AiProvider = new StubAiProvider();
  const viewProvider = new BugHunterViewProvider(context.extensionUri, bus, stateManager);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(BugHunterViewProvider.viewType, viewProvider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),
    registerFileHooks(bus, configuration)
  );

  registerCommands(context, viewProvider);

  const fileAnalyzedSub = bus.on('FILE_ANALYZED', (payload: FileAnalyzedPayload) => {
    try {
      const editor = vscode.window.activeTextEditor;
      if (!editor || editor.document.uri.toString() !== payload.uri) {
        return;
      }
      const code = editor.document.getText();
      const issues = analyze({ code, languageId: payload.languageId });
      const spawned = spawnBugs(issues);
      const bugs = mergeSpawnedBugs(stateManager.get().bugs, spawned);
      stateManager.update({ issues, bugs });
      bus.emit('BUG_SPAWNED', { bugs });
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
        if (!bug || bug.hp <= 0) return;

        const result = simulateEncounter(state.game, state.player, bug, Math.random);

        const updatedBugs = state.bugs.map((b: Bug) => (b.id === bug.id ? result.bug : b));

        const session = { ...state.session };
        if (result.victory) {
          session.bugsDefeated += 1;
          bus.emit('BUG_DEFEATED', {
            bug: result.bug,
            xpAwarded:
              result.log.find((e) => e.kind === 'bugDefeated')?.kind === 'bugDefeated'
                ? (result.log.find((e) => e.kind === 'bugDefeated') as { xpAwarded: number })
                    .xpAwarded
                : 0,
          });
        }

        const game = {
          ...result.gameState,
          xpToNextLevel: xpRequiredToLevelUp(result.gameState.level),
        };

        stateManager.update({
          game,
          player: result.player,
          bugs: updatedBugs,
          session,
          combatLog: result.log,
        });

        viewProvider.postCombatLog(result.log);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      vscode.window.showErrorMessage(`Bug Hunter: combat action failed — ${msg}`);
    }
  });

  context.subscriptions.push(fileAnalyzedSub, userActionSub);

  return { bus, configuration, stateManager, viewProvider, aiProvider };
}
