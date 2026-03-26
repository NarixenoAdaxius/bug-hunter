import { useEffect, useState } from 'react';
import type { AppState, CombatLogEntry, HostToWebviewMessage } from '@bughunter/shared';
import { vscode } from '../vscode';

function isHostMessage(data: unknown): data is HostToWebviewMessage {
  if (data == null || typeof data !== 'object' || !('type' in data)) return false;
  const t = (data as { type: unknown }).type;
  return t === 'stateUpdate' || t === 'combatLog' || t === 'ping';
}

export type HostState = Partial<AppState> & {
  activityLog: CombatLogEntry[];
};

export function useHostState() {
  const [state, setState] = useState<HostState | null>(null);

  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const data = event.data;
      if (!isHostMessage(data)) return;
      if (data.type === 'stateUpdate') {
        setState((prev) => ({
          ...(prev ?? { activityLog: [] }),
          ...data.payload,
        }));
      } else if (data.type === 'combatLog') {
        setState((prev) => {
          if (!prev) return { activityLog: data.payload };
          return {
            ...prev,
            activityLog: [...prev.activityLog, ...data.payload],
          };
        });
      } else if (data.type === 'ping') {
        vscode.postMessage({ type: 'ready' });
      }
    };
    window.addEventListener('message', handler);
    vscode.postMessage({ type: 'ready' });
    return () => window.removeEventListener('message', handler);
  }, []);

  return state;
}
