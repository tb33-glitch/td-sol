import { TOWER_TYPES, PARAGON_DATA } from '../data/towerData';
import eventBus from '../GameEventBus';

export default class UpgradeSystem {
  constructor(scene) {
    this.scene = scene;
  }

  canParagon(towerId) {
    if (!PARAGON_DATA[towerId]) return false;
    // Need 3 tier-5 towers of this type (tier-5 on any path)
    const t5s = this.scene.towers.filter(t =>
      t.towerId === towerId &&
      !t.isParagon &&
      (t.upgradeLevels.path1 >= 5 || t.upgradeLevels.path2 >= 5 || t.upgradeLevels.path3 >= 5)
    );
    return t5s.length >= 3;
  }

  executeParagon(towerId) {
    const paragonDef = PARAGON_DATA[towerId];
    if (!paragonDef) return null;

    // Find 3 tier-5 towers
    const t5s = this.scene.towers.filter(t =>
      t.towerId === towerId &&
      !t.isParagon &&
      (t.upgradeLevels.path1 >= 5 || t.upgradeLevels.path2 >= 5 || t.upgradeLevels.path3 >= 5)
    );
    if (t5s.length < 3) return null;

    const toMerge = t5s.slice(0, 3);

    // Calculate centroid position
    const cx = toMerge.reduce((s, t) => s + t.x, 0) / 3;
    const cy = toMerge.reduce((s, t) => s + t.y, 0) / 3;

    // Remove the 3 towers
    for (const tower of toMerge) {
      const idx = this.scene.towers.indexOf(tower);
      if (idx >= 0) this.scene.towers.splice(idx, 1);
      this.scene.abilitySystem.unregisterTower(tower);
      tower.destroy();
    }

    // Create paragon tower
    const Tower = require('../objects/Tower').default;
    const paragon = new Tower(this.scene, cx, cy, towerId);
    paragon.isParagon = true;

    // Override stats with paragon stats
    for (const [key, value] of Object.entries(paragonDef.stats)) {
      paragon.stats[key] = value;
    }

    // Paragon can't be sold or upgraded further
    paragon.totalSpent = 999999;
    paragon.upgradeLevels = { path1: 5, path2: 5, path3: 5 };

    // Apply paragon passive
    paragon._paragonPassive = paragonDef.passive;
    paragon._paragonDef = paragonDef;
    paragon._shockwaveCount = 0;

    this.scene.towers.push(paragon);
    this.scene.synergySystem.checkSynergies();

    // Flash effect
    this.scene.createFloatingText(cx, cy - 20, `PARAGON: ${paragonDef.name}!`, '#ffcc00');

    eventBus.emit('paragonCreated', { towerId, name: paragonDef.name });

    return paragon;
  }

  getAvailableUpgrades(tower) {
    const towerDef = TOWER_TYPES[tower.towerId];
    if (!towerDef) return [];

    const upgrades = [];
    const paths = ['path1', 'path2', 'path3'];

    // BTD6-style: one path to 5, one to 2, third stays 0
    // Get current levels sorted descending
    const levels = paths.map(p => tower.upgradeLevels[p] || 0);

    paths.forEach((path, idx) => {
      const currentTier = tower.upgradeLevels[path] || 0;
      const pathUpgrades = towerDef.upgrades[path];

      if (currentTier < pathUpgrades.length) {
        const nextUpgrade = pathUpgrades[currentTier];
        const wouldBe = currentTier + 1;

        // Build hypothetical levels if this upgrade were applied
        const hypothetical = [...levels];
        hypothetical[idx] = wouldBe;
        hypothetical.sort((a, b) => b - a); // descending

        // Check constraint: [any, <=2, <=0]
        if (hypothetical[1] > 2 || hypothetical[2] > 0) return; // blocked

        upgrades.push({
          path,
          tier: wouldBe,
          name: nextUpgrade.name,
          cost: nextUpgrade.cost,
          effects: nextUpgrade.effects,
          ability: nextUpgrade.ability || null,
        });
      }
    });

    return upgrades;
  }

  applyUpgrade(tower, path, tier) {
    const towerDef = TOWER_TYPES[tower.towerId];
    const upgrade = towerDef.upgrades[path][tier - 1];
    if (!upgrade) return false;

    tower.upgradeLevels[path] = tier;
    tower.totalSpent += upgrade.cost;

    // Apply effects
    const effects = upgrade.effects;
    for (const [key, value] of Object.entries(effects)) {
      switch (key) {
        case 'damage':
          tower.stats.damage = value;
          break;
        case 'pierce':
          tower.stats.pierce = value;
          break;
        case 'fireRateMult':
          tower.stats.fireRate = towerDef.fireRate * value;
          break;
        case 'rangeMult':
          tower.stats.range = towerDef.range * value;
          break;
        case 'canDetectCamo':
          tower.stats.canDetectCamo = value;
          break;
        case 'splashRadius':
          tower.stats.splashRadius = value;
          break;
        case 'slowAmount':
          tower.stats.slowAmount = value;
          break;
        case 'slowDuration':
          tower.stats.slowDuration = value;
          break;
        case 'incomePerTick':
          tower.stats.incomePerTick = value;
          break;
        case 'incomeMultiplier':
          tower.stats.incomeMultiplier = value;
          break;
        case 'autoCollect':
          tower.stats.autoCollect = value;
          break;
        case 'multishot':
          tower.stats.multishot = value;
          break;
        case 'stunDuration':
          tower.stats.stunDuration = value;
          break;
        case 'moabDamageMult':
          tower.stats.moabDamageMult = value;
          break;
        case 'freezeDamage':
          tower.stats.freezeDamage = value;
          break;
        case 'damageType':
          tower.stats.damageType = value;
          break;
        case 'decamoRange':
          tower.stats.decamoRange = value;
          break;
        case 'supplyDropIncome':
          tower.stats.supplyDropIncome = value;
          break;
        case 'supplyDropInterval':
          tower.stats.supplyDropInterval = value;
          break;
        default:
          tower.stats[key] = value;
          break;
      }
    }

    // Register ability if upgrade has one
    if (upgrade.ability && this.scene.abilitySystem) {
      this.scene.abilitySystem.registerAbility(tower, upgrade.ability);
    }

    // Update visual (range circle if selected)
    if (tower.rangeCircle) {
      tower.rangeCircle.setRadius(tower.stats.range);
    }

    return true;
  }
}
