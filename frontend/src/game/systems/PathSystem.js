import { MAPS } from '../data/mapData';

export default class PathSystem {
  constructor(scene, mapId) {
    this.scene = scene;
    this.map = MAPS[mapId];
    this.scaledWaypoints = [];
    this.pathLength = 0;
    this.segmentLengths = [];
  }

  init() {
    const { width, height } = this.scene.scale;
    // Scale normalized waypoints to actual canvas size
    this.scaledWaypoints = this.map.waypoints.map(([x, y]) => ({
      x: x * width,
      y: y * height,
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

  drawPath(graphics) {
    const wp = this.scaledWaypoints;
    const pw = this.map.pathWidth;

    graphics.lineStyle(pw, this.map.pathColor, 1);
    graphics.beginPath();
    graphics.moveTo(wp[0].x, wp[0].y);
    for (let i = 1; i < wp.length; i++) {
      graphics.lineTo(wp[i].x, wp[i].y);
    }
    graphics.strokePath();

    // Draw path border
    graphics.lineStyle(pw + 4, this.map.pathColor, 0.3);
    graphics.beginPath();
    graphics.moveTo(wp[0].x, wp[0].y);
    for (let i = 1; i < wp.length; i++) {
      graphics.lineTo(wp[i].x, wp[i].y);
    }
    graphics.strokePath();
  }

  // Given a progress value (0 to 1), return {x, y} position on the path
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

  // Check if a point is too close to the path (for tower placement validation)
  isOnPath(x, y, buffer = 20) {
    const wp = this.scaledWaypoints;
    const halfWidth = this.map.pathWidth / 2 + buffer;

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
}
