import { describe, it, expect } from 'vitest';
import type { Bug } from '@bughunter/shared';
import { DEFAULT_COSMETICS } from '@bughunter/shared';
import {
  applyXpToGameState,
  booglesForDefeatingBug,
  calculateDamage,
  computeHitDamage,
  equipCosmetic,
  isOwned,
  purchaseCosmetic,
  ALL_STORE_ITEMS,
  resolvePlayerAttack,
  resolveBugAttack,
  rewardsForLevelRange,
  simulateEncounter,
  xpForDefeatingBug,
  xpRequiredToLevelUp,
  checkAchievements,
  BUILT_IN_ACHIEVEMENTS,
} from './index.js';

function rngFromValues(values: number[]): () => number {
  let i = 0;
  return () => {
    const v = values[i];
    i += 1;
    if (v === undefined) {
      throw new Error('rng exhausted');
    }
    return v;
  };
}

function rngHit(): () => number {
  return rngFromValues([0.5, 0.5, 0.5]);
}

function makeBug(overrides: Partial<Bug> = {}): Bug {
  return {
    id: '1',
    name: 'x',
    type: 't',
    rarity: 'common',
    hp: 20,
    maxHp: 20,
    attack: 4,
    defense: 1,
    issue: { id: 'i', message: 'm', severity: 'warning' },
    abilities: [],
    status: 'idle' as const,
    ...overrides,
  };
}

describe('computeHitDamage', () => {
  it('uses crit then roll: 0.5,0.5,0.5 -> no crit, roll 10', () => {
    const r = computeHitDamage(10, 2, rngHit());
    expect(r.critical).toBe(false);
    expect(r.damage).toBe(8 + 10);
  });

  it('crit when first roll < 0.1', () => {
    const rng = rngFromValues([0.05, 0, 0]);
    const r = computeHitDamage(10, 2, rng);
    expect(r.critical).toBe(true);
    expect(r.damage).toBe(Math.floor(8 * 1.5) + 5);
  });
});

describe('resolvePlayerAttack', () => {
  it('misses when first roll < missChance', () => {
    const rng = rngFromValues([0.05]);
    const r = resolvePlayerAttack(10, { defense: 2 }, rng, 0.1);
    expect(r.miss).toBe(true);
    expect(r.damage).toBe(0);
  });

  it('on hit delegates to computeHitDamage', () => {
    const r = resolvePlayerAttack(10, { defense: 2 }, rngHit(), 0.1);
    expect(r.miss).toBe(false);
    expect(r.damage).toBe(18);
  });
});

describe('resolveBugAttack', () => {
  it('misses when first roll < missChance', () => {
    const rng = rngFromValues([0.05]);
    const r = resolveBugAttack({ attack: 8 }, { defense: 3 }, rng, 0.1);
    expect(r.miss).toBe(true);
    expect(r.damage).toBe(0);
  });

  it('hits when roll >= missChance', () => {
    const r = resolveBugAttack({ attack: 8 }, { defense: 3 }, rngHit(), 0.1);
    expect(r.miss).toBe(false);
    expect(r.damage).toBeGreaterThan(0);
  });
});

describe('applyXpToGameState', () => {
  it('levels up with overflow', () => {
    const next = applyXpToGameState({ level: 1, xp: 90, xpToNextLevel: 100 }, 20);
    expect(next.level).toBe(2);
    expect(next.xp).toBe(10);
  });

  it('multi-level chain', () => {
    expect(xpRequiredToLevelUp(1)).toBe(100);
    expect(xpRequiredToLevelUp(2)).toBe(200);
    const next = applyXpToGameState({ level: 1, xp: 0, xpToNextLevel: 100 }, 350);
    expect(next.level).toBe(3);
    expect(next.xp).toBe(50);
  });
});

describe('xpForDefeatingBug', () => {
  it('uses rarity and severity', () => {
    const bug = makeBug({ rarity: 'common', issue: { id: 'i', message: 'm', severity: 'error' } });
    expect(xpForDefeatingBug(bug)).toBe(Math.floor(10 * 1.2));
  });
});

describe('simulateEncounter', () => {
  it('awards xp on victory', () => {
    const bug = makeBug({ hp: 5, maxHp: 5, attack: 1, defense: 0 });
    const player = { attack: 100, defense: 0, hp: 100, maxHp: 100 };
    const res = simulateEncounter({ level: 1, xp: 0, xpToNextLevel: 100 }, player, bug, rngHit(), {
      missChance: 0,
    });
    expect(res.victory).toBe(true);
    expect(res.gameState.xp).toBe(10);
    const defeated = res.log.filter((e) => e.kind === 'bugDefeated');
    expect(defeated).toHaveLength(1);
  });

  it('returns defeat when player HP reaches 0', () => {
    const bug = makeBug({ hp: 999, maxHp: 999, attack: 200, defense: 0 });
    const player = { attack: 1, defense: 0, hp: 1, maxHp: 1 };
    const rng = rngFromValues([0.5, 0.5, 0.5, 0.5, 0.5, 0.5]);
    const res = simulateEncounter({ level: 1, xp: 0, xpToNextLevel: 100 }, player, bug, rng, {
      missChance: 0,
    });
    expect(res.victory).toBe(false);
    const playerDefeated = res.log.filter((e) => e.kind === 'playerDefeated');
    expect(playerDefeated).toHaveLength(1);
  });
});

describe('calculateDamage', () => {
  it('matches computeHitDamage with bug defense', () => {
    const a = calculateDamage(10, { defense: 2 }, rngHit());
    const b = computeHitDamage(10, 2, rngHit());
    expect(a).toEqual(b);
  });
});

describe('checkAchievements', () => {
  it('unlocks first-blood after 1 defeat', () => {
    const unlocked = checkAchievements(
      {
        game: { level: 1, xp: 0, xpToNextLevel: 100 },
        session: { bugsDefeated: 1 },
        totalBugsDefeated: 1,
      },
      new Set()
    );
    const firstBlood = unlocked.find((a) => a.id === 'first-blood');
    expect(firstBlood).toBeDefined();
    expect(firstBlood!.name).toBe('First Blood');
  });

  it('does not re-unlock already unlocked achievements', () => {
    const unlocked = checkAchievements(
      {
        game: { level: 1, xp: 0, xpToNextLevel: 100 },
        session: { bugsDefeated: 1 },
        totalBugsDefeated: 1,
      },
      new Set(['first-blood'])
    );
    expect(unlocked.find((a) => a.id === 'first-blood')).toBeUndefined();
  });

  it('exports built-in achievements list', () => {
    expect(BUILT_IN_ACHIEVEMENTS.length).toBeGreaterThanOrEqual(5);
  });
});

describe('booglesForDefeatingBug', () => {
  it('scales with XP and has a minimum of 1', () => {
    const bug = makeBug({ rarity: 'common', issue: { id: 'i', message: 'm', severity: 'info' } });
    expect(booglesForDefeatingBug(bug)).toBeGreaterThanOrEqual(1);
  });
});

describe('rewardsForLevelRange', () => {
  it('returns no rewards when level unchanged', () => {
    expect(rewardsForLevelRange(3, 3)).toEqual({ totalBoogles: 0 });
  });

  it('accumulates Boogles per level and milestone title', () => {
    const r = rewardsForLevelRange(2, 3);
    expect(r.totalBoogles).toBe(12 + 3 * 3);
    expect(r.title).toBe('Apprentice Debugger');
  });
});

describe('cosmetic store', () => {
  it('purchase deducts Boogles and adds ownership', () => {
    const start = { ...DEFAULT_COSMETICS, boogles: 100 };
    const next = purchaseCosmetic(start, 'pet', 'pet-duck');
    expect(next).not.toBeNull();
    expect(next!.boogles).toBe(65);
    expect(isOwned(next!, 'pet', 'pet-duck')).toBe(true);
  });

  it('equip requires ownership', () => {
    expect(equipCosmetic(DEFAULT_COSMETICS, 'pet', 'pet-duck')).toBeNull();
  });

  it('equip rejects ids not in the store catalog even if present in owned list', () => {
    const corrupted = {
      ...DEFAULT_COSMETICS,
      ownedAvatarIds: ['avatar-default', 'not-a-real-item'],
    };
    expect(equipCosmetic(corrupted, 'avatar', 'not-a-real-item')).toBeNull();
  });
});

describe('store catalog', () => {
  it('has unique item ids', () => {
    const ids = ALL_STORE_ITEMS.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
