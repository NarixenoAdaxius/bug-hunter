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
    status: 'idle',
    ...overrides,
  };
}

describe('mergeSpawnedBugs', () => {
  it('preserves fighting status across rescan', () => {
    const previous = [baseBug({ id: 'bug-issue-1', status: 'fighting' })];
    const spawned = [baseBug({ id: 'bug-issue-1', status: 'idle' })];
    const out = mergeSpawnedBugs(previous, spawned);
    expect(out).toHaveLength(1);
    expect(out[0].status).toBe('fighting');
  });

  it('uses spawned snapshot for idle bugs', () => {
    const previous = [baseBug({ id: 'bug-issue-1', status: 'idle', name: 'Old' })];
    const spawned = [baseBug({ id: 'bug-issue-1', status: 'idle', name: 'New' })];
    const out = mergeSpawnedBugs(previous, spawned);
    expect(out[0].name).toBe('New');
    expect(out[0].status).toBe('idle');
  });

  it('passes through new bugs with no previous match', () => {
    const spawned = [baseBug({ id: 'bug-issue-2' })];
    const out = mergeSpawnedBugs([], spawned);
    expect(out).toEqual(spawned);
  });

  it('does not carry over defeated bugs if they reappear in spawned', () => {
    const previous = [baseBug({ id: 'bug-issue-1', status: 'defeated' })];
    const spawned = [baseBug({ id: 'bug-issue-1', status: 'idle' })];
    const out = mergeSpawnedBugs(previous, spawned);
    expect(out[0].status).toBe('idle');
  });

  it('handles mixed statuses correctly', () => {
    const previous = [
      baseBug({ id: 'a', status: 'fighting' }),
      baseBug({ id: 'b', status: 'idle' }),
    ];
    const spawned = [
      baseBug({ id: 'a', status: 'idle' }),
      baseBug({ id: 'b', status: 'idle', name: 'Updated' }),
      baseBug({ id: 'c', status: 'idle' }),
    ];
    const out = mergeSpawnedBugs(previous, spawned);
    expect(out).toHaveLength(3);
    expect(out[0].status).toBe('fighting');
    expect(out[1].name).toBe('Updated');
    expect(out[2].id).toBe('c');
  });
});
