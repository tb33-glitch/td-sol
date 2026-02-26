import Phaser from 'phaser';
import { BLOON_TYPES } from '../data/bloonData';

export default class Bloon extends Phaser.GameObjects.Container {
  constructor(scene, typeId, pathProgress = 0) {
    super(scene, 0, 0);

    this.bloonData = BLOON_TYPES[typeId];
    this.typeId = typeId;
    this.hp = this.bloonData.hp;
    this.pathProgress = pathProgress;
    this.baseSpeed = this.bloonData.speed;
    this.currentSpeed = this.baseSpeed;
    this.isCamo = this.bloonData.isCamo || false;
    this.isMoab = this.bloonData.isMoab || false;
    this.displayRadius = this.bloonData.radius || (this.isMoab ? 20 : 10);
    this.active = true;

    // Status effects
    this.slowAmount = 1;
    this.slowTimer = 0;
    this.stunTimer = 0;

    // Sprite — use texture if available, fallback to graphics
    const textureKey = this.bloonData.textureKey;
    if (textureKey && scene.textures.exists(textureKey)) {
      this.sprite = scene.add.image(0, 0, textureKey);
      const displaySize = this.isMoab ? 40 : 22;
      this.sprite.setDisplaySize(displaySize, displaySize);
      this.add(this.sprite);

      // Camo — lower alpha
      if (this.isCamo) {
        this.sprite.setAlpha(0.6);
      }
    } else {
      this.graphics = scene.add.graphics();
      this.add(this.graphics);
      this.drawFallback();
    }

    // HP bar for MOABs
    if (this.isMoab) {
      this.hpBar = scene.add.graphics();
      this.add(this.hpBar);
      this.drawHpBar();
    }

    scene.add.existing(this);
    this.setDepth(10);

    this.updatePosition();
  }

  drawFallback() {
    this.graphics.clear();
    this.graphics.fillStyle(this.bloonData.color, this.isCamo ? 0.6 : 1);
    this.graphics.fillCircle(0, 0, this.displayRadius);
    this.graphics.lineStyle(1.5, 0x000000, 0.4);
    this.graphics.strokeCircle(0, 0, this.displayRadius);
    this.graphics.fillStyle(0xffffff, 0.3);
    this.graphics.fillCircle(-this.displayRadius * 0.25, -this.displayRadius * 0.25, this.displayRadius * 0.35);
  }

  drawHpBar() {
    if (!this.hpBar) return;
    this.hpBar.clear();

    const barWidth = this.displayRadius * 2;
    const barHeight = 4;
    const y = -this.displayRadius - 8;

    this.hpBar.fillStyle(0x000000, 0.5);
    this.hpBar.fillRect(-barWidth / 2, y, barWidth, barHeight);

    const pct = this.hp / this.bloonData.hp;
    const color = pct > 0.5 ? 0x00ff00 : pct > 0.25 ? 0xffff00 : 0xff0000;
    this.hpBar.fillStyle(color, 0.8);
    this.hpBar.fillRect(-barWidth / 2, y, barWidth * pct, barHeight);
  }

  updatePosition() {
    const pos = this.scene.pathSystem.getPositionAtProgress(this.pathProgress);
    this.setPosition(pos.x, pos.y);
  }

  applyStun(duration) {
    this.stunTimer = Math.max(this.stunTimer, duration);
  }

  applySlow(amount, duration) {
    this.slowAmount = Math.min(this.slowAmount, amount);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  update(delta) {
    if (!this.active) return;

    // Stun
    if (this.stunTimer > 0) {
      this.stunTimer -= delta;
      this.currentSpeed = 0;
      return;
    }

    // Slow
    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      this.currentSpeed = this.baseSpeed * this.slowAmount;
    } else {
      this.slowAmount = 1;
      this.currentSpeed = this.baseSpeed;
    }

    // Move along path
    const speedFactor = this.currentSpeed * 0.0008;
    this.pathProgress += speedFactor * (delta / 16.67);

    this.updatePosition();

    // Update MOAB HP bar
    if (this.isMoab) {
      this.drawHpBar();
    }

    // Check if reached end
    if (this.pathProgress >= 1) {
      this.reachedEnd();
    }
  }

  reachedEnd() {
    if (!this.active) return;
    this.active = false;
    this.scene.loseLife(this.bloonData.rbe);
    this.destroy();
  }

  pop() {
    this.active = false;
    this.destroy();
  }

  destroy() {
    if (this.graphics) this.graphics.destroy();
    if (this.hpBar) this.hpBar.destroy();
    if (this.sprite) this.sprite.destroy();
    super.destroy();
  }
}
