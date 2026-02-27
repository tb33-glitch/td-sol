import Projectile from '../objects/Projectile';
import eventBus from '../GameEventBus';

export default class AbilitySystem {
  constructor(scene) {
    this.scene = scene;
    this.abilities = new Map(); // tower → { name, cooldown, remaining, type, ...params }
  }

  registerAbility(tower, abilityDef) {
    this.abilities.set(tower, {
      name: abilityDef.name,
      cooldown: abilityDef.cooldown,
      remaining: 0, // ready immediately
      type: abilityDef.type,
      damage: abilityDef.damage || 0,
      amount: abilityDef.amount || 0,
      duration: abilityDef.duration || 0,
    });
    this.emitState();
  }

  unregisterTower(tower) {
    this.abilities.delete(tower);
    this.emitState();
  }

  update(delta) {
    for (const [tower, ability] of this.abilities) {
      if (ability.remaining > 0) {
        ability.remaining = Math.max(0, ability.remaining - delta);
      }
    }
  }

  activate(tower) {
    const ability = this.abilities.get(tower);
    if (!ability || ability.remaining > 0) return false;

    ability.remaining = ability.cooldown;

    switch (ability.type) {
      case 'assassinate': {
        // Deal massive damage to strongest MOAB
        const moabs = this.scene.bloons
          .filter(b => b.active && b.isMoab)
          .sort((a, b) => b.hp - a.hp);
        if (moabs.length > 0) {
          moabs[0].hp -= ability.damage;
          this.scene.createFloatingText(moabs[0].x, moabs[0].y - 15, `-${ability.damage}`, '#ff4444');
          if (moabs[0].hp <= 0) {
            this.scene.popBloon(moabs[0]);
          }
        }
        break;
      }
      case 'freezeAll': {
        // Freeze all bloons for duration
        for (const bloon of this.scene.bloons) {
          if (!bloon.active) continue;
          if (bloon.bloonData.immunities && bloon.bloonData.immunities.includes('freeze')) continue;
          bloon.applyStun(ability.duration);
        }
        break;
      }
      case 'cashDrop': {
        // Instant cash
        this.scene.economySystem.addCash(ability.amount);
        this.scene.createFloatingText(tower.x, tower.y - 15, `+$${ability.amount}`, '#44ff44');
        break;
      }
      case 'oneShot': {
        // Instakill strongest non-MOAB, or deal 9999 to MOAB
        const targets = this.scene.bloons
          .filter(b => b.active)
          .sort((a, b) => b.hp - a.hp);
        if (targets.length > 0) {
          const target = targets[0];
          if (target.isMoab) {
            target.hp -= 9999;
          } else {
            target.hp = 0;
          }
          this.scene.createFloatingText(target.x, target.y - 15, 'ONE SHOT', '#ff0000');
          if (target.hp <= 0) {
            this.scene.popBloon(target);
          }
        }
        break;
      }

      // ===== HERO ABILITIES =====
      case 'hashPower': {
        // 2x attack speed for all towers for duration
        const dur = ability.duration;
        for (const t of this.scene.towers) {
          t._hashPowerBuff = true;
          t._hashPowerExpiry = this.scene.gameTime + dur;
        }
        if (this.scene.hero) {
          this.scene.hero._hashPowerBuff = true;
          this.scene.hero._hashPowerExpiry = this.scene.gameTime + dur;
        }
        this.scene.createFloatingText(tower.x, tower.y - 20, 'HASH POWER!', '#f7931a');
        break;
      }
      case 'genesisBlock': {
        // All towers +1 dmg for duration
        const dur2 = ability.duration;
        for (const t of this.scene.towers) {
          t._genesisBlockBuff = true;
          t._genesisBlockExpiry = this.scene.gameTime + dur2;
          t.stats.damage += 1;
        }
        this.scene.createFloatingText(tower.x, tower.y - 20, 'GENESIS BLOCK!', '#ffcc00');
        // Schedule removal
        this.scene.time.delayedCall(dur2 / this.scene.gameSpeed, () => {
          for (const t of this.scene.towers) {
            if (t._genesisBlockBuff) {
              t.stats.damage = Math.max(0, t.stats.damage - 1);
              t._genesisBlockBuff = false;
            }
          }
        });
        break;
      }
      case 'yolo': {
        // Throw projectiles in all directions
        const count = ability.projectileCount || 20;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * Math.PI * 2;
          const projStats = { ...tower.stats, _sourceTower: tower };
          const proj = new Projectile(
            this.scene, tower.x, tower.y, null, projStats
          );
          proj.vx = Math.cos(angle) * projStats.projectileSpeed;
          proj.vy = Math.sin(angle) * projStats.projectileSpeed;
          this.scene.addProjectile(proj);
        }
        this.scene.createFloatingText(tower.x, tower.y - 20, 'YOLO!', '#8b4513');
        break;
      }
      case 'diamondHands': {
        // 3x dmg for duration but can't retarget
        const dur3 = ability.duration;
        const mult = ability.damageMult || 3;
        tower._diamondHandsActive = true;
        tower._diamondHandsOrigDmg = tower.stats.damage;
        tower.stats.damage *= mult;
        this.scene.createFloatingText(tower.x, tower.y - 20, 'DIAMOND HANDS!', '#00ccff');
        this.scene.time.delayedCall(dur3 / this.scene.gameSpeed, () => {
          tower._diamondHandsActive = false;
          tower.stats.damage = tower._diamondHandsOrigDmg || tower.stats.damage;
        });
        break;
      }
      case 'marketDump': {
        // Slow ALL bloons 50% for duration
        const dur4 = ability.duration;
        const slow = ability.slowAmount || 0.5;
        for (const bloon of this.scene.bloons) {
          if (bloon.active) bloon.applySlow(slow, dur4);
        }
        this.scene.createFloatingText(tower.x, tower.y - 20, 'MARKET DUMP!', '#4488cc');
        break;
      }
      case 'liquidation': {
        // Deal % max HP to all MOABs
        const pct = ability.hpPercent || 0.1;
        for (const bloon of this.scene.bloons) {
          if (!bloon.active || !bloon.isMoab) continue;
          const dmg = Math.ceil(bloon.bloonData.hp * pct);
          bloon.hp -= dmg;
          this.scene.createFloatingText(bloon.x, bloon.y - 15, `-${dmg}`, '#ff4444');
          if (bloon.hp <= 0) this.scene.popBloon(bloon);
        }
        this.scene.createFloatingText(tower.x, tower.y - 20, 'LIQUIDATION!', '#ff0000');
        break;
      }
      case 'auditTrail': {
        // Strip regrow+fortified from all bloons in range
        const range = tower.stats.range || 200;
        for (const bloon of this.scene.bloons) {
          if (!bloon.active) continue;
          const dx = bloon.x - tower.x;
          const dy = bloon.y - tower.y;
          if (dx * dx + dy * dy <= range * range) {
            bloon.isRegrow = false;
            if (bloon.isFortified) {
              bloon.isFortified = false;
              bloon.hp = Math.ceil(bloon.hp / 2);
              if (bloon.fortifiedGfx) {
                bloon.fortifiedGfx.clear();
              }
            }
            if (bloon.isCamo) bloon.removeCamo();
          }
        }
        this.scene.createFloatingText(tower.x, tower.y - 20, 'AUDIT TRAIL!', '#aa3366');
        break;
      }
      case 'exitScam': {
        // Teleport strongest bloon back to 0% path progress
        const sorted = this.scene.bloons
          .filter(b => b.active)
          .sort((a, b) => b.hp - a.hp);
        if (sorted.length > 0) {
          sorted[0].pathProgress = 0;
          sorted[0].updatePosition();
          this.scene.createFloatingText(sorted[0].x, sorted[0].y - 15, 'EXIT SCAM!', '#ff00ff');
        }
        break;
      }
    }

    this.emitState();
    return true;
  }

  getAbilities() {
    const result = [];
    for (const [tower, ability] of this.abilities) {
      result.push({
        towerId: tower.towerId,
        towerX: tower.x,
        towerY: tower.y,
        name: ability.name,
        cooldown: ability.cooldown,
        remaining: ability.remaining,
        ready: ability.remaining <= 0,
        _towerRef: tower,
      });
    }
    return result;
  }

  emitState() {
    eventBus.emit('abilitiesChanged', this.getAbilities());
  }
}
