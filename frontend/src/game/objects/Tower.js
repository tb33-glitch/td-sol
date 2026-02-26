import Phaser from 'phaser';
import { TOWER_TYPES } from '../data/towerData';
import Projectile from './Projectile';
import eventBus from '../GameEventBus';

export default class Tower extends Phaser.GameObjects.Container {
  constructor(scene, x, y, towerId) {
    super(scene, x, y);

    this.towerId = towerId;
    const def = TOWER_TYPES[towerId];
    this.baseCost = def.cost;
    this.totalSpent = def.cost;
    this.upgradeLevels = { path1: 0, path2: 0, path3: 0 };

    // Runtime stats (modified by upgrades)
    this.stats = {
      range: def.range,
      fireRate: def.fireRate,
      damage: def.damage,
      pierce: def.pierce,
      projectileSpeed: def.projectileSpeed,
      projectileColor: def.projectileColor,
      damageType: def.damageType,
      canDetectCamo: def.canDetectCamo,
      splashRadius: def.splashRadius || 0,
      isAura: def.isAura || false,
      isGenerator: def.isGenerator || false,
      isSniper: def.isSniper || false,
      slowAmount: def.slowAmount || 0,
      slowDuration: def.slowDuration || 0,
      incomePerTick: def.incomePerTick || 0,
      incomeMultiplier: 1,
      autoCollect: false,
      multishot: 1,
      stunDuration: 0,
      moabDamageMult: 1,
      freezeDamage: 0,
      projTextureKey: def.projTextureKey || null,
    };

    this.lastFireTime = 0;
    this.lastIncomeTime = 0;
    this.targetBloon = null;
    this.selected = false;

    // Sprite — use texture if available, fallback to graphics
    const textureKey = def.textureKey;
    if (textureKey && scene.textures.exists(textureKey)) {
      this.sprite = scene.add.image(0, 0, textureKey);
      this.sprite.setDisplaySize(def.radius * 2.2, def.radius * 2.2);
      this.add(this.sprite);
    } else {
      this.towerGraphics = scene.add.graphics();
      this.add(this.towerGraphics);
      this.drawFallback(def);
    }

    // Range circle (hidden unless selected)
    this.rangeCircle = scene.add.graphics();
    this.add(this.rangeCircle);
    this.rangeCircle.setVisible(false);

    // Click handler — Container needs explicit hit area
    const hitSize = def.radius * 2.5;
    this.setSize(hitSize, hitSize);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-hitSize / 2, -hitSize / 2, hitSize, hitSize),
      Phaser.Geom.Rectangle.Contains
    );
    this.on('pointerdown', () => {
      eventBus.emit('towerSelected', this);
    });

    scene.add.existing(this);
    this.setDepth(20);
  }

  drawFallback(def) {
    this.towerGraphics.clear();
    const r = def.radius;
    this.towerGraphics.fillStyle(def.color, 1);
    this.towerGraphics.fillCircle(0, 0, r);
    this.towerGraphics.lineStyle(2, 0xffffff, 0.6);
    this.towerGraphics.strokeCircle(0, 0, r);
  }

  showRange() {
    this.rangeCircle.clear();
    if (this.stats.range > 0 && this.stats.range < 9999) {
      this.rangeCircle.lineStyle(2, 0xffffff, 0.4);
      this.rangeCircle.strokeCircle(0, 0, this.stats.range);
      this.rangeCircle.fillStyle(0xffffff, 0.08);
      this.rangeCircle.fillCircle(0, 0, this.stats.range);
    }
    this.rangeCircle.setVisible(true);
    this.selected = true;
  }

  hideRange() {
    this.rangeCircle.setVisible(false);
    this.selected = false;
  }

  update(time, delta) {
    if (this.stats.isGenerator) {
      this.updateGenerator(time, delta);
      return;
    }

    if (this.stats.range === 0) return;

    // Aura towers (Wojak) don't fire projectiles
    if (this.stats.isAura) {
      if (time - this.lastFireTime >= this.stats.fireRate) {
        this.applyAura(time);
      }
      return;
    }

    // Find target
    this.targetBloon = this.findTarget();

    // Fire if ready
    if (this.targetBloon && time - this.lastFireTime >= this.stats.fireRate) {
      this.fire(time);
    }
  }

  findTarget() {
    const bloons = this.scene.bloons;
    if (!bloons || bloons.length === 0) return null;

    let best = null;
    let bestProgress = -1;

    for (const bloon of bloons) {
      if (!bloon.active) continue;
      if (bloon.isCamo && !this.stats.canDetectCamo) continue;

      if (!this.stats.isSniper) {
        const dx = bloon.x - this.x;
        const dy = bloon.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > this.stats.range) continue;
      }

      if (bloon.pathProgress > bestProgress) {
        bestProgress = bloon.pathProgress;
        best = bloon;
      }
    }

    return best;
  }

  fire(time) {
    this.lastFireTime = time;
    const shots = this.stats.multishot || 1;

    for (let i = 0; i < shots; i++) {
      const angle = shots > 1
        ? (i / (shots - 1) - 0.5) * 0.4
        : 0;

      let startX = this.x;
      let startY = this.y;
      if (shots > 1 && this.targetBloon) {
        const dx = this.targetBloon.x - this.x;
        const dy = this.targetBloon.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
          const perpX = -dy / dist;
          const perpY = dx / dist;
          startX += perpX * angle * 30;
          startY += perpY * angle * 30;
        }
      }

      const proj = new Projectile(this.scene, startX, startY, this.targetBloon, this.stats);
      this.scene.addProjectile(proj);
    }
  }

  applyAura(time) {
    this.lastFireTime = time;
    const bloons = this.scene.bloons;

    for (const bloon of bloons) {
      if (!bloon.active) continue;
      if (bloon.isCamo && !this.stats.canDetectCamo) continue;

      const dx = bloon.x - this.x;
      const dy = bloon.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= this.stats.range) {
        bloon.applySlow(this.stats.slowAmount, this.stats.slowDuration);

        if (this.stats.freezeDamage > 0) {
          bloon.hp -= this.stats.freezeDamage;
          if (bloon.hp <= 0) {
            this.scene.popBloon(bloon);
          }
        }
      }
    }
  }

  updateGenerator(time) {
    if (time - this.lastIncomeTime >= this.stats.fireRate) {
      this.lastIncomeTime = time;
      const income = Math.floor(this.stats.incomePerTick * this.stats.incomeMultiplier);
      this.scene.economySystem.addCash(income);

      // Visual feedback — bounce
      this.scene.tweens.add({
        targets: this,
        scaleX: 1.1,
        scaleY: 1.1,
        duration: 100,
        yoyo: true,
      });
    }
  }

  getSellValue() {
    return Math.floor(this.totalSpent * 0.7);
  }
}
