import { describe, it, expect } from 'vitest';
import type { Issue } from '@bughunter/shared';
import { spawnBugs } from '../game/bugMapper.js';

function makeIssue(overrides: Partial<Issue> = {}): Issue {
  return {
    id: 'test-1',
    message: 'test issue',
    severity: 'warning',
    ...overrides,
  };
}

describe('spawnBugs', () => {
  it('returns empty array for no issues', () => {
    expect(spawnBugs([])).toEqual([]);
  });

  it('maps info severity to common rarity', () => {
    const bugs = spawnBugs([makeIssue({ severity: 'info' })]);
    expect(bugs).toHaveLength(1);
    expect(bugs[0].rarity).toBe('common');
  });

  it('maps warning severity to rare rarity', () => {
    const bugs = spawnBugs([makeIssue({ severity: 'warning' })]);
    expect(bugs[0].rarity).toBe('rare');
  });

  it('maps error severity to epic rarity', () => {
    const bugs = spawnBugs([makeIssue({ severity: 'error' })]);
    expect(bugs[0].rarity).toBe('epic');
  });

  it('assigns correct HP by rarity', () => {
    const bugs = spawnBugs([
      makeIssue({ id: '1', severity: 'info' }),
      makeIssue({ id: '2', severity: 'warning' }),
      makeIssue({ id: '3', severity: 'error' }),
    ]);
    expect(bugs[0].hp).toBe(20);
    expect(bugs[1].hp).toBe(40);
    expect(bugs[2].hp).toBe(70);
  });

  it('generates stable bug ids from issue ids', () => {
    const bugs = spawnBugs([makeIssue({ id: 'abc-123' })]);
    expect(bugs[0].id).toBe('bug-abc-123');
  });

  it('preserves issue reference on each bug', () => {
    const issue = makeIssue({ message: 'specific issue' });
    const bugs = spawnBugs([issue]);
    expect(bugs[0].issue).toBe(issue);
  });
});
