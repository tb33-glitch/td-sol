export default class CollisionSystem {
  constructor(scene) {
    this.scene = scene;
  }

  update() {
    const projectiles = this.scene.projectiles;
    const bloons = this.scene.bloons;

    if (!projectiles || !bloons) return;

    // Check each projectile against bloons
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const proj = projectiles[i];
      if (!proj || !proj.active) continue;

      for (let j = bloons.length - 1; j >= 0; j--) {
        const bloon = bloons[j];
        if (!bloon || !bloon.active) continue;

        // Skip if projectile has already hit this bloon
        if (proj.hitBloons && proj.hitBloons.has(bloon)) continue;

        const dx = proj.x - bloon.x;
        const dy = proj.y - bloon.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const hitDist = (proj.radius || 5) + (bloon.displayRadius || 8);

        if (dist < hitDist) {
          this.handleHit(proj, bloon);

          // Track hits for pierce
          if (!proj.hitBloons) proj.hitBloons = new Set();
          proj.hitBloons.add(bloon);

          proj.pierceRemaining = (proj.pierceRemaining ?? proj.pierce ?? 1) - 1;

          if (proj.pierceRemaining <= 0) {
            this.scene.removeProjectile(proj);
            break;
          }
        }
      }
    }
  }

  handleHit(proj, bloon) {
    // Boss shield check
    if (bloon.isBossShielded && bloon.isBossShielded()) {
      return; // boss is shielded, no damage
    }

    // Boss Rug Pull: immune to abilities (check source)
    if (bloon.bloonData.abilityImmune && proj._isAbilityProj) {
      return;
    }

    // Disabled tower check — disabled towers can't deal damage
    if (proj.sourceTower && proj.sourceTower._disabled) {
      return;
    }

    // Check immunity — normal bypasses all, magic bypasses sharp only
    if (this.isImmune(proj.damageType, bloon)) {
      return; // immune, no damage
    }

    // Apply damage
    let damage = proj.damage || 1;

    // MOAB damage multiplier
    if (bloon.bloonData.isMoab && proj.moabDamageMult) {
      damage *= proj.moabDamageMult;
    }

    bloon.hp -= damage;

    // Impact flash VFX (color-matched to damage type)
    if (this.scene.vfx) {
      const impactColor = this.getDamageColor(proj.damageType);
      this.scene.vfx.impactFlash(bloon.x, bloon.y, impactColor, 6);

      // Floating damage numbers on high-HP targets
      if (bloon.isBoss || bloon.isMoab || bloon.isCeramic) {
        const dmgColor = damage >= 5 ? '#ff4466' : '#ffaa33';
        const fontSize = damage >= 10 ? '12px' : '9px';
        this.scene.vfx.floatingText(
          bloon.x + (Math.random() - 0.5) * 12,
          bloon.y - bloon.displayRadius - 4,
          `-${Math.round(damage)}`,
          dmgColor,
          fontSize
        );
      }
    }

    // Apply stun
    if (proj.stunDuration) {
      bloon.applyStun(proj.stunDuration);
    }

    // Apply slow
    if (proj.slowAmount) {
      bloon.applySlow(proj.slowAmount, proj.slowDuration || 1000);
    }

    // Splash damage
    if (proj.splashRadius && proj.splashRadius > 0) {
      this.applySplash(proj, bloon);
      // Splash ring VFX
      if (this.scene.vfx) {
        const splashColor = this.getDamageColor(proj.damageType);
        this.scene.vfx.splashRing(bloon.x, bloon.y, proj.splashRadius, splashColor);
      }
    }

    if (bloon.hp <= 0) {
      // Credit pop to source tower
      if (proj.sourceTower && proj.sourceTower.pops !== undefined) {
        proj.sourceTower.pops++;
      }
      this.scene.popBloon(bloon);
    }
  }

  isImmune(damageType, bloon) {
    const immunities = bloon.bloonData.immunities;
    if (!immunities || immunities.length === 0) return false;
    // 'normal' damage bypasses all immunities
    if (damageType === 'normal') return false;
    // 'magic' bypasses 'sharp' immunity (lead) but NOT explosive/cold (black/white)
    if (damageType === 'magic') {
      return immunities.some(i => i !== 'sharp' && i !== 'detection' && immunities.includes(damageType));
    }
    return immunities.includes(damageType);
  }

  getDamageColor(damageType) {
    switch (damageType) {
      case 'explosive': return 0xff8844;
      case 'cold': return 0x88bbff;
      case 'magic': return 0xaa44ff;
      case 'sharp': return 0xcccccc;
      case 'normal':
      default: return 0xffffff;
    }
  }

  applySplash(proj, hitBloon) {
    const bloons = this.scene.bloons;

    for (const bloon of bloons) {
      if (!bloon.active || bloon === hitBloon) continue;

      const dx = hitBloon.x - bloon.x;
      const dy = hitBloon.y - bloon.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= proj.splashRadius) {
        if (this.isImmune(proj.damageType, bloon)) {
          continue;
        }
        let dmg = proj.damage || 1;
        if (bloon.bloonData.isMoab && proj.moabDamageMult) {
          dmg *= proj.moabDamageMult;
        }
        bloon.hp -= dmg;
        if (proj.stunDuration) {
          bloon.applyStun(proj.stunDuration);
        }
        if (bloon.hp <= 0) {
          if (proj.sourceTower && proj.sourceTower.pops !== undefined) {
            proj.sourceTower.pops++;
          }
          this.scene.popBloon(bloon);
        }
      }
    }
  }
}
