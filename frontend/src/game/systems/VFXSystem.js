import Phaser from 'phaser';

export default class VFXSystem {
  constructor(scene) {
    this.scene = scene;

    // Object pools — pre-allocate and reuse
    this.graphicsPool = [];
    this.textPool = [];
    this.activeEffects = []; // { obj, type, timer, duration, onUpdate, onComplete }

    // Pre-allocate 60 graphics + 15 text objects
    for (let i = 0; i < 60; i++) {
      const g = scene.add.graphics();
      g.setDepth(25);
      g.setVisible(false);
      this.graphicsPool.push(g);
    }
    for (let i = 0; i < 15; i++) {
      const t = scene.add.text(0, 0, '', {
        fontSize: '12px',
        fontFamily: 'monospace',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
      });
      t.setOrigin(0.5, 0.5);
      t.setDepth(30);
      t.setVisible(false);
      this.textPool.push(t);
    }

    // Ambient particle system
    this.ambientParticles = [];
    const { width, height } = scene.scale;
    for (let i = 0; i < 12; i++) {
      this.ambientParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.2,
        alpha: 0.1 + Math.random() * 0.15,
        radius: 1 + Math.random() * 1.5,
      });
    }
    this.ambientGfx = scene.add.graphics();
    this.ambientGfx.setDepth(2);

    // Wave banner objects (persistent, reused)
    this.bannerBg = null;
    this.bannerText = null;

    // Screen shake state
    this._shakeIntensity = 0;
    this._shakeTimer = 0;
    this._shakeDuration = 0;
  }

  // --- Pool helpers ---

  getGraphics() {
    for (const g of this.graphicsPool) {
      if (!g.visible) {
        g.clear();
        g.setVisible(true);
        g.setAlpha(1);
        g.setScale(1);
        g.setPosition(0, 0);
        return g;
      }
    }
    // Fallback: create a new one
    const g = this.scene.add.graphics();
    g.setDepth(25);
    this.graphicsPool.push(g);
    return g;
  }

  getText() {
    for (const t of this.textPool) {
      if (!t.visible) {
        t.setVisible(true);
        t.setAlpha(1);
        t.setScale(1);
        return t;
      }
    }
    const t = this.scene.add.text(0, 0, '', {
      fontSize: '12px',
      fontFamily: 'monospace',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
    });
    t.setOrigin(0.5, 0.5);
    t.setDepth(30);
    this.textPool.push(t);
    return t;
  }

  releaseGraphics(g) {
    g.clear();
    g.setVisible(false);
  }

  releaseText(t) {
    t.setVisible(false);
  }

  // --- Core VFX Methods ---

  /** Burst of color-matched particles on pop */
  popBurst(x, y, color, count = 8) {
    const g = this.getGraphics();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const dist = 2 + Math.random() * 4;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      const size = 1.5 + Math.random() * 2.5;
      g.fillStyle(color, 0.6 + Math.random() * 0.4);
      g.fillCircle(px, py, size);
    }

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 250,
      onComplete: () => this.releaseGraphics(g),
    });
  }

  /** Brief bright flash at impact point */
  impactFlash(x, y, color = 0xffffff, radius = 8) {
    const g = this.getGraphics();
    g.fillStyle(color, 0.9);
    g.fillCircle(x, y, radius);
    g.fillStyle(0xffffff, 0.6);
    g.fillCircle(x, y, radius * 0.4);

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 150,
      onComplete: () => this.releaseGraphics(g),
    });
  }

  /** Expanding ring for AoE splash */
  splashRing(x, y, radius, color = 0xff8844) {
    const g = this.getGraphics();
    g.setPosition(x, y);

    // Animate via active effect
    const duration = 300;
    this.activeEffects.push({
      obj: g,
      type: 'splashRing',
      timer: 0,
      duration,
      color,
      radius,
      x, y,
      onUpdate: (effect, dt) => {
        const t = effect.timer / effect.duration;
        const curRadius = effect.radius * t;
        const alpha = 1 - t;
        effect.obj.clear();
        effect.obj.lineStyle(2 - t * 1.5, effect.color, alpha * 0.8);
        effect.obj.strokeCircle(0, 0, curRadius);
      },
      onComplete: (effect) => this.releaseGraphics(effect.obj),
    });
  }

  /** Small bright flash at tower edge in fire direction */
  muzzleFlash(x, y, angle, color = 0xffff88, size = 6) {
    const g = this.getGraphics();
    const mx = x + Math.cos(angle) * 14;
    const my = y + Math.sin(angle) * 14;
    g.fillStyle(color, 0.9);
    g.fillCircle(mx, my, size);
    g.fillStyle(0xffffff, 0.7);
    g.fillCircle(mx, my, size * 0.4);

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: 100,
      onComplete: () => this.releaseGraphics(g),
    });
  }

  /** Periodic particles near a bloon for status effects */
  statusParticles(x, y, type) {
    const g = this.getGraphics();
    let color, count, spread;

    switch (type) {
      case 'stun':
        color = 0xffff00;
        count = 3;
        spread = 12;
        // Star-like particles
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
          const dist = 4 + Math.random() * spread;
          g.fillStyle(color, 0.7 + Math.random() * 0.3);
          // Small diamond shape
          const px = x + Math.cos(angle) * dist;
          const py = y + Math.sin(angle) * dist;
          g.fillCircle(px, py, 1.5);
        }
        break;
      case 'slow':
        color = 0x88bbff;
        count = 2;
        spread = 10;
        for (let i = 0; i < count; i++) {
          const px = x + (Math.random() - 0.5) * spread * 2;
          const py = y + (Math.random() - 0.5) * spread * 2;
          g.fillStyle(color, 0.5 + Math.random() * 0.3);
          // Ice crystal — small cross
          g.fillRect(px - 2, py - 0.5, 4, 1);
          g.fillRect(px - 0.5, py - 2, 1, 4);
        }
        break;
      case 'regrow':
        color = 0x44ff44;
        count = 2;
        spread = 10;
        for (let i = 0; i < count; i++) {
          const px = x + (Math.random() - 0.5) * spread * 2;
          const py = y - Math.random() * spread;
          g.fillStyle(color, 0.5 + Math.random() * 0.3);
          g.fillCircle(px, py, 1 + Math.random());
        }
        break;
      default:
        this.releaseGraphics(g);
        return;
    }

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      y: '-=8',
      duration: 400,
      onComplete: () => this.releaseGraphics(g),
    });
  }

  /** Floating text (damage numbers, cash, level ups) */
  floatingText(x, y, text, color = '#ffffff', fontSize = '10px') {
    const t = this.getText();
    t.setPosition(x, y);
    t.setText(text);
    t.setStyle({
      fontSize,
      fontFamily: 'monospace',
      color,
      stroke: '#000000',
      strokeThickness: 2,
    });
    t.setDepth(30);

    this.scene.tweens.add({
      targets: t,
      y: y - 20,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => this.releaseText(t),
    });
  }

  /** Camera shake effect */
  screenShake(intensity = 3, duration = 200) {
    this._shakeIntensity = intensity;
    this._shakeDuration = duration;
    this._shakeTimer = 0;
  }

  /** Wave banner — dark bar slides in with wave text */
  waveBanner(waveNum) {
    const { width, height } = this.scene.scale;

    if (!this.bannerBg) {
      this.bannerBg = this.scene.add.graphics();
      this.bannerBg.setDepth(50);
      this.bannerBg.setVisible(false);
    }
    if (!this.bannerText) {
      this.bannerText = this.scene.add.text(width / 2, 0, '', {
        fontSize: '24px',
        fontFamily: 'monospace',
        color: '#44ff88',
        stroke: '#000000',
        strokeThickness: 3,
        fontStyle: 'bold',
      });
      this.bannerText.setOrigin(0.5, 0.5);
      this.bannerText.setDepth(51);
      this.bannerText.setVisible(false);
    }

    // Setup banner
    this.bannerBg.clear();
    this.bannerBg.fillStyle(0x000000, 0.75);
    this.bannerBg.fillRect(0, 0, width, 50);
    this.bannerBg.setPosition(0, -50);
    this.bannerBg.setVisible(true);

    this.bannerText.setText(`WAVE ${waveNum}`);
    this.bannerText.setPosition(width / 2, -25);
    this.bannerText.setVisible(true);
    this.bannerText.setAlpha(1);

    const centerY = height * 0.15;

    // Slide in
    this.scene.tweens.add({
      targets: [this.bannerBg],
      y: centerY - 25,
      duration: 300,
      ease: 'Power2',
    });
    this.scene.tweens.add({
      targets: [this.bannerText],
      y: centerY,
      duration: 300,
      ease: 'Power2',
      onComplete: () => {
        // Hold, then slide out
        this.scene.time.delayedCall(1200, () => {
          this.scene.tweens.add({
            targets: [this.bannerBg],
            y: -50,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => {
              this.bannerBg.setVisible(false);
              this.bannerBg.setAlpha(1);
            },
          });
          this.scene.tweens.add({
            targets: [this.bannerText],
            y: centerY - 30,
            alpha: 0,
            duration: 400,
            ease: 'Power2',
            onComplete: () => this.bannerText.setVisible(false),
          });
        });
      },
    });
  }

  /** Dramatic boss entrance: red flash + name text + screen shake */
  bossEntrance(name) {
    const { width, height } = this.scene.scale;

    // Red overlay flash
    const g = this.getGraphics();
    g.setDepth(49);
    g.fillStyle(0xff0000, 0.25);
    g.fillRect(0, 0, width, height);

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: 800,
      onComplete: () => this.releaseGraphics(g),
    });

    // Boss name text zoom-in
    const t = this.getText();
    t.setPosition(width / 2, height * 0.35);
    t.setText(name || 'BOSS');
    t.setStyle({
      fontSize: '28px',
      fontFamily: 'monospace',
      color: '#ff4466',
      stroke: '#000000',
      strokeThickness: 4,
      fontStyle: 'bold',
    });
    t.setDepth(52);
    t.setScale(0.3);
    t.setAlpha(1);

    this.scene.tweens.add({
      targets: t,
      scaleX: 1.2,
      scaleY: 1.2,
      duration: 400,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.scene.tweens.add({
          targets: t,
          alpha: 0,
          y: t.y - 15,
          duration: 800,
          delay: 800,
          onComplete: () => this.releaseText(t),
        });
      },
    });

    // Screen shake
    this.screenShake(5, 400);
  }

  /** Gold sparkle burst on tower upgrade */
  upgradeSparkle(x, y) {
    const g = this.getGraphics();
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const dist = 6 + Math.random() * 10;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      const size = 1 + Math.random() * 2;
      g.fillStyle(i % 2 === 0 ? 0xffcc00 : 0xffffff, 0.7 + Math.random() * 0.3);
      g.fillCircle(px, py, size);
    }

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      scaleX: 1.8,
      scaleY: 1.8,
      duration: 400,
      onComplete: () => this.releaseGraphics(g),
    });
  }

  /** Ground-impact ring + dust puff when a tower is placed */
  placementSlam(x, y) {
    // Expanding impact ring
    const g = this.getGraphics();
    g.setPosition(x, y);
    const duration = 350;
    this.activeEffects.push({
      obj: g,
      type: 'placementSlam',
      timer: 0,
      duration,
      onUpdate: (effect, dt) => {
        const t = effect.timer / effect.duration;
        const radius = 8 + t * 25;
        const alpha = (1 - t) * 0.6;
        effect.obj.clear();
        effect.obj.lineStyle(2 - t * 1.5, 0x44ff88, alpha);
        effect.obj.strokeCircle(0, 0, radius);
      },
      onComplete: (effect) => this.releaseGraphics(effect.obj),
    });

    // Dust puff particles
    const dust = this.getGraphics();
    const count = 6;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const dist = 8 + Math.random() * 12;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      dust.fillStyle(0xffffff, 0.15 + Math.random() * 0.15);
      dust.fillCircle(px, py, 2 + Math.random() * 2);
    }
    this.scene.tweens.add({
      targets: dust,
      alpha: 0,
      scaleX: 1.6,
      scaleY: 1.6,
      duration: 300,
      onComplete: () => this.releaseGraphics(dust),
    });
  }

  /** Red vignette flash when lives are lost */
  lifeLostFlash() {
    const { width, height } = this.scene.scale;
    const g = this.getGraphics();
    g.setDepth(48);

    // Red vignette — darker at edges, transparent at center
    g.fillStyle(0xff0000, 0.3);
    g.fillRect(0, 0, width, height);
    // Inner cutout (brighter center = less red)
    g.fillStyle(0xff0000, -0.2); // won't subtract, but overlay is fine

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      duration: 500,
      ease: 'Power2',
      onComplete: () => this.releaseGraphics(g),
    });
  }

  /** Gold coin burst when selling a tower */
  sellExplosion(x, y, value) {
    const g = this.getGraphics();
    const count = 10;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const dist = 5 + Math.random() * 15;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      const size = 1.5 + Math.random() * 2;
      // Alternate gold and white for coin sparkle
      g.fillStyle(i % 3 === 0 ? 0xffffff : 0xffcc00, 0.7 + Math.random() * 0.3);
      g.fillCircle(px, py, size);
    }

    this.scene.tweens.add({
      targets: g,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 400,
      ease: 'Power2',
      onComplete: () => this.releaseGraphics(g),
    });

    // Floating sell value text
    this.floatingText(x, y - 15, `+$${value}`, '#ffcc00', '12px');
  }

  /** Draw faint pulsing lines between synergized towers */
  drawSynergyLinks(activeSynergies, gameTime) {
    if (!this._synergyGfx) {
      this._synergyGfx = this.scene.add.graphics();
      this._synergyGfx.setDepth(5);
    }
    this._synergyGfx.clear();

    if (!activeSynergies || activeSynergies.length === 0) return;

    // Pulsing alpha based on game time
    const pulse = 0.08 + Math.sin(gameTime * 0.003) * 0.04;

    for (const entry of activeSynergies) {
      const towers = entry.towers;
      if (!towers || towers.length < 2) continue;

      // Draw lines between all towers in the synergy group
      for (let i = 0; i < towers.length - 1; i++) {
        for (let j = i + 1; j < towers.length; j++) {
          const a = towers[i];
          const b = towers[j];
          if (!a || !b) continue;

          // Line
          this._synergyGfx.lineStyle(1.5, 0x44ff88, pulse);
          this._synergyGfx.beginPath();
          this._synergyGfx.moveTo(a.x, a.y);
          this._synergyGfx.lineTo(b.x, b.y);
          this._synergyGfx.strokePath();

          // Midpoint particle
          const mx = (a.x + b.x) / 2;
          const my = (a.y + b.y) / 2;
          this._synergyGfx.fillStyle(0x44ff88, pulse * 1.5);
          this._synergyGfx.fillCircle(mx, my, 2);
        }
      }
    }
  }

  // --- Update loop ---

  update(delta) {
    // Tick active effects
    for (let i = this.activeEffects.length - 1; i >= 0; i--) {
      const effect = this.activeEffects[i];
      effect.timer += delta;
      if (effect.timer >= effect.duration) {
        if (effect.onComplete) effect.onComplete(effect);
        this.activeEffects.splice(i, 1);
      } else {
        if (effect.onUpdate) effect.onUpdate(effect, delta);
      }
    }

    // Ambient particles
    const { width, height } = this.scene.scale;
    this.ambientGfx.clear();
    for (const p of this.ambientParticles) {
      p.x += p.vx * (delta / 16.67);
      p.y += p.vy * (delta / 16.67);
      // Wrap around
      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      this.ambientGfx.fillStyle(0x4466aa, p.alpha);
      this.ambientGfx.fillCircle(p.x, p.y, p.radius);
    }

    // Screen shake
    if (this._shakeTimer < this._shakeDuration) {
      this._shakeTimer += delta;
      const t = 1 - (this._shakeTimer / this._shakeDuration);
      const offsetX = (Math.random() - 0.5) * this._shakeIntensity * 2 * t;
      const offsetY = (Math.random() - 0.5) * this._shakeIntensity * 2 * t;
      this.scene.cameras.main.setScroll(offsetX, offsetY);
    } else if (this._shakeIntensity > 0) {
      this._shakeIntensity = 0;
      this.scene.cameras.main.setScroll(0, 0);
    }
  }

  // --- Cleanup ---

  destroy() {
    this.graphicsPool.forEach(g => g.destroy());
    this.textPool.forEach(t => t.destroy());
    this.ambientGfx.destroy();
    if (this.bannerBg) this.bannerBg.destroy();
    if (this.bannerText) this.bannerText.destroy();
    if (this._synergyGfx) this._synergyGfx.destroy();
    this.activeEffects = [];
  }
}
