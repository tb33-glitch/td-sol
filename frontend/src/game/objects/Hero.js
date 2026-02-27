import Phaser from 'phaser';
import { HEROES, HERO_XP_TABLE, getHeroStatMult } from '../data/heroData';
import Projectile from './Projectile';
import eventBus from '../GameEventBus';

export default class Hero extends Phaser.GameObjects.Container {
  constructor(scene, x, y, heroId) {
    super(scene, x, y);

    this.heroId = heroId;
    this.heroDef = HEROES[heroId];
    this.level = 1;
    this.xp = 0;
    this.pops = 0;

    // Runtime stats (scaled by level)
    const base = this.heroDef.baseStats;
    this.stats = {
      damage: base.damage,
      range: base.range,
      fireRate: base.fireRate,
      pierce: base.pierce,
      projectileSpeed: base.projectileSpeed,
      damageType: base.damageType,
      canDetectCamo: base.canDetectCamo,
      projTextureKey: this.heroDef.projTextureKey,
      splashRadius: 0,
      moabDamageMult: 1,
      multishot: 1,
      isHoming: false,
      isBoomerang: false,
      isSniper: false,
      stunDuration: 0,
      slowAmount: 0,
      slowDuration: 0,
      _sourceTower: this,
    };

    this.lastFireTime = 0;
    this.targetBloon = null;
    this.targetingMode = 'first';
    this.selected = false;

    // Ability state
    this.unlockedAbilities = [];
    this._diamondHandsActive = false;

    // Passive buff tracking
    this._lastPassiveTime = 0;

    // Sprite
    const textureKey = this.heroDef.textureKey;
    if (textureKey && scene.textures.exists(textureKey)) {
      this.sprite = scene.add.image(0, 0, textureKey);
      this.sprite.setDisplaySize(36, 36); // Heroes are larger
      this.add(this.sprite);
    } else {
      this.towerGraphics = scene.add.graphics();
      this.add(this.towerGraphics);
      this.drawFallback();
    }

    // Level text
    this.levelText = scene.add.text(0, -22, 'Lv1', {
      fontSize: '8px',
      fontFamily: 'monospace',
      color: '#ffcc00',
      stroke: '#000000',
      strokeThickness: 2,
    });
    this.levelText.setOrigin(0.5, 0.5);
    this.add(this.levelText);

    // Range circle
    this.rangeCircle = scene.add.graphics();
    this.add(this.rangeCircle);
    this.rangeCircle.setVisible(false);

    // Click handler
    const hitSize = 36;
    this.setSize(hitSize, hitSize);
    this.setInteractive(
      new Phaser.Geom.Rectangle(-hitSize / 2, -hitSize / 2, hitSize, hitSize),
      Phaser.Geom.Rectangle.Contains
    );
    this.on('pointerdown', () => {
      eventBus.emit('heroSelected', this);
    });

    scene.add.existing(this);
    this.setDepth(21); // Above towers
  }

  drawFallback() {
    this.towerGraphics.clear();
    const r = 16;
    this.towerGraphics.fillStyle(this.heroDef.color, 1);
    this.towerGraphics.fillCircle(0, 0, r);
    this.towerGraphics.lineStyle(3, 0xffcc00, 0.8);
    this.towerGraphics.strokeCircle(0, 0, r);
    // Star in center
    this.towerGraphics.fillStyle(0xffcc00, 0.9);
    this.towerGraphics.fillCircle(0, 0, 4);
  }

  showRange() {
    this.rangeCircle.clear();
    if (this.stats.range > 0) {
      this.rangeCircle.lineStyle(2, 0xffcc00, 0.5);
      this.rangeCircle.strokeCircle(0, 0, this.stats.range);
      this.rangeCircle.fillStyle(0xffcc00, 0.06);
      this.rangeCircle.fillCircle(0, 0, this.stats.range);
    }
    this.rangeCircle.setVisible(true);
    this.selected = true;
  }

  hideRange() {
    this.rangeCircle.setVisible(false);
    this.selected = false;
  }

  addXP(amount) {
    if (this.level >= 20) return;
    this.xp += amount;

    // Check level ups
    while (this.level < 20 && this.xp >= HERO_XP_TABLE[this.level]) {
      this.level++;
      this.onLevelUp();
    }
  }

  onLevelUp() {
    // Recalculate stats
    const mult = getHeroStatMult(this.level);
    const base = this.heroDef.baseStats;
    this.stats.damage = Math.ceil(base.damage * mult);
    this.stats.range = Math.round(base.range * mult);
    this.stats.fireRate = Math.round(base.fireRate / mult); // faster
    this.stats.pierce = Math.ceil(base.pierce * mult);

    // Update level text
    this.levelText.setText(`Lv${this.level}`);

    // Check ability unlocks
    for (const abilityDef of this.heroDef.abilities) {
      if (this.level >= abilityDef.unlockLevel &&
          !this.unlockedAbilities.find(a => a.type === abilityDef.type)) {
        this.unlockedAbilities.push(abilityDef);
        this.scene.abilitySystem.registerAbility(this, abilityDef);
      }
    }

    // Level-up visual effect
    this.scene.createFloatingText(this.x, this.y - 25, `LEVEL ${this.level}!`, '#ffcc00');

    // Brief glow
    if (this.sprite) {
      this.sprite.setTint(0xffff00);
      this.scene.time.delayedCall(500, () => {
        if (this.sprite) this.sprite.clearTint();
      });
    }

    eventBus.emit('heroLevelUp', { level: this.level, heroId: this.heroId });
  }

  applyPassive(time) {
    if (time - this._lastPassiveTime < 2000) return;
    this._lastPassiveTime = time;

    const passive = this.heroDef.passive;
    switch (passive.type) {
      case 'incomeBoost':
        // Applied in EconomySystem via hero reference
        break;
      case 'speedAura': {
        const range = passive.range || 100;
        for (const tower of this.scene.towers) {
          const dx = tower.x - this.x;
          const dy = tower.y - this.y;
          if (dx * dx + dy * dy <= range * range) {
            tower._heroSpeedBuff = passive.value;
            tower._heroSpeedBuffExpiry = this.scene.gameTime + 2500;
          }
        }
        break;
      }
      case 'doubleCash':
        // Checked in popBloon when calculating cash
        break;
      case 'globalCamoReveal':
        // Reveal all camo bloons
        for (const bloon of this.scene.bloons) {
          if (bloon.active && bloon.isCamo) {
            bloon.removeCamo();
          }
        }
        break;
    }
  }

  cycleTargeting() {
    const modes = ['first', 'last', 'strong', 'close'];
    const idx = modes.indexOf(this.targetingMode);
    this.targetingMode = modes[(idx + 1) % modes.length];
  }

  findTarget() {
    const bloons = this.scene.bloons;
    if (!bloons || bloons.length === 0) return null;

    let best = null;
    let bestValue = null;

    for (const bloon of bloons) {
      if (!bloon.active) continue;
      if (bloon.isCamo && !this.stats.canDetectCamo) continue;

      const dx = bloon.x - this.x;
      const dy = bloon.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > this.stats.range) continue;

      let value;
      switch (this.targetingMode) {
        case 'last': value = -bloon.pathProgress; break;
        case 'strong': value = bloon.hp; break;
        case 'close': value = -dist; break;
        case 'first':
        default: value = bloon.pathProgress; break;
      }

      if (bestValue === null || value > bestValue) {
        bestValue = value;
        best = bloon;
      }
    }

    return best;
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
      this.scene.vfx.muzzleFlash(this.x, this.y, angle, 0xffcc00);
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

  update(time, delta) {
    // Apply passive effects
    this.applyPassive(time);

    // Diamond Hands lock — can't retarget
    if (this._diamondHandsActive && this.targetBloon && this.targetBloon.active) {
      // Keep current target
    } else {
      this._diamondHandsActive = false;
      this.targetBloon = this.findTarget();
    }

    // Smooth rotation toward target
    if (this.targetBloon && this.targetBloon.active && this.sprite) {
      const dx = this.targetBloon.x - this.x;
      const dy = this.targetBloon.y - this.y;
      const targetAngle = Math.atan2(dy, dx);
      let diff = targetAngle - this.sprite.rotation;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      this.sprite.rotation += diff * Math.min(1, 0.15 * (delta / 16.67));
    }

    // Fire if ready
    if (this.targetBloon && time - this.lastFireTime >= this.stats.fireRate) {
      this.fire(time);
    }
  }

  getSellValue() {
    return 0; // Heroes can't be sold
  }
}
