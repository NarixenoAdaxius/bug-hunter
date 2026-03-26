import * as vscode from 'vscode';
import type { BugHunterEvent, EventPayloadMap } from '@bughunter/shared';

type Listener<E extends BugHunterEvent> = (payload: EventPayloadMap[E]) => void;

export class EventBus {
  private readonly listeners = new Map<BugHunterEvent, Set<Listener<BugHunterEvent>>>();

  on<E extends BugHunterEvent>(event: E, listener: Listener<E>): vscode.Disposable {
    let set = this.listeners.get(event);
    if (!set) {
      set = new Set();
      this.listeners.set(event, set);
    }
    set.add(listener as Listener<BugHunterEvent>);
    return new vscode.Disposable(() => {
      set?.delete(listener as Listener<BugHunterEvent>);
      if (set?.size === 0) {
        this.listeners.delete(event);
      }
    });
  }

  emit<E extends BugHunterEvent>(event: E, payload: EventPayloadMap[E]): void {
    const set = this.listeners.get(event);
    if (!set) {
      return;
    }
    for (const listener of set) {
      listener(payload);
    }
  }
}
