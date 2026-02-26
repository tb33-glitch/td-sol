export const TOWER_TYPES = {
  dart: {
    id: 'dart',
    name: 'Dart Monkey',
    cost: 200,
    color: 0x8B4513,
    range: 120,
    fireRate: 800, // ms between shots
    damage: 1,
    pierce: 1, // how many bloons one projectile can hit
    projectileSpeed: 8,
    projectileColor: 0x333333,
    damageType: 'sharp',
    canDetectCamo: false,
    radius: 12,
    upgrades: {
      path1: [ // Pierce
        { name: 'Sharp Shots', cost: 150, effects: { pierce: 3 } },
        { name: 'Razor Shots', cost: 250, effects: { pierce: 5, damage: 2 } },
        { name: 'Triple Shot', cost: 500, effects: { pierce: 8, multishot: 3 } },
      ],
      path2: [ // Speed
        { name: 'Quick Shots', cost: 100, effects: { fireRateMult: 0.75 } },
        { name: 'Rapid Fire', cost: 200, effects: { fireRateMult: 0.5 } },
        { name: 'Machine Gun', cost: 600, effects: { fireRateMult: 0.25 } },
      ],
      path3: [ // Range
        { name: 'Long Range', cost: 100, effects: { rangeMult: 1.3 } },
        { name: 'Eagle Eye', cost: 250, effects: { rangeMult: 1.6, canDetectCamo: true } },
        { name: 'Sniper Dart', cost: 500, effects: { rangeMult: 2.0, damage: 3 } },
      ],
    },
  },
  bomb: {
    id: 'bomb',
    name: 'Bomb Shooter',
    cost: 500,
    color: 0x333333,
    range: 100,
    fireRate: 1500,
    damage: 1,
    pierce: 1,
    projectileSpeed: 6,
    projectileColor: 0x111111,
    damageType: 'explosive',
    canDetectCamo: false,
    radius: 14,
    splashRadius: 30,
    upgrades: {
      path1: [ // Damage
        { name: 'Bigger Bombs', cost: 300, effects: { damage: 2, splashRadius: 40 } },
        { name: 'Heavy Bombs', cost: 500, effects: { damage: 4, splashRadius: 50 } },
        { name: 'MOAB Mauler', cost: 900, effects: { damage: 8, moabDamageMult: 3 } },
      ],
      path2: [ // Blast radius
        { name: 'Wide Area', cost: 200, effects: { splashRadius: 45 } },
        { name: 'Cluster Bombs', cost: 400, effects: { splashRadius: 60, clusterCount: 4 } },
        { name: 'Carpet Bomb', cost: 800, effects: { splashRadius: 80, clusterCount: 8 } },
      ],
      path3: [ // Stun
        { name: 'Concussion', cost: 200, effects: { stunDuration: 300 } },
        { name: 'Flash Bomb', cost: 400, effects: { stunDuration: 600 } },
        { name: 'Mega Stun', cost: 700, effects: { stunDuration: 1000, stunRadius: 60 } },
      ],
    },
  },
  ice: {
    id: 'ice',
    name: 'Ice Tower',
    cost: 350,
    color: 0x66ccff,
    range: 80,
    fireRate: 2000,
    damage: 0,
    pierce: 999, // hits all in range
    projectileSpeed: 0, // aura effect, no projectile
    projectileColor: 0xaaddff,
    damageType: 'cold',
    canDetectCamo: false,
    radius: 12,
    isAura: true,
    slowAmount: 0.5, // 50% slow
    slowDuration: 1500,
    upgrades: {
      path1: [ // Slow strength
        { name: 'Chilled', cost: 200, effects: { slowAmount: 0.35 } },
        { name: 'Deep Freeze', cost: 350, effects: { slowAmount: 0.2 } },
        { name: 'Arctic Wind', cost: 600, effects: { slowAmount: 0.1, rangeMult: 1.5 } },
      ],
      path2: [ // Freeze duration
        { name: 'Long Freeze', cost: 150, effects: { slowDuration: 2500 } },
        { name: 'Cryo Lock', cost: 300, effects: { slowDuration: 4000 } },
        { name: 'Absolute Zero', cost: 700, effects: { slowDuration: 6000, freezeDamage: 2 } },
      ],
      path3: [ // Permafrost
        { name: 'Cold Snap', cost: 200, effects: { damage: 1 } },
        { name: 'Icicles', cost: 400, effects: { damage: 2, fireRateMult: 0.7 } },
        { name: 'Permafrost', cost: 600, effects: { damage: 3, fireRateMult: 0.5, canDetectCamo: true } },
      ],
    },
  },
  banana: {
    id: 'banana',
    name: 'Banana Farm',
    cost: 800,
    color: 0xffdd00,
    range: 0, // no attack range
    fireRate: 5000, // income interval
    damage: 0,
    pierce: 0,
    projectileSpeed: 0,
    projectileColor: 0xffdd00,
    damageType: 'none',
    canDetectCamo: false,
    radius: 14,
    isGenerator: true,
    incomePerTick: 50,
    upgrades: {
      path1: [ // More bananas
        { name: 'More Bananas', cost: 300, effects: { incomePerTick: 80 } },
        { name: 'Banana Bunch', cost: 600, effects: { incomePerTick: 150 } },
        { name: 'Banana Republic', cost: 1200, effects: { incomePerTick: 300 } },
      ],
      path2: [ // Auto-collect
        { name: 'Long Life', cost: 200, effects: { autoCollectDelay: 8000 } },
        { name: 'Valuable', cost: 400, effects: { incomeMultiplier: 1.5 } },
        { name: 'Banana Bank', cost: 800, effects: { incomeMultiplier: 2.0, autoCollect: true } },
      ],
      path3: [ // Banana Central
        { name: 'Faster Production', cost: 250, effects: { fireRateMult: 0.7 } },
        { name: 'Double Yield', cost: 500, effects: { fireRateMult: 0.5 } },
        { name: 'Banana Central', cost: 1500, effects: { fireRateMult: 0.3, incomePerTick: 250 } },
      ],
    },
  },
  sniper: {
    id: 'sniper',
    name: 'Sniper Monkey',
    cost: 400,
    color: 0x556b2f,
    range: 9999, // infinite range
    fireRate: 2000,
    damage: 2,
    pierce: 1,
    projectileSpeed: 99, // instant
    projectileColor: 0xffff00,
    damageType: 'sharp',
    canDetectCamo: false,
    radius: 12,
    isSniper: true,
    upgrades: {
      path1: [ // Damage
        { name: 'Full Metal Jacket', cost: 300, effects: { damage: 4, damageType: 'normal' } },
        { name: 'Large Caliber', cost: 500, effects: { damage: 7 } },
        { name: 'Deadly Precision', cost: 900, effects: { damage: 15 } },
      ],
      path2: [ // Speed
        { name: 'Faster Firing', cost: 200, effects: { fireRateMult: 0.7 } },
        { name: 'Night Vision', cost: 300, effects: { fireRateMult: 0.5, canDetectCamo: true } },
        { name: 'Semi-Auto', cost: 700, effects: { fireRateMult: 0.25 } },
      ],
      path3: [ // Utility
        { name: 'Shrapnel', cost: 250, effects: { pierce: 3 } },
        { name: 'Bouncing Bullet', cost: 400, effects: { pierce: 5, bounceTargets: 3 } },
        { name: 'Supply Drop', cost: 800, effects: { supplyDropIncome: 200, supplyDropInterval: 15000 } },
      ],
    },
  },
  wizard: {
    id: 'wizard',
    name: 'Wizard Monkey',
    cost: 450,
    color: 0x9933ff,
    range: 110,
    fireRate: 1200,
    damage: 1,
    pierce: 3,
    projectileSpeed: 7,
    projectileColor: 0xcc66ff,
    damageType: 'magic',
    canDetectCamo: true, // wizards see camo by default
    radius: 12,
    upgrades: {
      path1: [ // Fire
        { name: 'Fireball', cost: 250, effects: { damage: 2, splashRadius: 20 } },
        { name: 'Wall of Fire', cost: 500, effects: { damage: 3, wallOfFire: true } },
        { name: 'Dragon\'s Breath', cost: 900, effects: { damage: 5, fireRateMult: 0.5 } },
      ],
      path2: [ // Lightning
        { name: 'Arc Lightning', cost: 200, effects: { pierce: 6, chainTargets: 3 } },
        { name: 'Ball Lightning', cost: 400, effects: { pierce: 10, chainTargets: 5 } },
        { name: 'Tempest', cost: 800, effects: { pierce: 20, chainTargets: 8, fireRateMult: 0.6 } },
      ],
      path3: [ // Necromancy
        { name: 'Intense Magic', cost: 200, effects: { damage: 2, rangeMult: 1.3 } },
        { name: 'Shimmer', cost: 350, effects: { decamoRange: 80 } },
        { name: 'Archmage', cost: 1000, effects: { damage: 4, fireRateMult: 0.4, rangeMult: 1.5 } },
      ],
    },
  },
};

// Placement footprint (radius) for tower collision checking
export const TOWER_FOOTPRINT = 20;
