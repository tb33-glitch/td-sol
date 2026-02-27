// Challenge mode definitions
// Each challenge has a set of rules that GameScene enforces

export const CHALLENGES = {
  hodl: {
    id: 'hodl',
    name: 'HODL',
    description: 'Cannot sell towers. Ever.',
    rewardText: 'True believer',
    rules: {
      canSell: false,
    },
  },
  sniperOnly: {
    id: 'sniperOnly',
    name: 'Sniper Only',
    description: 'Only sniper towers allowed',
    rewardText: 'One-shot one-kill',
    rules: {
      allowedTowers: ['sniper'],
    },
  },
  poverty: {
    id: 'poverty',
    name: 'Poverty Mode',
    description: 'Start with $200, no income towers',
    rewardText: 'Bootstrapped',
    rules: {
      startingCash: 200,
      bannedTowers: ['banana'],
    },
  },
  speedRun: {
    id: 'speedRun',
    name: 'Speed Run',
    description: 'Game locked at 3x speed, no pause',
    rewardText: 'Built different',
    rules: {
      lockedSpeed: 3,
      canPause: false,
    },
  },
  noUpgrades: {
    id: 'noUpgrades',
    name: 'No Upgrades',
    description: 'Towers stay at base tier',
    rewardText: 'Vanilla maxi',
    rules: {
      canUpgrade: false,
    },
  },
  onePath: {
    id: 'onePath',
    name: 'One Path',
    description: 'Only 1 upgrade path per tower type (chosen on first upgrade)',
    rewardText: 'Focused',
    rules: {
      onePathPerType: true,
    },
  },
  reverse: {
    id: 'reverse',
    name: 'Reverse',
    description: 'Bloons go backward on the path',
    rewardText: 'Contrarian',
    rules: {
      reverseMode: true,
    },
  },
  randomTowers: {
    id: 'randomTowers',
    name: 'Random Towers',
    description: 'Each placement gives a random tower type',
    rewardText: 'Degen trader',
    rules: {
      randomTowers: true,
    },
  },
};
