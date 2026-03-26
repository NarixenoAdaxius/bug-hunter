import type { AppState } from '@bughunter/shared';

export const DEFAULT_APP_STATE: AppState = {
  game: { level: 1, xp: 0, xpToNextLevel: 100 },
  player: { attack: 12, defense: 4, hp: 100, maxHp: 100 },
  bugs: [],
  defeatedBugs: [],
  issues: [],
  settings: { humorLevel: 1, aiEnabled: false },
  session: { bugsDefeated: 0 },
  activityLog: [],
  combatLog: [],
};

type StateListener = (state: AppState) => void;

export class StateManager {
  private state: AppState;
  private readonly listeners = new Set<StateListener>();

  constructor(initial: AppState = { ...DEFAULT_APP_STATE }) {
    this.state = structuredClone(initial);
  }

  get(): AppState {
    return this.state;
  }

  update(partial: Partial<AppState>): void {
    this.state = { ...this.state, ...partial };
    for (const listener of this.listeners) {
      listener(this.state);
    }
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }
}
