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

  // Wave 16-20: Pinks and mixed rushes
  [{ type: 'pink', count: 5, delay: 600, startDelay: 0 }, { type: 'green', count: 20, delay: 300, startDelay: 3000 }],
  [{ type: 'yellow', count: 20, delay: 300, startDelay: 0 }, { type: 'pink', count: 8, delay: 500, startDelay: 5000 }],
  [{ type: 'pink', count: 15, delay: 400, startDelay: 0 }],
  [{ type: 'pink', count: 12, delay: 300, startDelay: 0 }, { type: 'green', count: 30, delay: 150, startDelay: 4000 }],
  [{ type: 'yellow', count: 30, delay: 200, startDelay: 0 }, { type: 'pink', count: 15, delay: 300, startDelay: 3000 }],

  // Wave 21-25: Leads and camos
  [{ type: 'lead', count: 3, delay: 2000, startDelay: 0 }, { type: 'pink', count: 15, delay: 300, startDelay: 1000 }],
  [{ type: 'camo', count: 8, delay: 600, startDelay: 0 }, { type: 'yellow', count: 20, delay: 250, startDelay: 3000 }],
  [{ type: 'lead', count: 5, delay: 1500, startDelay: 0 }, { type: 'camo', count: 10, delay: 500, startDelay: 4000 }],
  [{ type: 'pink', count: 40, delay: 150, startDelay: 0 }],
  [{ type: 'lead', count: 8, delay: 1000, startDelay: 0 }, { type: 'pink', count: 20, delay: 200, startDelay: 2000 }, { type: 'camo', count: 10, delay: 400, startDelay: 5000 }],

  // Wave 26-30: Heavy mixed
  [{ type: 'yellow', count: 50, delay: 100, startDelay: 0 }, { type: 'lead', count: 5, delay: 1200, startDelay: 3000 }],
  [{ type: 'camo', count: 15, delay: 400, startDelay: 0 }, { type: 'lead', count: 8, delay: 800, startDelay: 5000 }],
  [{ type: 'pink', count: 30, delay: 150, startDelay: 0 }, { type: 'lead', count: 10, delay: 600, startDelay: 2000 }],
  [{ type: 'lead', count: 15, delay: 500, startDelay: 0 }, { type: 'camo', count: 20, delay: 300, startDelay: 4000 }],
  [{ type: 'pink', count: 50, delay: 80, startDelay: 0 }, { type: 'lead', count: 12, delay: 400, startDelay: 2000 }],

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

  // Wave 40: Final boss wave
  [{ type: 'moab', count: 4, delay: 4000, startDelay: 0 }, { type: 'lead', count: 20, delay: 200, startDelay: 2000 }, { type: 'camo', count: 30, delay: 150, startDelay: 4000 }, { type: 'pink', count: 60, delay: 60, startDelay: 6000 }],
];

// Cash bonus for completing a wave
export const WAVE_BONUS = (waveNum) => 100 + waveNum * 5;

// Starting values
export const STARTING_CASH = 650;
export const STARTING_LIVES = 100;
