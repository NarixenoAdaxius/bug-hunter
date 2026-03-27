import { useState } from 'react';
import { ActivityLog } from './components/ActivityLog';
import { BugArena } from './components/BugArena';
import { CompanionPet } from './components/CompanionPet';
import { Dashboard } from './components/Dashboard';
import { DefeatedArchive } from './components/DefeatedArchive';
import { IssuesPanel } from './components/IssuesPanel';
import { StorePage } from './components/StorePage';
import { useHostState } from './hooks/useHostState';
import { DEFAULT_COSMETICS, DEFAULT_SIDEBAR_UI_VISIBILITY } from '@bughunter/shared';
import type { SidebarUiVisibility } from '@bughunter/shared';
import { findStoreItem } from '@bughunter/game-engine';
import { borderRingClass } from './profile/profileVisuals';
import { storeAssetUrl } from './storeAssetUrl';

function AvatarBadge({ avatarId }: { avatarId: string }) {
  const [imgFailed, setImgFailed] = useState(false);

  if (avatarId === 'avatar-default') {
    return <span className="text-sm font-bold text-bh-text-secondary">BH</span>;
  }
  const item = findStoreItem(avatarId);
  if (!item) {
    return <span className="text-sm font-bold text-bh-text-secondary">?</span>;
  }
  if (item.assetPath && !imgFailed) {
    return (
      <img
        src={storeAssetUrl(item.assetPath)}
        alt=""
        className="h-8 w-8 object-contain"
        draggable={false}
        onError={() => setImgFailed(true)}
      />
    );
  }
  return (
    <span className="text-lg font-bold text-bh-text-secondary leading-none">{item.glyph}</span>
  );
}

function showCompanionPanel(ui: SidebarUiVisibility, equippedPetId: string | null): boolean {
  if (ui.companionMode === 'none') return false;
  if (ui.companionMode === 'equippedOnly') return equippedPetId != null && equippedPetId !== '';
  return true;
}

type MainTab = 'home' | 'store';

export function App() {
  const state = useHostState();
  const ready = state != null;
  const cosmetics = state?.cosmetics ?? DEFAULT_COSMETICS;
  const themeId = cosmetics.equippedPanelThemeId;
  const ui = state?.uiVisibility ?? DEFAULT_SIDEBAR_UI_VISIBILITY;
  const showCompanion = showCompanionPanel(ui, cosmetics.equippedPetId);
  const showStore = ui.showStore;
  const [activeTab, setActiveTab] = useState<MainTab>('home');
  /** When the store is hidden by settings, always show home content without mutating tab state. */
  const mainTab: MainTab = showStore ? activeTab : 'home';

  const tabButtonClass = (tab: MainTab) =>
    `flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
      activeTab === tab
        ? 'bg-bh-card text-bh-text border border-bh-border'
        : 'text-bh-muted hover:text-bh-text-secondary border border-transparent'
    }`;

  return (
    <div
      className="min-h-screen bg-bh-bg text-bh-text flex flex-col transition-colors duration-300"
      data-bh-theme={themeId}
    >
      <header className="shrink-0 border-b border-bh-border px-panel py-panel">
        <div className="flex items-start gap-3">
          {ui.showHeaderProfile ? (
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-bh-card text-sm font-bold text-bh-text-secondary ${borderRingClass(cosmetics.equippedBorderId)}`}
              aria-hidden
            >
              <AvatarBadge key={cosmetics.equippedAvatarId} avatarId={cosmetics.equippedAvatarId} />
            </div>
          ) : null}
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold tracking-tight">Bug Hunter</h1>
            {cosmetics.profileTitle ? (
              <p className="text-xs text-bh-xp mt-0.5 font-medium">{cosmetics.profileTitle}</p>
            ) : null}
            <p className="text-xs text-bh-muted mt-0.5">
              {ready ? 'Connected' : 'Waiting for extension…'}
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col min-h-0">
        {ready && showStore ? (
          <nav
            className="shrink-0 flex gap-1.5 px-panel pt-2 pb-2 border-b border-bh-border"
            aria-label="Sidebar sections"
          >
            <button
              type="button"
              className={tabButtonClass('home')}
              onClick={() => setActiveTab('home')}
            >
              Home
            </button>
            <button
              type="button"
              className={tabButtonClass('store')}
              onClick={() => setActiveTab('store')}
            >
              Boogles store
            </button>
          </nav>
        ) : null}
        <div className="flex-1 overflow-y-auto px-panel py-panel space-y-3 min-h-0">
          {state == null ? (
            <p className="text-sm text-bh-muted py-10 text-center">Waiting for extension…</p>
          ) : mainTab === 'store' ? (
            <StorePage cosmetics={cosmetics} />
          ) : (
            <>
              {ui.showDashboard ? (
                <Dashboard game={state.game} session={state.session} cosmetics={cosmetics} />
              ) : null}
              {showCompanion ? (
                <CompanionPet
                  cosmetics={cosmetics}
                  onOpenStore={showStore ? () => setActiveTab('store') : undefined}
                />
              ) : null}
              {ui.showBugArena ? <BugArena bugs={state.bugs} /> : null}
              {ui.showDefeatedArchive ? <DefeatedArchive bugs={state.defeatedBugs} /> : null}
              {ui.showActivityLog ? <ActivityLog entries={state.activityLog} /> : null}
              {ui.showIssuesPanel ? <IssuesPanel issues={state.issues} /> : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
