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
    this.displayRadius = this.bloonData.radius || (this.isMoab ? 20 : 8);
    this.active = true;

    // Status effects
    this.slowAmount = 1;
    this.slowTimer = 0;
    this.stunTimer = 0;

    // Draw the bloon
    this.graphics = scene.add.graphics();
    this.add(this.graphics);
    this.drawBloon();

    // HP bar for MOABs
    if (this.isMoab) {
      this.hpBar = scene.add.graphics();
      this.add(this.hpBar);
      this.drawHpBar();
    }

    scene.add.existing(this);
    this.setDepth(10);

    // Update position immediately
    this.updatePosition();
  }

  drawBloon() {
    this.graphics.clear();

    // Camo pattern (striped)
    if (this.isCamo) {
      this.graphics.fillStyle(this.bloonData.color, 0.8);
      this.graphics.fillCircle(0, 0, this.displayRadius);
      this.graphics.lineStyle(2, 0x224422, 0.6);
      for (let i = -this.displayRadius; i < this.displayRadius; i += 4) {
        this.graphics.lineBetween(i, -this.displayRadius, i + 3, this.displayRadius);
      }
    } else {
      this.graphics.fillStyle(this.bloonData.color, 1);
      this.graphics.fillCircle(0, 0, this.displayRadius);
    }

    // Outline
    this.graphics.lineStyle(1.5, 0x000000, 0.4);
    this.graphics.strokeCircle(0, 0, this.displayRadius);

    // Shine effect
    this.graphics.fillStyle(0xffffff, 0.3);
    this.graphics.fillCircle(-this.displayRadius * 0.25, -this.displayRadius * 0.25, this.displayRadius * 0.35);
  }

  drawHpBar() {
    if (!this.hpBar) return;
    this.hpBar.clear();

    const barWidth = this.displayRadius * 2;
    const barHeight = 4;
    const y = -this.displayRadius - 8;

    // Background
    this.hpBar.fillStyle(0x000000, 0.5);
    this.hpBar.fillRect(-barWidth / 2, y, barWidth, barHeight);

    // HP fill
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

    // Update stun
    if (this.stunTimer > 0) {
      this.stunTimer -= delta;
      this.currentSpeed = 0;
      return; // stunned, don't move
    }

    // Update slow
    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      this.currentSpeed = this.baseSpeed * this.slowAmount;
    } else {
      this.slowAmount = 1;
      this.currentSpeed = this.baseSpeed;
    }

    // Move along path
    // Speed is normalized: 1.0 speed = cross the map in ~15 seconds
    const speedFactor = this.currentSpeed * 0.0008;
    this.pathProgress += speedFactor * (delta / 16.67); // normalize to 60fps

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
    // Damage lives based on RBE
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
    super.destroy();
  }
}
