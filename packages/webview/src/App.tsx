import { ActivityLog } from './components/ActivityLog';
import { BugArena } from './components/BugArena';
import { Dashboard } from './components/Dashboard';
import { IssuesPanel } from './components/IssuesPanel';
import { useHostState } from './hooks/useHostState';

export function App() {
  const state = useHostState();
  const ready = state != null;

  return (
    <div className="min-h-screen bg-bh-bg text-bh-text flex flex-col">
      <header className="shrink-0 border-b border-bh-border px-panel py-panel">
        <h1 className="text-lg font-semibold tracking-tight">Bug Hunter</h1>
        <p className="text-xs text-bh-muted mt-0.5">
          {ready ? 'Connected' : 'Waiting for extension…'}
        </p>
      </header>

      <main className="flex-1 overflow-y-auto px-panel py-panel space-y-3 min-h-0">
        {state == null ? (
          <p className="text-sm text-bh-muted py-10 text-center">Waiting for extension…</p>
        ) : (
          <>
            <Dashboard game={state.game} session={state.session} />
            <BugArena bugs={state.bugs} />
            <ActivityLog entries={state.activityLog} />
            <IssuesPanel issues={state.issues} />
          </>
        )}
      </main>
    </div>
  );
}
