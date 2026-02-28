import { MAPS } from './data/mapData.js';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;

export default class HeadlessPathSystem {
  constructor(mapId) {
    const map = MAPS[mapId];
    if (!map) throw new Error(`Unknown map: ${mapId}`);

    this.mapData = map;
    this.scaledWaypoints = map.waypoints.map(([x, y]) => ({
      x: x * CANVAS_WIDTH,
      y: y * CANVAS_HEIGHT,
    }));

    // Pre-calculate segment lengths and total path length
    this.segmentLengths = [];
    this.pathLength = 0;
    for (let i = 1; i < this.scaledWaypoints.length; i++) {
      const dx = this.scaledWaypoints[i].x - this.scaledWaypoints[i - 1].x;
      const dy = this.scaledWaypoints[i].y - this.scaledWaypoints[i - 1].y;
      const len = Math.sqrt(dx * dx + dy * dy);
      this.segmentLengths.push(len);
      this.pathLength += len;
    }
  }

  getPositionAtProgress(progress) {
    if (progress <= 0) return { ...this.scaledWaypoints[0] };
    if (progress >= 1) return { ...this.scaledWaypoints[this.scaledWaypoints.length - 1] };

    const targetDist = progress * this.pathLength;
    let accumulated = 0;

    for (let i = 0; i < this.segmentLengths.length; i++) {
      const segLen = this.segmentLengths[i];
      if (accumulated + segLen >= targetDist) {
        const t = (targetDist - accumulated) / segLen;
        const p0 = this.scaledWaypoints[i];
        const p1 = this.scaledWaypoints[i + 1];
        return {
          x: p0.x + (p1.x - p0.x) * t,
          y: p0.y + (p1.y - p0.y) * t,
        };
      }
      accumulated += segLen;
    }

    return { ...this.scaledWaypoints[this.scaledWaypoints.length - 1] };
  }

  isOnPath(x, y, buffer = 20) {
    const halfWidth = this.mapData.pathWidth / 2 + buffer;
    const wp = this.scaledWaypoints;

    for (let i = 0; i < wp.length - 1; i++) {
      const dist = this.pointToSegmentDistance(x, y, wp[i].x, wp[i].y, wp[i + 1].x, wp[i + 1].y);
      if (dist < halfWidth) return true;
    }
    return false;
  }

  pointToSegmentDistance(px, py, ax, ay, bx, by) {
    const dx = bx - ax;
    const dy = by - ay;
    const lenSq = dx * dx + dy * dy;
    if (lenSq === 0) return Math.sqrt((px - ax) ** 2 + (py - ay) ** 2);

    let t = ((px - ax) * dx + (py - ay) * dy) / lenSq;
    t = Math.max(0, Math.min(1, t));

    const projX = ax + t * dx;
    const projY = ay + t * dy;
    return Math.sqrt((px - projX) ** 2 + (py - projY) ** 2);
  }

  getPathLength() {
    return this.pathLength;
  }
}
