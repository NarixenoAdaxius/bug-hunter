import { describe, it, expect } from 'vitest';
import type { Bug } from '@bughunter/shared';
import { mergeSpawnedBugs } from '../game/mergeSpawnedBugs.js';

function baseBug(overrides: Partial<Bug> & Pick<Bug, 'id'>): Bug {
  return {
    name: 'Gremlin',
    type: 'Pest',
    rarity: 'common',
    hp: 20,
    maxHp: 20,
    attack: 4,
    defense: 1,
    issue: { id: 'issue-1', message: 'msg', severity: 'info' },
    abilities: [],
    ...overrides,
  };
}

describe('mergeSpawnedBugs', () => {
  it('preserves reduced hp when spawned has full hp for the same id', () => {
    const previous = [baseBug({ id: 'bug-issue-1', hp: 7, maxHp: 20 })];
    const spawned = [baseBug({ id: 'bug-issue-1', hp: 20, maxHp: 20 })];
    const out = mergeSpawnedBugs(previous, spawned);
    expect(out).toHaveLength(1);
    expect(out[0].hp).toBe(7);
    expect(out[0].maxHp).toBe(20);
  });

  it('replaces defeated bug with fresh spawned stats', () => {
    const previous = [baseBug({ id: 'bug-issue-1', hp: 0, maxHp: 20 })];
    const spawned = [baseBug({ id: 'bug-issue-1', hp: 20, maxHp: 20 })];
    const out = mergeSpawnedBugs(previous, spawned);
    expect(out[0].hp).toBe(20);
  });

  it('clamps hp when new maxHp is lower than previous hp', () => {
    const previous = [
      baseBug({
        id: 'bug-issue-1',
        hp: 25,
        maxHp: 40,
        rarity: 'rare',
      }),
    ];
    const spawned = [
      baseBug({
        id: 'bug-issue-1',
        hp: 20,
        maxHp: 20,
        rarity: 'common',
      }),
    ];
    const out = mergeSpawnedBugs(previous, spawned);
    expect(out[0].hp).toBe(20);
    expect(out[0].maxHp).toBe(20);
  });

  it('uses spawned snapshot when previous bug was at full hp', () => {
    const previous = [
      baseBug({
        id: 'bug-issue-1',
        hp: 20,
        maxHp: 20,
        name: 'Old',
      }),
    ];
    const spawned = [
      baseBug({
        id: 'bug-issue-1',
        hp: 20,
        maxHp: 20,
        name: 'New',
      }),
    ];
    const out = mergeSpawnedBugs(previous, spawned);
    expect(out[0].name).toBe('New');
  });

  it('passes through new bugs with no previous match', () => {
    const spawned = [baseBug({ id: 'bug-issue-2' })];
    const out = mergeSpawnedBugs([], spawned);
    expect(out).toEqual(spawned);
  });
});
