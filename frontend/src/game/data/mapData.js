// Maps define path waypoints (normalized 0-1 coordinates) and playable area bounds.

export const MAPS = {
  meadow: {
    id: 'meadow',
    name: 'DEX Floor',
    backgroundColor: 0x0a1628,
    pathColor: 0x1a3a5e,
    pathWidth: 30,
    waypoints: [
      [0.0, 0.3],
      [0.2, 0.3],
      [0.2, 0.7],
      [0.5, 0.7],
      [0.5, 0.2],
      [0.75, 0.2],
      [0.75, 0.8],
      [1.0, 0.8],
    ],
  },
  desert: {
    id: 'desert',
    name: 'Mempool',
    backgroundColor: 0x14100a,
    pathColor: 0x3a2a10,
    pathWidth: 28,
    waypoints: [
      [0.0, 0.5],
      [0.15, 0.15],
      [0.35, 0.85],
      [0.55, 0.15],
      [0.75, 0.85],
      [0.9, 0.5],
      [1.0, 0.5],
    ],
  },
  river: {
    id: 'river',
    name: 'Blockchain',
    backgroundColor: 0x0a0a1e,
    pathColor: 0x1a1a4a,
    pathWidth: 26,
    waypoints: [
      [0.0, 0.15],
      [0.3, 0.15],
      [0.3, 0.45],
      [0.1, 0.45],
      [0.1, 0.75],
      [0.5, 0.75],
      [0.5, 0.45],
      [0.7, 0.45],
      [0.7, 0.85],
      [0.9, 0.85],
      [0.9, 0.5],
      [1.0, 0.5],
    ],
  },
};

export const DEFAULT_MAP = 'meadow';
