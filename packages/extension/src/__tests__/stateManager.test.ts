import { describe, it, expect, vi } from 'vitest';
import { StateManager, DEFAULT_APP_STATE } from '../state/stateManager.js';

describe('StateManager', () => {
  it('initializes with default state', () => {
    const sm = new StateManager();
    const state = sm.get();
    expect(state.game.level).toBe(1);
    expect(state.bugs).toEqual([]);
    expect(state.issues).toEqual([]);
  });

  it('updates state with partial merge', () => {
    const sm = new StateManager();
    sm.update({ game: { level: 5, xp: 42, xpToNextLevel: 500 } });
    expect(sm.get().game.level).toBe(5);
    expect(sm.get().game.xp).toBe(42);
    expect(sm.get().bugs).toEqual([]);
  });

  it('notifies subscribers on update', () => {
    const sm = new StateManager();
    const listener = vi.fn();
    sm.subscribe(listener);
    sm.update({ game: { level: 2, xp: 0, xpToNextLevel: 200 } });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener.mock.calls[0][0].game.level).toBe(2);
  });

  it('unsubscribe stops notifications', () => {
    const sm = new StateManager();
    const listener = vi.fn();
    const unsub = sm.subscribe(listener);
    unsub();
    sm.update({ game: { level: 3, xp: 0, xpToNextLevel: 300 } });
    expect(listener).not.toHaveBeenCalled();
  });

  it('deep-clones initial state to prevent reference sharing', () => {
    const sm1 = new StateManager();
    const sm2 = new StateManager();
    sm1.update({ game: { level: 99, xp: 0, xpToNextLevel: 9900 } });
    expect(sm2.get().game.level).toBe(1);
    expect(DEFAULT_APP_STATE.game.level).toBe(1);
  });
});
