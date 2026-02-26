// Bloon types: Red → Blue → Green → Yellow → Pink
// Each pops into a child of the layer below

export const BLOON_TYPES = {
  red: {
    id: 'red',
    color: 0xff0000,
    hp: 1,
    speed: 1.0,
    rbe: 1, // red bloon equivalent (total pops to fully destroy)
    children: [],
    immunities: [],
  },
  blue: {
    id: 'blue',
    color: 0x0066ff,
    hp: 1,
    speed: 1.2,
    rbe: 2,
    children: ['red'],
    immunities: [],
  },
  green: {
    id: 'green',
    color: 0x00cc00,
    hp: 1,
    speed: 1.5,
    rbe: 3,
    children: ['blue'],
    immunities: [],
  },
  yellow: {
    id: 'yellow',
    color: 0xffcc00,
    hp: 1,
    speed: 2.0,
    rbe: 4,
    children: ['green'],
    immunities: [],
  },
  pink: {
    id: 'pink',
    color: 0xff69b4,
    hp: 1,
    speed: 2.5,
    rbe: 5,
    children: ['yellow'],
    immunities: [],
  },
  lead: {
    id: 'lead',
    color: 0x666666,
    hp: 1,
    speed: 0.8,
    rbe: 25,
    children: ['pink', 'pink'],
    immunities: ['sharp'], // immune to darts
  },
  camo: {
    id: 'camo',
    color: 0x336633,
    hp: 1,
    speed: 2.0,
    rbe: 4,
    children: ['green'],
    immunities: ['detection'], // invisible to towers without camo detection
    isCamo: true,
  },
  moab: {
    id: 'moab',
    color: 0x0044aa,
    hp: 200,
    speed: 0.5,
    rbe: 220,
    children: ['pink', 'pink', 'pink', 'pink'],
    immunities: ['freeze'],
    isMoab: true,
    radius: 20,
  },
};

// Cash earned per bloon pop layer
export const POP_CASH = 1;

// Cash earned per bloon fully destroyed
export const DESTROY_BONUS = 0;
