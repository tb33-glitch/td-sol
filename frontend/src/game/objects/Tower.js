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
      decamoRange: 0,
      supplyDropIncome: 0,
      supplyDropInterval: 0,
      damageType: def.damageType,
      isHoming: def.isHoming || false,
      isBoomerang: def.isBoomerang || false,
      isBuffer: def.isBuffer || false,
      isSpike: def.isSpike || false,
      buffDamageMult: def.buffDamageMult || 1,
      buffFireRateMult: def.buffFireRateMult || 1,
      buffRange: def.buffRange || 0,
    };

    // Per-tower pop count
    this.pops = 0;
    this._lastBuffTime = 0;

    this.lastFireTime = 0;
    this.lastIncomeTime = 0;
    this.targetBloon = null;
    this.selected = false;
    this.targetingMode = 'first'; // first, last, strong, close

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
      // Dashed circle (24 arc segments)
      const r = this.stats.range;
      const segments = 24;
      this.rangeCircle.lineStyle(1.5, 0xffffff, 0.4);
      for (let i = 0; i < segments; i += 2) {
        const startAngle = (i / segments) * Math.PI * 2;
        const endAngle = ((i + 1) / segments) * Math.PI * 2;
        this.rangeCircle.beginPath();
        this.rangeCircle.arc(0, 0, r, startAngle, endAngle, false);
        this.rangeCircle.strokePath();
      }
      this.rangeCircle.fillStyle(0xffffff, 0.06);
      this.rangeCircle.fillCircle(0, 0, r);
    }
    this.rangeCircle.setVisible(true);
    this.selected = true;
  }

  hideRange() {
    this.rangeCircle.setVisible(false);
    this.selected = false;
  }

  update(time, delta) {
    // Skip if disabled by boss
    if (this._disabled) return;

    if (this.stats.isGenerator) {
      this.updateGenerator(time, delta);
      // Supply drop income (for snipers with supply drop upgrade)
      return;
    }

    // Smooth rotation toward target
    if (this.targetBloon && this.targetBloon.active && this.sprite) {
      const dx = this.targetBloon.x - this.x;
      const dy = this.targetBloon.y - this.y;
      const targetAngle = Math.atan2(dy, dx);
      // Lerp rotation
      let diff = targetAngle - this.sprite.rotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.sprite.rotation += diff * Math.min(1, 0.15 * (delta / 16.67));
    }

    // Supply drop income timer
    if (this.stats.supplyDropIncome > 0 && this.stats.supplyDropInterval > 0) {
      if (!this._lastSupplyDrop) this._lastSupplyDrop = time;
      if (time - this._lastSupplyDrop >= this.stats.supplyDropInterval) {
        this._lastSupplyDrop = time;
        this.scene.economySystem.addCash(this.stats.supplyDropIncome);
      }
    }

    // Decamo aura — strip camo from bloons in range
    if (this.stats.decamoRange > 0) {
      for (const bloon of this.scene.bloons) {
        if (!bloon.active || !bloon.isCamo) continue;
        const dx = bloon.x - this.x;
        const dy = bloon.y - this.y;
        if (dx * dx + dy * dy <= this.stats.decamoRange * this.stats.decamoRange) {
          bloon.removeCamo();
        }
      }
    }

    // Buffer tower — buff nearby towers periodically
    if (this.stats.isBuffer && time - this._lastBuffTime >= 2000) {
      this._lastBuffTime = time;
      this.applyBuffs();
    }

    // Spike factory — place spike traps on the path
    if (this.stats.isSpike) {
      this.updateSpikeFactory(time);
      // Still allow aura/projectile firing if it has range
    }

    if (this.stats.range === 0 && !this.stats.isSpike) return;

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
    let bestValue = null;

    for (const bloon of bloons) {
      if (!bloon.active) continue;
      if (bloon.isCamo && !this.stats.canDetectCamo) continue;

      let dist = 0;
      if (!this.stats.isSniper) {
        const dx = bloon.x - this.x;
        const dy = bloon.y - this.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > this.stats.range) continue;
      }

      let value;
      switch (this.targetingMode) {
        case 'last':
          value = -bloon.pathProgress; // lowest progress = best
          break;
        case 'strong':
          value = bloon.hp; // highest HP = best
          break;
        case 'close':
          if (this.stats.isSniper) {
            // Snipers fallback to first for close mode
            value = bloon.pathProgress;
          } else {
            value = -dist; // nearest = best (negate so higher = closer)
          }
          break;
        case 'first':
        default:
          value = bloon.pathProgress; // highest progress = best
          break;
      }

      if (bestValue === null || value > bestValue) {
        bestValue = value;
        best = bloon;
      }
    }

    return best;
  }

  cycleTargeting() {
    const modes = ['first', 'last', 'strong', 'close'];
    const idx = modes.indexOf(this.targetingMode);
    this.targetingMode = modes[(idx + 1) % modes.length];
    eventBus.emit('targetingChanged', { tower: this, mode: this.targetingMode });
  }

  fire(time) {
    this.lastFireTime = time;
    const shots = this.stats.multishot || 1;

    // Recoil pulse
    if (this.sprite) {
      this.scene.tweens.add({
        targets: this.sprite,
        scaleX: 1.15,
        scaleY: 0.9,
        duration: 60,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    }

    // Muzzle flash
    if (this.targetBloon && this.scene.vfx) {
      const dx = this.targetBloon.x - this.x;
      const dy = this.targetBloon.y - this.y;
      const angle = Math.atan2(dy, dx);
      this.scene.vfx.muzzleFlash(this.x, this.y, angle, this.stats.projectileColor || 0xffff88);
    }

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

      const projStats = { ...this.stats, _sourceTower: this };
      const proj = new Projectile(this.scene, startX, startY, this.targetBloon, projStats);
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

  applyBuffs() {
    const buffRange = this.stats.buffRange || 80;
    for (const tower of this.scene.towers) {
      if (tower === this) continue;
      if (tower.stats.isGenerator) continue;
      const dx = tower.x - this.x;
      const dy = tower.y - this.y;
      if (dx * dx + dy * dy <= buffRange * buffRange) {
        // Apply temporary buff (refreshed every 2s)
        tower._buffedDamageMult = this.stats.buffDamageMult;
        tower._buffedFireRateMult = this.stats.buffFireRateMult;
        tower._buffExpiry = this.scene.gameTime + 2500;
      }
    }
  }

  updateSpikeFactory(time) {
    if (time - this.lastFireTime < this.stats.fireRate) return;
    this.lastFireTime = time;

    // Place a spike pile at a random point on the path
    const progress = Math.random();
    const pos = this.scene.pathSystem.getPositionAtProgress(progress);

    // Create a "spike" bloon obstacle — implemented as a special projectile
    const spikeStats = {
      ...this.stats,
      projectileSpeed: 0,
      isSniper: false,
      _sourceTower: this,
    };
    const spike = new Projectile(this.scene, pos.x, pos.y, null, spikeStats);
    spike.vx = 0;
    spike.vy = 0;
    spike.lifetime = 30000; // spikes last 30 seconds
    spike.lived = 0;
    spike.active = true;

    // Draw spike as a small circle
    if (!spike.sprite && !spike.graphics) {
      spike.graphics = this.scene.add.graphics();
      spike.add(spike.graphics);
    }
    if (spike.graphics) {
      spike.graphics.clear();
      spike.graphics.fillStyle(0xcccccc, 0.9);
      spike.graphics.fillCircle(0, 0, 4);
      spike.graphics.lineStyle(1, 0x666666, 0.8);
      // Draw spike points
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        spike.graphics.lineBetween(
          0, 0,
          Math.cos(angle) * 6, Math.sin(angle) * 6
        );
      }
    }

    this.scene.addProjectile(spike);
  }

  getSellValue() {
    return Math.floor(this.totalSpent * 0.7);
  }
}
