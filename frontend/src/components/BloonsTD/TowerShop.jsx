import { TOWER_TYPES } from '../../game/data/towerData';
import './BloonsTDGame.css';

const SHOP_TOWERS = ['dart', 'bomb', 'ice', 'banana', 'sniper', 'wizard'];

function colorToHex(color) {
  return '#' + color.toString(16).padStart(6, '0');
}

export default function TowerShop({
  money,
  selectTowerToPlace,
  selectedTower,
  sellSelectedTower,
  upgradeSelectedTower,
  deselectTower,
  upgradeSystem,
}) {
  return (
    <div className="td-shop">
      {!selectedTower ? (
        <>
          <div className="td-shop-title">Towers</div>
          <div className="td-shop-grid">
            {SHOP_TOWERS.map((id) => {
              const tower = TOWER_TYPES[id];
              const canAfford = money >= tower.cost;
              return (
                <button
                  key={id}
                  className={`td-shop-item ${!canAfford ? 'td-shop-disabled' : ''}`}
                  onClick={() => canAfford && selectTowerToPlace(id)}
                  title={`${tower.name} - $${tower.cost}`}
                >
                  <div
                    className="td-shop-icon"
                    style={{ backgroundColor: colorToHex(tower.color) }}
                  />
                  <div className="td-shop-name">{tower.name}</div>
                  <div className="td-shop-cost">${tower.cost}</div>
                </button>
              );
            })}
          </div>
          <div className="td-shop-hint">
            Right-click or ESC to cancel placement
          </div>
        </>
      ) : (
        <TowerInfo
          tower={selectedTower}
          money={money}
          onSell={sellSelectedTower}
          onUpgrade={upgradeSelectedTower}
          onDeselect={deselectTower}
        />
      )}
    </div>
  );
}

function TowerInfo({ tower, money, onSell, onUpgrade, onDeselect }) {
  const towerDef = TOWER_TYPES[tower.id];
  if (!towerDef) return null;

  // Calculate available upgrades
  const upgrades = getAvailableUpgrades(tower, towerDef);

  return (
    <div className="td-tower-info">
      <div className="td-tower-info-header">
        <div
          className="td-shop-icon"
          style={{ backgroundColor: colorToHex(towerDef.color) }}
        />
        <div>
          <div className="td-tower-name">{towerDef.name}</div>
          <div className="td-tower-stats">
            {tower.stats.damage > 0 && <span>DMG: {tower.stats.damage}</span>}
            {tower.stats.range > 0 && tower.stats.range < 9999 && <span>RNG: {Math.round(tower.stats.range)}</span>}
            {tower.stats.fireRate > 0 && <span>SPD: {(1000 / tower.stats.fireRate).toFixed(1)}/s</span>}
          </div>
        </div>
      </div>

      <div className="td-upgrade-paths">
        {['path1', 'path2', 'path3'].map((path, idx) => {
          const pathUpgrades = towerDef.upgrades[path];
          const currentTier = tower.upgradeLevels[path] || 0;
          const nextUpgrade = upgrades.find(u => u.path === path);

          return (
            <div key={path} className="td-upgrade-path">
              <div className="td-upgrade-path-label">Path {idx + 1}</div>
              <div className="td-upgrade-tiers">
                {pathUpgrades.map((upgrade, tier) => {
                  const isOwned = currentTier > tier;
                  const isNext = nextUpgrade && nextUpgrade.tier === tier + 1;
                  const canAfford = isNext && money >= upgrade.cost;

                  return (
                    <button
                      key={tier}
                      className={`td-upgrade-tier ${isOwned ? 'owned' : ''} ${isNext && canAfford ? 'available' : ''} ${isNext && !canAfford ? 'too-expensive' : ''}`}
                      onClick={() => isNext && canAfford && onUpgrade(path, tier + 1)}
                      disabled={!isNext || !canAfford}
                      title={`${upgrade.name} - $${upgrade.cost}`}
                    >
                      <div className="td-upgrade-name">{upgrade.name}</div>
                      {!isOwned && <div className="td-upgrade-cost">${upgrade.cost}</div>}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="td-tower-actions">
        <button className="td-btn td-sell-btn" onClick={onSell}>
          Sell (${tower.sellValue})
        </button>
        <button className="td-btn" onClick={onDeselect}>
          Close
        </button>
      </div>
    </div>
  );
}

// Simplified version of UpgradeSystem.getAvailableUpgrades for React
function getAvailableUpgrades(tower, towerDef) {
  const upgrades = [];
  const paths = ['path1', 'path2', 'path3'];

  paths.forEach((path) => {
    const currentTier = tower.upgradeLevels[path] || 0;
    const pathUpgrades = towerDef.upgrades[path];

    if (currentTier < pathUpgrades.length) {
      const nextUpgrade = pathUpgrades[currentTier];

      // Tier 3 restriction
      const otherPathHasTier3 = paths.some(
        (p) => p !== path && (tower.upgradeLevels[p] || 0) >= 3
      );
      if (currentTier === 2 && otherPathHasTier3) return;
      if (currentTier >= 1 && otherPathHasTier3) return;

      upgrades.push({
        path,
        tier: currentTier + 1,
        name: nextUpgrade.name,
        cost: nextUpgrade.cost,
      });
    }
  });

  return upgrades;
}
