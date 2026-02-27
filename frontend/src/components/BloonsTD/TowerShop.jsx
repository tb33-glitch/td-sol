import { useRef, useEffect, useState } from 'react';
import { TOWER_TYPES } from '../../game/data/towerData';
import { TOWER_TEXTURES } from '../../game/sprites/SpriteRenderer';
import './BloonsTDGame.css';

const SHOP_TOWERS = ['dart', 'bomb', 'ice', 'banana', 'sniper', 'wizard', 'mev', 'flipper', 'alchemist', 'spikefactory'];

function colorToHex(color) {
  return '#' + color.toString(16).padStart(6, '0');
}

// Extract sprite from Phaser texture manager as a data URL
function useSpriteDataUrls(gameRef) {
  const [urls, setUrls] = useState({});

  useEffect(() => {
    // Try to extract textures once game is ready
    const tryExtract = () => {
      if (!gameRef?.current?.textures) return false;
      const textures = gameRef.current.textures;
      const result = {};
      for (const [towerId, textureKey] of Object.entries(TOWER_TEXTURES)) {
        if (textures.exists(textureKey)) {
          try {
            const source = textures.get(textureKey).getSourceImage();
            if (source instanceof HTMLCanvasElement) {
              result[towerId] = source.toDataURL();
            }
          } catch { /* skip */ }
        }
      }
      if (Object.keys(result).length > 0) {
        setUrls(result);
        return true;
      }
      return false;
    };

    if (tryExtract()) return;
    // Retry after a short delay if textures aren't ready yet
    const timer = setTimeout(tryExtract, 500);
    return () => clearTimeout(timer);
  }, [gameRef?.current]);

  return urls;
}

export default function TowerShop({
  money,
  selectTowerToPlace,
  selectedTower,
  sellSelectedTower,
  upgradeSelectedTower,
  deselectTower,
  cycleTargeting,
  gameRef,
  activeSynergies = [],
}) {
  const spriteUrls = useSpriteDataUrls(gameRef);

  return (
    <div className="td-shop">
      {!selectedTower ? (
        <>
          <div className="td-shop-title">Deploy Punks</div>
          <div className="td-shop-grid">
            {SHOP_TOWERS.map((id) => {
              const tower = TOWER_TYPES[id];
              const canAfford = money >= tower.cost;
              const spriteUrl = spriteUrls[id];
              return (
                <button
                  key={id}
                  className={`td-shop-item ${!canAfford ? 'td-shop-disabled' : ''}`}
                  onClick={() => canAfford && selectTowerToPlace(id)}
                  title={tower.description}
                >
                  {spriteUrl ? (
                    <img src={spriteUrl} className="td-shop-sprite" alt={tower.name} />
                  ) : (
                    <div
                      className="td-shop-icon"
                      style={{ backgroundColor: colorToHex(tower.color) }}
                    />
                  )}
                  <div className="td-shop-info">
                    <div className="td-shop-name">{tower.name}</div>
                    <div className="td-shop-desc">{tower.description}</div>
                  </div>
                  <div className="td-shop-cost">${tower.cost}</div>
                </button>
              );
            })}
          </div>
          <div className="td-shop-hint">
            Right-click / ESC to cancel
          </div>
        </>
      ) : (
        <TowerInfo
          tower={selectedTower}
          money={money}
          onSell={sellSelectedTower}
          onUpgrade={upgradeSelectedTower}
          onDeselect={deselectTower}
          onCycleTargeting={cycleTargeting}
          spriteUrls={spriteUrls}
        />
      )}
    </div>
  );
}

function TowerInfo({ tower, money, onSell, onUpgrade, onDeselect, onCycleTargeting, spriteUrls }) {
  const towerDef = TOWER_TYPES[tower.id];
  if (!towerDef) return null;

  const upgrades = getAvailableUpgrades(tower, towerDef);
  const spriteUrl = spriteUrls && spriteUrls[tower.id];

  return (
    <div className="td-tower-info">
      <div className="td-tower-info-header">
        {spriteUrl ? (
          <img src={spriteUrl} className="td-shop-sprite" alt={towerDef.name} />
        ) : (
          <div
            className="td-shop-icon"
            style={{ backgroundColor: colorToHex(towerDef.color) }}
          />
        )}
        <div>
          <div className="td-tower-name">{towerDef.name}</div>
          <div className="td-tower-desc">{towerDef.description}</div>
          <div className="td-tower-stats">
            {tower.stats.damage > 0 && <span>DMG {tower.stats.damage}</span>}
            {tower.stats.range > 0 && tower.stats.range < 9999 && <span>RNG {Math.round(tower.stats.range)}</span>}
            {tower.stats.range >= 9999 && <span>RNG INF</span>}
            {tower.stats.fireRate > 0 && <span>SPD {(1000 / tower.stats.fireRate).toFixed(1)}/s</span>}
          </div>
          {!tower.stats.isGenerator && (
            <button
              className="td-btn td-target-btn"
              onClick={onCycleTargeting}
              title="Cycle targeting mode (Tab)"
            >
              Target: {(tower.targetingMode || 'first').toUpperCase()}
            </button>
          )}
          {tower.pops > 0 && (
            <div className="td-tower-pops">Pops: {tower.pops}</div>
          )}
        </div>
      </div>

      <div className="td-upgrade-paths">
        {['path1', 'path2', 'path3'].map((path, idx) => {
          const pathUpgrades = towerDef.upgrades[path];
          const currentTier = tower.upgradeLevels[path] || 0;
          const nextUpgrade = upgrades.find(u => u.path === path);

          return (
            <div key={path} className="td-upgrade-path">
              <div className="td-upgrade-path-label">
                Path {idx + 1}
                <span className="td-upgrade-pips">
                  {pathUpgrades.map((_, t) => (
                    <span key={t} className={`td-pip ${currentTier > t ? 'td-pip-filled' : ''}`} />
                  ))}
                </span>
              </div>
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
                      title={`${upgrade.name} — $${upgrade.cost}`}
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

      {/* Synergy display */}
      {tower._synergies && tower._synergies.length > 0 && (
        <div className="td-synergy-list">
          {tower._synergies.map((syn, i) => (
            <div key={i} className="td-synergy-badge">
              Synergy: {syn.name} — {syn.description}
            </div>
          ))}
        </div>
      )}

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

function getAvailableUpgrades(tower, towerDef) {
  const upgrades = [];
  const paths = ['path1', 'path2', 'path3'];
  const levels = paths.map(p => tower.upgradeLevels[p] || 0);

  paths.forEach((path, idx) => {
    const currentTier = tower.upgradeLevels[path] || 0;
    const pathUpgrades = towerDef.upgrades[path];

    if (currentTier < pathUpgrades.length) {
      const nextUpgrade = pathUpgrades[currentTier];
      const wouldBe = currentTier + 1;

      // BTD6-style: [any, <=2, <=0]
      const hypothetical = [...levels];
      hypothetical[idx] = wouldBe;
      hypothetical.sort((a, b) => b - a);
      if (hypothetical[1] > 2 || hypothetical[2] > 0) return;

      upgrades.push({
        path,
        tier: wouldBe,
        name: nextUpgrade.name,
        cost: nextUpgrade.cost,
      });
    }
  });

  return upgrades;
}
