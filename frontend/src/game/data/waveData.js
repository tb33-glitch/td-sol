// 40 waves of increasing difficulty
// Each wave is an array of spawn groups: { type, count, delay (ms between each), startDelay (ms before group starts) }

export const WAVES = [
  // Wave 1-5: Red only, easing in
  [{ type: 'red', count: 10, delay: 800, startDelay: 0 }],
  [{ type: 'red', count: 15, delay: 600, startDelay: 0 }],
  [{ type: 'red', count: 20, delay: 500, startDelay: 0 }],
  [{ type: 'red', count: 10, delay: 400, startDelay: 0 }, { type: 'blue', count: 3, delay: 1000, startDelay: 5000 }],
  [{ type: 'blue', count: 10, delay: 700, startDelay: 0 }],

  // Wave 6-10: Blues and greens
  [{ type: 'red', count: 15, delay: 400, startDelay: 0 }, { type: 'blue', count: 8, delay: 600, startDelay: 3000 }],
  [{ type: 'blue', count: 15, delay: 500, startDelay: 0 }, { type: 'green', count: 3, delay: 1000, startDelay: 6000 }],
  [{ type: 'green', count: 10, delay: 600, startDelay: 0 }],
  [{ type: 'blue', count: 20, delay: 300, startDelay: 0 }, { type: 'green', count: 5, delay: 800, startDelay: 4000 }],
  [{ type: 'green', count: 15, delay: 500, startDelay: 0 }],

  // Wave 11-15: Yellows appear
  [{ type: 'green', count: 12, delay: 400, startDelay: 0 }, { type: 'yellow', count: 3, delay: 1200, startDelay: 5000 }],
  [{ type: 'yellow', count: 8, delay: 600, startDelay: 0 }, { type: 'blue', count: 20, delay: 200, startDelay: 3000 }],
  [{ type: 'green', count: 20, delay: 300, startDelay: 0 }, { type: 'yellow', count: 8, delay: 500, startDelay: 5000 }],
  [{ type: 'yellow', count: 15, delay: 500, startDelay: 0 }],
  [{ type: 'red', count: 40, delay: 100, startDelay: 0 }, { type: 'yellow', count: 10, delay: 400, startDelay: 2000 }],

  // Wave 16-19: Pinks and mixed rushes
  [{ type: 'pink', count: 5, delay: 600, startDelay: 0 }, { type: 'green', count: 20, delay: 300, startDelay: 3000 }],
  [{ type: 'yellow', count: 20, delay: 300, startDelay: 0 }, { type: 'pink', count: 8, delay: 500, startDelay: 5000 }],
  [{ type: 'pink', count: 15, delay: 400, startDelay: 0 }],
  [{ type: 'pink', count: 12, delay: 300, startDelay: 0 }, { type: 'green', count: 30, delay: 150, startDelay: 4000 }],
  // Wave 20: BOSS — Bear Market
  [{ type: 'boss_bear', count: 1, delay: 0, startDelay: 0 }, { type: 'pink', count: 20, delay: 200, startDelay: 3000 }, { type: 'lead', count: 5, delay: 800, startDelay: 6000 }],

  // Wave 21-25: Leads and camos
  [{ type: 'lead', count: 3, delay: 2000, startDelay: 0 }, { type: 'pink', count: 15, delay: 300, startDelay: 1000 }],
  [{ type: 'camo', count: 8, delay: 600, startDelay: 0 }, { type: 'yellow', count: 20, delay: 250, startDelay: 3000 }],
  [{ type: 'lead', count: 5, delay: 1500, startDelay: 0 }, { type: 'camo', count: 10, delay: 500, startDelay: 4000 }],
  [{ type: 'pink', count: 40, delay: 150, startDelay: 0 }],
  [{ type: 'lead', count: 8, delay: 1000, startDelay: 0 }, { type: 'pink', count: 20, delay: 200, startDelay: 2000 }, { type: 'camo', count: 10, delay: 400, startDelay: 5000 }],

  // Wave 26-30: Heavy mixed + regrow intro
  [{ type: 'yellow', count: 50, delay: 100, startDelay: 0 }, { type: 'lead', count: 5, delay: 1200, startDelay: 3000 }],
  [{ type: 'camo', count: 15, delay: 400, startDelay: 0 }, { type: 'green', count: 10, delay: 500, startDelay: 3000, modifiers: { regrow: true } }],
  [{ type: 'pink', count: 30, delay: 150, startDelay: 0 }, { type: 'lead', count: 10, delay: 600, startDelay: 2000 }],
  [{ type: 'lead', count: 15, delay: 500, startDelay: 0 }, { type: 'camo', count: 20, delay: 300, startDelay: 4000 }],
  [{ type: 'pink', count: 50, delay: 80, startDelay: 0 }, { type: 'lead', count: 8, delay: 400, startDelay: 2000, modifiers: { fortified: true } }],

  // Wave 31-35: Ramp to MOAB
  [{ type: 'lead', count: 20, delay: 400, startDelay: 0 }, { type: 'pink', count: 40, delay: 100, startDelay: 3000 }],
  [{ type: 'camo', count: 25, delay: 250, startDelay: 0 }, { type: 'lead', count: 15, delay: 300, startDelay: 5000 }],
  [{ type: 'yellow', count: 80, delay: 60, startDelay: 0 }, { type: 'lead', count: 10, delay: 500, startDelay: 2000 }],
  [{ type: 'pink', count: 60, delay: 80, startDelay: 0 }, { type: 'camo', count: 20, delay: 200, startDelay: 3000 }],
  [{ type: 'lead', count: 25, delay: 300, startDelay: 0 }, { type: 'pink', count: 50, delay: 80, startDelay: 2000 }],

  // Wave 36-39: MOAB intro
  [{ type: 'moab', count: 1, delay: 0, startDelay: 0 }, { type: 'pink', count: 30, delay: 150, startDelay: 5000 }],
  [{ type: 'moab', count: 1, delay: 0, startDelay: 0 }, { type: 'lead', count: 15, delay: 400, startDelay: 3000 }, { type: 'camo', count: 15, delay: 300, startDelay: 6000 }],
  [{ type: 'moab', count: 2, delay: 5000, startDelay: 0 }, { type: 'pink', count: 50, delay: 80, startDelay: 2000 }],
  [{ type: 'lead', count: 30, delay: 200, startDelay: 0 }, { type: 'moab', count: 2, delay: 3000, startDelay: 5000 }, { type: 'camo', count: 25, delay: 200, startDelay: 3000 }],

  // Wave 40: BOSS — Whale Dump
  [{ type: 'boss_whale', count: 1, delay: 0, startDelay: 0 }, { type: 'moab', count: 2, delay: 4000, startDelay: 3000 }, { type: 'lead', count: 20, delay: 200, startDelay: 5000 }, { type: 'camo', count: 20, delay: 200, startDelay: 7000 }],

  // Wave 41-45: Black, white, zebra intro
  [{ type: 'black', count: 15, delay: 400, startDelay: 0 }, { type: 'pink', count: 30, delay: 150, startDelay: 3000 }],
  [{ type: 'white', count: 15, delay: 400, startDelay: 0 }, { type: 'lead', count: 10, delay: 600, startDelay: 3000 }],
  [{ type: 'black', count: 10, delay: 300, startDelay: 0 }, { type: 'white', count: 10, delay: 300, startDelay: 2000 }, { type: 'zebra', count: 5, delay: 800, startDelay: 5000 }],
  [{ type: 'zebra', count: 15, delay: 400, startDelay: 0 }, { type: 'moab', count: 2, delay: 5000, startDelay: 4000 }],
  [{ type: 'zebra', count: 20, delay: 300, startDelay: 0 }, { type: 'camo', count: 20, delay: 200, startDelay: 3000 }],

  // Wave 46-50: Rainbow rushes, BFB at wave 48
  [{ type: 'rainbow', count: 8, delay: 600, startDelay: 0 }, { type: 'lead', count: 15, delay: 300, startDelay: 3000, modifiers: { fortified: true } }],
  [{ type: 'rainbow', count: 15, delay: 400, startDelay: 0 }, { type: 'zebra', count: 20, delay: 200, startDelay: 4000 }],
  [{ type: 'bfb', count: 1, delay: 0, startDelay: 0 }, { type: 'rainbow', count: 10, delay: 400, startDelay: 5000 }, { type: 'moab', count: 3, delay: 3000, startDelay: 2000 }],
  [{ type: 'rainbow', count: 20, delay: 300, startDelay: 0 }, { type: 'moab', count: 4, delay: 3000, startDelay: 4000 }],
  [{ type: 'ceramic', count: 10, delay: 500, startDelay: 0 }, { type: 'rainbow', count: 25, delay: 200, startDelay: 3000 }],

  // Wave 51-55: Regrow ceramics, fortified leads, multi-BFB
  [{ type: 'ceramic', count: 15, delay: 400, startDelay: 0, modifiers: { regrow: true } }, { type: 'moab', count: 2, delay: 4000, startDelay: 5000 }],
  [{ type: 'lead', count: 30, delay: 150, startDelay: 0, modifiers: { fortified: true } }, { type: 'ceramic', count: 10, delay: 500, startDelay: 3000 }],
  [{ type: 'bfb', count: 2, delay: 6000, startDelay: 0 }, { type: 'ceramic', count: 20, delay: 300, startDelay: 3000, modifiers: { regrow: true } }],
  [{ type: 'moab', count: 6, delay: 2000, startDelay: 0, modifiers: { fortified: true } }, { type: 'rainbow', count: 30, delay: 150, startDelay: 4000 }],
  // Wave 55: BOSS — Protocol Exploit
  [{ type: 'boss_hack', count: 1, delay: 0, startDelay: 0 }, { type: 'bfb', count: 2, delay: 5000, startDelay: 3000 }, { type: 'ddt', count: 3, delay: 2000, startDelay: 6000 }],

  // Wave 56-58: ZOMG intro, DDT at wave 57
  [{ type: 'zomg', count: 1, delay: 0, startDelay: 0 }, { type: 'bfb', count: 2, delay: 5000, startDelay: 5000 }],
  [{ type: 'ddt', count: 3, delay: 2000, startDelay: 0 }, { type: 'ceramic', count: 30, delay: 150, startDelay: 3000, modifiers: { fortified: true } }],
  [{ type: 'zomg', count: 1, delay: 0, startDelay: 0 }, { type: 'ddt', count: 4, delay: 1500, startDelay: 4000 }, { type: 'bfb', count: 2, delay: 4000, startDelay: 8000 }],

  // Wave 59: 2 ZOMGs + DDT rush
  [{ type: 'zomg', count: 2, delay: 8000, startDelay: 0 }, { type: 'ddt', count: 6, delay: 1000, startDelay: 3000 }, { type: 'moab', count: 8, delay: 1500, startDelay: 6000, modifiers: { fortified: true } }],

  // Wave 60: FINAL BOSS — The Rug Pull
  [{ type: 'boss_rug', count: 1, delay: 0, startDelay: 0 }, { type: 'zomg', count: 2, delay: 6000, startDelay: 5000 }, { type: 'ddt', count: 6, delay: 1000, startDelay: 3000 }, { type: 'ceramic', count: 30, delay: 100, startDelay: 8000, modifiers: { fortified: true, regrow: true } }],
];

// Cash bonus for completing a wave
export const WAVE_BONUS = (waveNum) => 100 + waveNum * 5;

// Starting values (defaults for Medium)
export const STARTING_CASH = 650;
export const STARTING_LIVES = 100;

// Difficulty modes
export const DIFFICULTIES = {
  easy: {
    id: 'easy',
    name: 'Paper Hands',
    description: 'For beginners',
    lives: 200,
    cash: 850,
    cashMult: 1.0,
    hpMult: 1.0,
  },
  medium: {
    id: 'medium',
    name: 'Diamond Hands',
    description: 'Standard challenge',
    lives: 150,
    cash: 650,
    cashMult: 1.0,
    hpMult: 1.0,
  },
  hard: {
    id: 'hard',
    name: 'Degen Mode',
    description: 'Reduced income, early modifiers',
    lives: 100,
    cash: 500,
    cashMult: 0.85,
    hpMult: 1.0,
  },
  impoppable: {
    id: 'impoppable',
    name: 'Rug Pull',
    description: '1 life, 1.5x bloon HP',
    lives: 1,
    cash: 400,
    cashMult: 0.7,
    hpMult: 1.5,
  },
};

// Freeplay wave generator (called for waves beyond WAVES.length)
export function generateFreeplayWave(waveNum) {
  const scale = Math.floor((waveNum - 60) / 5) + 1;
  const types = ['ceramic', 'moab', 'bfb', 'zomg', 'ddt', 'bad'];
  const groups = [];

  // Base ceramic/rainbow spam
  groups.push({
    type: 'ceramic',
    count: 20 + scale * 5,
    delay: Math.max(50, 200 - scale * 10),
    startDelay: 0,
    modifiers: { regrow: true, fortified: true },
  });

  // Scaling MOABs
  if (waveNum >= 62) {
    groups.push({ type: 'moab', count: 4 + scale * 2, delay: 1500, startDelay: 3000, modifiers: { fortified: true } });
  }
  if (waveNum >= 65) {
    groups.push({ type: 'bfb', count: 1 + Math.floor(scale / 2), delay: 4000, startDelay: 5000 });
  }
  if (waveNum >= 68) {
    groups.push({ type: 'ddt', count: 2 + scale, delay: 1000, startDelay: 4000 });
  }
  if (waveNum >= 70) {
    groups.push({ type: 'zomg', count: Math.floor(scale / 3) + 1, delay: 6000, startDelay: 6000 });
  }
  if (waveNum >= 75 && waveNum % 5 === 0) {
    groups.push({ type: 'bad', count: Math.floor((waveNum - 70) / 10) + 1, delay: 10000, startDelay: 8000 });
  }

  return groups;
}

// Send-early bonus
export const SEND_EARLY_BONUS = (waveNum) => 50 + waveNum * 2;
