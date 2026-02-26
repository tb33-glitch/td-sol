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
    this.radius = 5;
    this.active = true;
    this.hitBloons = new Set();
    this.lifetime = 3000;
    this.lived = 0;
    this.isInstant = stats.isSniper || (this.speed >= 99);

    // Sprite — use texture if available, fallback to graphics
    const textureKey = stats.projTextureKey;
    if (textureKey && scene.textures.exists(textureKey)) {
      this.sprite = scene.add.image(0, 0, textureKey);
      this.sprite.setDisplaySize(12, 12);
      this.add(this.sprite);
    } else {
      this.graphics = scene.add.graphics();
      this.add(this.graphics);
      const color = stats.projectileColor || 0xffffff;
      this.graphics.fillStyle(color, 1);
      this.graphics.fillCircle(0, 0, this.radius);
    }

    scene.add.existing(this);
    this.setDepth(15);

    // Calculate velocity toward target
    if (this.target && this.target.active) {
      if (this.isInstant) {
        this.setPosition(this.target.x, this.target.y);
        this.lived = this.lifetime;
      } else {
        const dx = this.target.x - x;
        const dy = this.target.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          this.vx = (dx / dist) * this.speed;
          this.vy = (dy / dist) * this.speed;

          // Rotate sprite to face target
          if (this.sprite) {
            this.sprite.setRotation(Math.atan2(dy, dx));
          }
        } else {
          this.vx = 0;
          this.vy = 0;
        }
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

    this.x += this.vx * (delta / 16.67);
    this.y += this.vy * (delta / 16.67);

    const { width, height } = this.scene.scale;
    if (this.x < -20 || this.x > width + 20 || this.y < -20 || this.y > height + 20) {
      this.active = false;
    }
  }

  destroy() {
    if (this.graphics) this.graphics.destroy();
    if (this.sprite) this.sprite.destroy();
    super.destroy();
  }
}
