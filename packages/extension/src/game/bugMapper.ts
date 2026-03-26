import type { Bug, BugRarity, Issue } from '@bughunter/shared';

const BUG_NAMES: Record<BugRarity, string[]> = {
  common: ['Gremlin', 'Glitchling', 'Nibbler', 'Fuzzball'],
  rare: ['Phantom', 'Shadow Crawler', 'Hex Moth', 'Bit Wraith'],
  epic: ['Void Serpent', 'Logic Hydra', 'Stack Overfiend', 'Null Dragon'],
  boss: ['The Architect', 'Segfault Prime', 'Infinite Looper', 'Memory Leviathan'],
};

const BUG_TYPES: Record<BugRarity, string> = {
  common: 'Pest',
  rare: 'Specter',
  epic: 'Beast',
  boss: 'Titan',
};

function rarityFromSeverity(severity: Issue['severity']): BugRarity {
  switch (severity) {
    case 'error':
      return 'epic';
    case 'warning':
      return 'rare';
    case 'info':
      return 'common';
  }
}

function hpForRarity(rarity: BugRarity): number {
  switch (rarity) {
    case 'common':
      return 20;
    case 'rare':
      return 40;
    case 'epic':
      return 70;
    case 'boss':
      return 150;
  }
}

function statsForRarity(rarity: BugRarity): { attack: number; defense: number } {
  switch (rarity) {
    case 'common':
      return { attack: 4, defense: 1 };
    case 'rare':
      return { attack: 7, defense: 3 };
    case 'epic':
      return { attack: 11, defense: 5 };
    case 'boss':
      return { attack: 16, defense: 8 };
  }
}

function pickName(rarity: BugRarity, index: number): string {
  const names = BUG_NAMES[rarity];
  return names[index % names.length];
}

export function spawnBugs(issues: Issue[]): Bug[] {
  return issues.map((issue, i) => {
    const rarity = rarityFromSeverity(issue.severity);
    const hp = hpForRarity(rarity);
    const { attack, defense } = statsForRarity(rarity);
    return {
      id: `bug-${issue.id}`,
      name: pickName(rarity, i),
      type: BUG_TYPES[rarity],
      rarity,
      hp,
      maxHp: hp,
      attack,
      defense,
      issue,
      abilities: [],
    };
  });
}
