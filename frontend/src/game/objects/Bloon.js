import Phaser from 'phaser';
import { BLOON_TYPES } from '../data/bloonData';

// Build reverse parent map once: child → parent type ID
const PARENT_MAP = {};
for (const [parentId, data] of Object.entries(BLOON_TYPES)) {
  if (data.children) {
    for (const childId of data.children) {
      // Only map the first parent found (prioritize the hierarchy)
      if (!PARENT_MAP[childId]) {
        PARENT_MAP[childId] = parentId;
      }
    }
  }
}

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
    this.tokenData = null;

    // Modifiers
    this.isRegrow = false;
    this.isFortified = false;
    this.originalType = typeId; // for regrow
    this.regrowTimer = 0;
    this.regrowInterval = 3000; // ms between regrow steps

    // Status effects
    this.slowAmount = 1;
    this.slowTimer = 0;
    this.stunTimer = 0;

    // Try to pick a random pit token for this tier
    let textureKey = this.bloonData.textureKey;
    const dynamicData = scene.registry.get('dynamicBloonTypes');
    if (dynamicData && dynamicData[typeId] && dynamicData[typeId].tokenPool) {
      const pool = dynamicData[typeId].tokenPool;
      const picked = pool[Math.floor(Math.random() * pool.length)];
      if (picked && scene.textures.exists(picked.textureKey)) {
        textureKey = picked.textureKey;
        this.tokenData = {
          address: picked.address,
          name: picked.name,
          symbol: picked.symbol,
        };
      }
    }

    // Sprite — use texture if available, fallback to graphics
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

    // HP bar for MOABs and ceramics
    this.isCeramic = this.bloonData.isCeramic || false;
    if (this.isMoab || this.isCeramic) {
      this.hpBar = scene.add.graphics();
      this.add(this.hpBar);
      this.drawHpBar();
    }

    // Fortified outline graphics (drawn on top if fortified)
    this.fortifiedGfx = null;

    // Boss state
    this.isBoss = this.bloonData.isBoss || false;
    if (this.isBoss) {
      this._bossShieldActive = false;
      this._bossShieldTimer = 0;
      this._bossShieldCooldown = 0;
      this._bossSpawnTimer = 0;
      this._bossCloakTimer = 0;
      this._bossDisableTimer = 0;
      this._bossHealTimer = 0;
      this._bossSplitDone = false;
      this._bossReverseDone = false;
      this._bossReversing = false;
      this._bossReverseTimer = 0;
      this._bossShieldGfx = null;
    }

    // Reverse mode support (for challenges)
    this.reverseMode = false;

    scene.add.existing(this);
    this.setDepth(this.isBoss ? 15 : 10);

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

  applyModifiers(modifiers) {
    if (!modifiers) return;
    if (modifiers.regrow) {
      this.isRegrow = true;
      this.originalType = this.typeId;
    }
    if (modifiers.fortified) {
      this.isFortified = true;
      this.hp *= 2;
      // Draw gold outline
      this.fortifiedGfx = this.scene.add.graphics();
      this.add(this.fortifiedGfx);
      this.drawFortifiedOutline();
    }
  }

  drawFortifiedOutline() {
    if (!this.fortifiedGfx) return;
    this.fortifiedGfx.clear();
    this.fortifiedGfx.lineStyle(2, 0xffcc00, 0.9);
    this.fortifiedGfx.strokeCircle(0, 0, this.displayRadius + 2);
  }

  removeCamo() {
    this.isCamo = false;
    if (this.sprite) this.sprite.setAlpha(1);
  }

  applyStun(duration) {
    this.stunTimer = Math.max(this.stunTimer, duration);
  }

  applySlow(amount, duration) {
    // Check slow immunity (BAD is immune to slow)
    if (this.bloonData.immunities && this.bloonData.immunities.includes('slow')) return;
    this.slowAmount = Math.min(this.slowAmount, amount);
    this.slowTimer = Math.max(this.slowTimer, duration);
  }

  update(delta) {
    if (!this.active) return;

    // Stun
    if (this.stunTimer > 0) {
      this.stunTimer -= delta;
      this.currentSpeed = 0;
      // Visual: yellow tint while stunned
      if (this.sprite) this.sprite.setTint(0xffff00);
      return;
    }

    // Slow
    if (this.slowTimer > 0) {
      this.slowTimer -= delta;
      this.currentSpeed = this.baseSpeed * this.slowAmount;
      // Visual: blue tint while slowed
      if (this.sprite) this.sprite.setTint(0x88bbff);
    } else {
      this.slowAmount = 1;
      this.currentSpeed = this.baseSpeed;
      // Clear tint (regrow tint handled in Phase 2)
      if (this.sprite && !this.isRegrow) this.sprite.clearTint();
      else if (this.sprite && this.isRegrow) this.sprite.setTint(0x88ff88);
    }

    // Regrow — grow back toward original type
    if (this.isRegrow && this.typeId !== this.originalType) {
      this.regrowTimer += delta;
      if (this.regrowTimer >= this.regrowInterval) {
        this.regrowTimer = 0;
        const parentType = PARENT_MAP[this.typeId];
        if (parentType) {
          // Regrow one step toward original
          this.typeId = parentType;
          this.bloonData = BLOON_TYPES[parentType];
          this.hp = this.bloonData.hp * (this.isFortified ? 2 : 1);
        }
      }
    }

    // Boss behaviors
    if (this.isBoss) {
      this.updateBoss(delta);
    }

    // Move along path
    const speedFactor = this.currentSpeed * 0.0008;
    const direction = (this.reverseMode || this._bossReversing) ? -1 : 1;
    this.pathProgress += speedFactor * (delta / 16.67) * direction;

    // Clamp reverse mode
    if (this.pathProgress < 0) this.pathProgress = 0;

    this.updatePosition();

    // Update HP bar for MOABs and ceramics
    if (this.isMoab || this.isCeramic) {
      this.drawHpBar();
    }

    // Check if reached end
    if (this.pathProgress >= 1 && !this.reverseMode) {
      this.reachedEnd();
    } else if (this.reverseMode && this.pathProgress <= 0) {
      this.reachedEnd();
    }
  }

  updateBoss(delta) {
    const data = this.bloonData;

    switch (data.bossAbility) {
      case 'shieldAndSpawn': {
        // Shield phases: immune for shieldDuration every shieldInterval
        this._bossShieldCooldown += delta;
        if (this._bossShieldActive) {
          this._bossShieldTimer += delta;
          if (this._bossShieldTimer >= data.shieldDuration) {
            this._bossShieldActive = false;
            this._bossShieldTimer = 0;
            this._bossShieldCooldown = 0;
            if (this._bossShieldGfx) this._bossShieldGfx.setVisible(false);
          }
        } else if (this._bossShieldCooldown >= data.shieldInterval) {
          this._bossShieldActive = true;
          this._bossShieldTimer = 0;
          // Show shield visual
          if (!this._bossShieldGfx) {
            this._bossShieldGfx = this.scene.add.graphics();
            this.add(this._bossShieldGfx);
          }
          this._bossShieldGfx.clear();
          this._bossShieldGfx.lineStyle(3, 0xaaaaaa, 0.8);
          this._bossShieldGfx.strokeCircle(0, 0, this.displayRadius + 6);
          this._bossShieldGfx.setVisible(true);
        }

        // Spawn minions
        this._bossSpawnTimer += delta;
        if (this._bossSpawnTimer >= data.spawnInterval) {
          this._bossSpawnTimer = 0;
          for (let i = 0; i < data.spawnCount; i++) {
            this.scene.spawnBloon(data.spawnType, this.pathProgress + (Math.random() - 0.5) * 0.01);
          }
        }
        break;
      }
      case 'crashAuraAndHeal': {
        // Slow nearby towers (handled in GameScene update via boss reference)
        // Heal periodically
        this._bossHealTimer += delta;
        if (this._bossHealTimer >= data.healInterval) {
          this._bossHealTimer = 0;
          this.hp = Math.min(this.hp + data.healAmount, data.hp);
          this.scene.createFloatingText(this.x, this.y - 20, `+${data.healAmount} HP`, '#44ff44');
        }
        break;
      }
      case 'cloakAndSplit': {
        // Cloak periodically
        this._bossCloakTimer += delta;
        if (this._bossCloakTimer >= data.cloakInterval) {
          this._bossCloakTimer = 0;
          if (!this.isCamo) {
            this.isCamo = true;
            if (this.sprite) this.sprite.setAlpha(0.3);
            this.scene.time.delayedCall(data.cloakDuration, () => {
              this.isCamo = false;
              if (this.sprite) this.sprite.setAlpha(1);
            });
          }
        }

        // Split at threshold
        if (!this._bossSplitDone && this.hp <= data.hp * data.splitThreshold) {
          this._bossSplitDone = true;
          // Spawn 2 DDTs
          this.scene.spawnBloon('ddt', this.pathProgress);
          this.scene.spawnBloon('ddt', this.pathProgress);
        }
        // Second split at 25%
        if (this._bossSplitDone && !this._bossSplit2Done && this.hp <= data.hp * 0.25) {
          this._bossSplit2Done = true;
          // Spawn mini-bosses (high HP ceramics)
          for (let i = 0; i < 2; i++) {
            const mini = this.scene.spawnBloon('ceramic', this.pathProgress);
            if (mini) {
              mini.hp = data.splitMiniBossHP;
              mini.bloonData = { ...mini.bloonData, hp: data.splitMiniBossHP };
            }
          }
        }
        break;
      }
      case 'disableAndReverse': {
        // Disable random tower
        this._bossDisableTimer += delta;
        if (this._bossDisableTimer >= data.disableInterval) {
          this._bossDisableTimer = 0;
          this.disableRandomTower(data.disableDuration);
        }

        // Reverse at 50% HP
        if (!this._bossReverseDone && this.hp <= data.hp * data.reverseThreshold) {
          this._bossReverseDone = true;
          this._bossReversing = true;
          this._bossReverseTimer = 0;
          this.scene.createFloatingText(this.x, this.y - 25, 'REVERSING!', '#ff00ff');
        }
        if (this._bossReversing) {
          this._bossReverseTimer += delta;
          if (this._bossReverseTimer >= data.reverseDuration) {
            this._bossReversing = false;
          }
        }
        break;
      }
    }
  }

  // Check if boss shield blocks damage
  isBossShielded() {
    return this.isBoss && this._bossShieldActive;
  }

  disableRandomTower(duration) {
    const towers = this.scene.towers.filter(t => !t._disabled);
    if (towers.length === 0) return;
    const target = towers[Math.floor(Math.random() * towers.length)];
    target._disabled = true;
    target._disabledTimer = duration;
    if (target.sprite) target.sprite.setTint(0x444444);
    this.scene.createFloatingText(target.x, target.y - 15, 'RUGGED!', '#ff0000');
    this.scene.time.delayedCall(duration, () => {
      target._disabled = false;
      if (target.sprite) target.sprite.clearTint();
    });
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
    if (this.fortifiedGfx) this.fortifiedGfx.destroy();
    if (this._bossShieldGfx) this._bossShieldGfx.destroy();
    super.destroy();
  }
}
