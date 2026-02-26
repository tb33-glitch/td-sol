// Maps define path waypoints (normalized 0-1 coordinates) and playable area bounds.
// Coordinates are normalized and scaled to actual canvas size at runtime.

export const MAPS = {
  meadow: {
    id: 'meadow',
    name: 'Meadow',
    backgroundColor: 0x4a8c3f,
    pathColor: 0xc4a35a,
    pathWidth: 30,
    // Path waypoints as normalized [x, y] (0-1 range, scaled to canvas size)
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
    // Areas where towers CANNOT be placed (the path + buffer)
    // Calculated dynamically from waypoints + pathWidth
  },
  desert: {
    id: 'desert',
    name: 'Desert',
    backgroundColor: 0xd4a857,
    pathColor: 0x8b6914,
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
    name: 'River Crossing',
    backgroundColor: 0x3a7a3a,
    pathColor: 0xb8a060,
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
