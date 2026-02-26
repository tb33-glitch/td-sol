import Phaser from 'phaser';

export default class Projectile extends Phaser.GameObjects.Container {
  constructor(scene, x, y, targetBloon, stats) {
    super(scene, x, y);

    this.target = targetBloon;
    this.speed = stats.projectileSpeed || 8;
    this.damage = stats.damage || 1;
    this.pierce = stats.pierce || 1;
    this.pierceRemaining = this.pierce;
    this.damageType = stats.damageType || 'sharp';
    this.splashRadius = stats.splashRadius || 0;
    this.stunDuration = stats.stunDuration || 0;
    this.slowAmount = stats.slowAmount || 0;
    this.slowDuration = stats.slowDuration || 0;
    this.moabDamageMult = stats.moabDamageMult || 1;
    this.radius = 4;
    this.active = true;
    this.hitBloons = new Set();
    this.lifetime = 3000; // max lifetime ms
    this.lived = 0;

    // For sniper (instant hit)
    this.isInstant = stats.isSniper || (this.speed >= 99);

    // Draw projectile
    this.graphics = scene.add.graphics();
    this.add(this.graphics);

    const color = stats.projectileColor || 0xffffff;
    this.graphics.fillStyle(color, 1);
    this.graphics.fillCircle(0, 0, this.radius);

    scene.add.existing(this);
    this.setDepth(15);

    // Calculate velocity toward target
    if (this.target && this.target.active) {
      if (this.isInstant) {
        // Instant hit — teleport to target and apply damage immediately
        this.setPosition(this.target.x, this.target.y);
        this.lived = this.lifetime; // will be cleaned up next frame
      } else {
        const dx = this.target.x - x;
        const dy = this.target.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        this.vx = (dx / dist) * this.speed;
        this.vy = (dy / dist) * this.speed;
      }
    } else {
      this.vx = 0;
      this.vy = 0;
      this.active = false;
    }
  }

  update(delta) {
    if (!this.active) return;

    this.lived += delta;
    if (this.lived >= this.lifetime) {
      this.active = false;
      return;
    }

    // Move
    this.x += this.vx * (delta / 16.67);
    this.y += this.vy * (delta / 16.67);

    // Out of bounds check
    const { width, height } = this.scene.scale;
    if (this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20) {
      this.active = false;
    }
  }

  destroy() {
    if (this.graphics) this.graphics.destroy();
    super.destroy();
  }
}
