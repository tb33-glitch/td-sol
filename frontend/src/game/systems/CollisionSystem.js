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
    // Check immunity
    if (bloon.bloonData.immunities.includes(proj.damageType) && proj.damageType !== 'normal' && proj.damageType !== 'magic') {
      return; // immune, no damage
    }

    // Apply damage
    let damage = proj.damage || 1;

    // MOAB damage multiplier
    if (bloon.bloonData.isMoab && proj.moabDamageMult) {
      damage *= proj.moabDamageMult;
    }

    bloon.hp -= damage;

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
    }

    if (bloon.hp <= 0) {
      this.scene.popBloon(bloon);
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
        if (bloon.bloonData.immunities.includes(proj.damageType) && proj.damageType !== 'normal' && proj.damageType !== 'magic') {
          continue;
        }
        bloon.hp -= proj.damage || 1;
        if (proj.stunDuration) {
          bloon.applyStun(proj.stunDuration);
        }
        if (bloon.hp <= 0) {
          this.scene.popBloon(bloon);
        }
      }
    }
  }
}
