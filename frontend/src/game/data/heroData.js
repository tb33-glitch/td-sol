// Hero definitions — placeable heroes that auto-level during gameplay
// Only 1 hero per game. Heroes gain XP from pops in range (not just their own pops).
// Abilities unlock at levels 5 and 10. Level 20 = all stats doubled.

export const HEROES = {
  satoshi: {
    id: 'satoshi',
    name: 'Satoshi',
    theme: 'Bitcoin OG',
    description: 'The OG. Boosts income for all towers. Unlocks Hash Power at Lv5 and Genesis Block at Lv10.',
    color: 0xf7931a,
    textureKey: 'hero_satoshi',
    projTextureKey: 'proj_satoshi',
    baseStats: {
      damage: 3,
      range: 120,
      fireRate: 800,
      pierce: 2,
      projectileSpeed: 8,
      damageType: 'normal',
      canDetectCamo: false,
    },
    passive: {
      type: 'incomeBoost',
      description: '+10% income for all towers',
      value: 0.1,
    },
    abilities: [
      {
        name: 'Hash Power',
        unlockLevel: 5,
        cooldown: 25000,
        type: 'hashPower',
        duration: 8000,
        description: '2x attack speed for 8s',
      },
      {
        name: 'Genesis Block',
        unlockLevel: 10,
        cooldown: 50000,
        type: 'genesisBlock',
        duration: 15000,
        description: 'All towers +1 dmg for 15s',
      },
    ],
  },
  degen: {
    id: 'degen',
    name: 'Degen Ape',
    theme: 'Ape culture',
    description: 'Fast-attacking ape. Boosts nearby tower speed. YOLO at Lv5, Diamond Hands at Lv10.',
    color: 0x8b4513,
    textureKey: 'hero_degen',
    projTextureKey: 'proj_degen',
    baseStats: {
      damage: 2,
      range: 90,
      fireRate: 500,
      pierce: 1,
      projectileSpeed: 9,
      damageType: 'sharp',
      canDetectCamo: false,
    },
    passive: {
      type: 'speedAura',
      description: '+5% attack speed for nearby towers',
      value: 0.05,
      range: 100,
    },
    abilities: [
      {
        name: 'YOLO',
        unlockLevel: 5,
        cooldown: 20000,
        type: 'yolo',
        projectileCount: 20,
        description: 'Throws 20 projectiles in all directions',
      },
      {
        name: 'Diamond Hands',
        unlockLevel: 10,
        cooldown: 40000,
        type: 'diamondHands',
        duration: 10000,
        damageMult: 3,
        description: '3x dmg for 10s but can\'t retarget',
      },
    ],
  },
  whale: {
    id: 'whale',
    name: 'Whale',
    theme: 'Market mover',
    description: 'Slow but powerful. Bloons in range drop 2x cash. Market Dump at Lv5, Liquidation at Lv10.',
    color: 0x4488cc,
    textureKey: 'hero_whale',
    projTextureKey: 'proj_whale',
    baseStats: {
      damage: 5,
      range: 150,
      fireRate: 1200,
      pierce: 3,
      projectileSpeed: 6,
      damageType: 'normal',
      canDetectCamo: false,
    },
    passive: {
      type: 'doubleCash',
      description: 'Bloons popped in range drop 2x cash',
      range: 150,
    },
    abilities: [
      {
        name: 'Market Dump',
        unlockLevel: 5,
        cooldown: 35000,
        type: 'marketDump',
        duration: 6000,
        slowAmount: 0.5,
        description: 'Slows ALL bloons 50% for 6s',
      },
      {
        name: 'Liquidation Cascade',
        unlockLevel: 10,
        cooldown: 60000,
        type: 'liquidation',
        hpPercent: 0.1,
        description: 'Deals 10% max HP to all MOABs',
      },
    ],
  },
  rugged: {
    id: 'rugged',
    name: 'Rug Survivor',
    theme: 'Cautionary tale',
    description: 'Long range, fast attacks. Reveals all camo map-wide. Audit Trail at Lv5, Exit Scam at Lv10.',
    color: 0xaa3366,
    textureKey: 'hero_rugged',
    projTextureKey: 'proj_rugged',
    baseStats: {
      damage: 1,
      range: 200,
      fireRate: 400,
      pierce: 1,
      projectileSpeed: 10,
      damageType: 'magic',
      canDetectCamo: true,
    },
    passive: {
      type: 'globalCamoReveal',
      description: 'Reveals all camo bloons map-wide',
    },
    abilities: [
      {
        name: 'Audit Trail',
        unlockLevel: 5,
        cooldown: 30000,
        type: 'auditTrail',
        description: 'Strips regrow+fortified from all bloons in range',
      },
      {
        name: 'Exit Scam',
        unlockLevel: 10,
        cooldown: 45000,
        type: 'exitScam',
        description: 'Teleports strongest bloon back to 0% path progress',
      },
    ],
  },
};

// XP required per level (cumulative)
// Levels 1-20 during a game. XP from pops within hero range.
export const HERO_XP_TABLE = [
  0,     // Level 1 (start)
  20,    // Level 2
  50,    // Level 3
  90,    // Level 4
  140,   // Level 5 — Ability 1 unlocks
  200,   // Level 6
  280,   // Level 7
  380,   // Level 8
  500,   // Level 9
  650,   // Level 10 — Ability 2 unlocks
  830,   // Level 11
  1050,  // Level 12
  1300,  // Level 13
  1600,  // Level 14
  1950,  // Level 15
  2350,  // Level 16
  2800,  // Level 17
  3300,  // Level 18
  3900,  // Level 19
  4600,  // Level 20 — All stats doubled
];

// Stat multiplier per level (linear scaling, level 20 = 2x)
export function getHeroStatMult(level) {
  return 1 + (level - 1) / 19; // level 1 = 1.0, level 20 = 2.0
}
