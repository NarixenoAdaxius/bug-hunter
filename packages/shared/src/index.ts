/** Shared domain types and extension ↔ webview message contracts. */

export type BugRarity = 'common' | 'rare' | 'epic' | 'boss';

export type BugStatus = 'idle' | 'fighting' | 'defeated';

export type Issue = {
  id: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  line?: number;
  column?: number;
  /** Workspace file URI string (e.g. `file:///...` or `vscode-remote://...`). */
  sourceUri?: string;
  /** Short path for UI (usually workspace-relative). */
  fileLabel?: string;
};

export type Bug = {
  id: string;
  name: string;
  type: string;
  rarity: BugRarity;
  hp: number;
  maxHp: number;
  attack: number;
  defense: number;
  issue: Issue;
  abilities: string[];
  status: BugStatus;
  /** Epoch ms when the bug was defeated (only set when status === 'defeated'). */
  defeatedAt?: number;
};

export type PlayerCombatStats = {
  attack: number;
  defense: number;
  hp: number;
  maxHp: number;
};

/** Progression: `level` >= 1; `xp` is XP accumulated toward the next level (resets on level-up). */
export type GameState = {
  level: number;
  /** Progress toward next level (resets on level-up, not lifetime total). */
  xp: number;
  /** XP threshold for the current level; set by the game engine. */
  xpToNextLevel: number;
};

export type Settings = {
  humorLevel: number;
  aiEnabled: boolean;
};

export type SessionStats = {
  bugsDefeated: number;
};

/**
 * Sidebar section toggles from VS Code settings (`bugHunter.sidebar.*`).
 * Sent with each `stateUpdate` so the webview can show or hide panels.
 */
export type CompanionPanelMode = 'none' | 'always' | 'equippedOnly';

export type SidebarUiVisibility = {
  showDashboard: boolean;
  showStore: boolean;
  showBugArena: boolean;
  showDefeatedArchive: boolean;
  showActivityLog: boolean;
  showIssuesPanel: boolean;
  /** Avatar + border box in the header (title lines stay visible). */
  showHeaderProfile: boolean;
  /** Companion block: hidden, always (incl. empty state), or only when a pet is equipped. */
  companionMode: CompanionPanelMode;
};

export const DEFAULT_SIDEBAR_UI_VISIBILITY: SidebarUiVisibility = {
  showDashboard: true,
  showStore: true,
  showBugArena: true,
  showDefeatedArchive: true,
  showActivityLog: true,
  showIssuesPanel: true,
  showHeaderProfile: true,
  companionMode: 'always',
};

/** Soft currency and owned/equipped cosmetics (Bug Hunter store). */
export type CosmeticsState = {
  boogles: number;
  ownedPetIds: string[];
  ownedAvatarIds: string[];
  ownedBorderIds: string[];
  ownedThemeIds: string[];
  equippedPetId: string | null;
  equippedAvatarId: string;
  equippedBorderId: string;
  equippedPanelThemeId: string;
  /** Display title from level-ups (optional). */
  profileTitle: string | null;
};

export const DEFAULT_COSMETICS: CosmeticsState = {
  boogles: 0,
  ownedPetIds: [],
  ownedAvatarIds: ['avatar-default'],
  ownedBorderIds: ['border-default'],
  ownedThemeIds: ['theme-default'],
  equippedPetId: null,
  equippedAvatarId: 'avatar-default',
  equippedBorderId: 'border-default',
  equippedPanelThemeId: 'theme-default',
  profileTitle: null,
};

export type CosmeticCategory = 'pet' | 'avatar' | 'border' | 'theme';

/** Activity log entries replace old RPG combat log. */
export type ActivityLogEntry =
  | { kind: 'engaging'; bugName: string; fileLabel: string }
  | { kind: 'defeated'; bugName: string; xpAwarded: number; booglesAwarded: number }
  | { kind: 'levelUp'; newLevel: number; booglesBonus: number; title?: string }
  | { kind: 'scanning'; message: string };

/**
 * @deprecated Kept for game-engine compatibility; not used in the main attack flow.
 */
export type CombatLogEntry =
  | { kind: 'turnStart'; turn: number }
  | { kind: 'playerMiss'; turn: number }
  | { kind: 'bugMiss'; turn: number }
  | {
      kind: 'playerHit';
      turn: number;
      damage: number;
      critical: boolean;
      bugHpAfter: number;
    }
  | {
      kind: 'bugHit';
      turn: number;
      damage: number;
      critical: boolean;
      playerHpAfter: number;
    }
  | { kind: 'bugDefeated'; xpAwarded: number }
  | { kind: 'playerDefeated' };

export type AppState = {
  game: GameState;
  player: PlayerCombatStats;
  bugs: Bug[];
  defeatedBugs: Bug[];
  issues: Issue[];
  settings: Settings;
  session: SessionStats;
  cosmetics: CosmeticsState;
  activityLog: ActivityLogEntry[];
  combatLog: CombatLogEntry[];
};

export type FileAnalyzedPayload = {
  uri: string;
  languageId: string;
  reason: 'change' | 'open';
};

/** Typed payload map for bus events. */
export type EventPayloadMap = {
  FILE_ANALYZED: FileAnalyzedPayload;
  BUG_SPAWNED: { bugs: Bug[] };
  BUG_DEFEATED: { bug: Bug; xpAwarded: number };
  XP_GAINED: { amount: number };
  USER_ACTION: { action: string; bugId?: string };
};

export const BUG_HUNTER_EVENTS = [
  'FILE_ANALYZED',
  'BUG_SPAWNED',
  'BUG_DEFEATED',
  'XP_GAINED',
  'USER_ACTION',
] as const;

export type BugHunterEvent = (typeof BUG_HUNTER_EVENTS)[number];

/** Messages from the webview to the extension host. */
export type WebviewToHostMessage =
  | { type: 'ready' }
  | { type: 'userAction'; payload: { action: string; bugId?: string } }
  | {
      type: 'cosmeticAction';
      payload: { action: 'purchase' | 'equip'; category: CosmeticCategory; id: string };
    };

/** Messages from the extension host to the webview. */
export type HostToWebviewMessage =
  | { type: 'stateUpdate'; payload: Partial<AppState> & { uiVisibility?: SidebarUiVisibility } }
  | { type: 'activityLog'; payload: ActivityLogEntry[] }
  | { type: 'combatLog'; payload: CombatLogEntry[] }
  | { type: 'ping' };
