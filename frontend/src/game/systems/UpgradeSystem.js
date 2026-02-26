import { TOWER_TYPES } from '../data/towerData';

export default class UpgradeSystem {
  constructor(scene) {
    this.scene = scene;
  }

  getAvailableUpgrades(tower) {
    const towerDef = TOWER_TYPES[tower.towerId];
    if (!towerDef) return [];

    const upgrades = [];
    const paths = ['path1', 'path2', 'path3'];
    const maxTierOnOtherPath = this.getMaxTierOnOtherPaths(tower);

    paths.forEach((path) => {
      const currentTier = tower.upgradeLevels[path] || 0;
      const pathUpgrades = towerDef.upgrades[path];

      if (currentTier < pathUpgrades.length) {
        const nextUpgrade = pathUpgrades[currentTier];

        // Check tier 3 restriction: only one path can reach tier 3
        const wouldBeTier3 = currentTier === 2; // 0-indexed, so tier index 2 = tier 3
        const otherPathHasTier3 = paths.some(p =>
          p !== path && (tower.upgradeLevels[p] || 0) >= 3
        );

        if (wouldBeTier3 && otherPathHasTier3) return; // blocked

        // Also can't upgrade a path beyond tier 1 if another path is already at tier 3
        if (currentTier >= 1 && maxTierOnOtherPath >= 3) {
          // Check if this path already started (has at least 1 tier)
          // If another path is tier 3, this path can only go to tier 1
          const pathsAtTier3 = paths.filter(p =>
            p !== path && (tower.upgradeLevels[p] || 0) >= 3
          );
          if (pathsAtTier3.length > 0 && currentTier >= 1) return;
        }

        upgrades.push({
          path,
          tier: currentTier + 1,
          name: nextUpgrade.name,
          cost: nextUpgrade.cost,
          effects: nextUpgrade.effects,
        });
      }
    });

    return upgrades;
  }

  getMaxTierOnOtherPaths(tower) {
    const paths = ['path1', 'path2', 'path3'];
    return Math.max(0, ...paths.map(p => tower.upgradeLevels[p] || 0));
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
        default:
          tower.stats[key] = value;
          break;
      }
    }

    // Update visual (range circle if selected)
    if (tower.rangeCircle) {
      tower.rangeCircle.setRadius(tower.stats.range);
    }

    return true;
  }
}
