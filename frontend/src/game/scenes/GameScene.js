import Phaser from 'phaser';
import PathSystem from '../systems/PathSystem';
import WaveSystem from '../systems/WaveSystem';
import EconomySystem from '../systems/EconomySystem';
import TowerPlacementSystem from '../systems/TowerPlacementSystem';
import UpgradeSystem from '../systems/UpgradeSystem';
import CollisionSystem from '../systems/CollisionSystem';
import AbilitySystem from '../systems/AbilitySystem';
import SynergySystem from '../systems/SynergySystem';
import MarketEventSystem from '../systems/MarketEventSystem';
import Tower from '../objects/Tower';
import Bloon from '../objects/Bloon';
import Hero from '../objects/Hero';
import { TOWER_TYPES } from '../data/towerData';
import { HEROES } from '../data/heroData';
import { BLOON_TYPES, POP_CASH, createDynamicBloonTypes } from '../data/bloonData';
import { CHALLENGES } from '../data/challengeData';
import { STARTING_LIVES, DIFFICULTIES } from '../data/waveData';
import { MAPS } from '../data/mapData';
import PopTracker from '../systems/PopTracker';
import eventBus from '../GameEventBus';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const mapId = this.registry.get('mapId') || 'meadow';
    const difficultyId = this.registry.get('difficulty') || 'medium';
    const difficulty = DIFFICULTIES[difficultyId] || DIFFICULTIES.medium;

    // Game state
    this.lives = difficulty.lives;
    this.towers = [];
    this.bloons = [];
    this.projectiles = [];
    this.totalPops = 0;
    this.gameOver = false;
    this.gameSpeed = 1;
    this.gameTime = 0; // accumulated game time (affected by speed)
    this.selectedTower = null;
    this.isPaused = false;
    this.hero = null;
    this.heroId = this.registry.get('heroId') || null;

    // Challenge mode
    const challengeId = this.registry.get('challenge');
    this.challengeRules = challengeId && CHALLENGES[challengeId] ? CHALLENGES[challengeId].rules : null;
    this.challengeId = challengeId || null;
    this._onePathLocks = {}; // for onePath challenge: { towerType: 'path1' }

    // Systems
    this.pathSystem = new PathSystem(this, mapId);
    this.pathSystem.init();

    this.waveSystem = new WaveSystem(this);
    this.waveSystem.hpMult = difficulty.hpMult;
    const startCash = (this.challengeRules && this.challengeRules.startingCash) || difficulty.cash;
    this.economySystem = new EconomySystem(this, startCash);
    this.economySystem.cashMult = difficulty.cashMult;
    this.towerPlacementSystem = new TowerPlacementSystem(this);
    this.towerPlacementSystem.init();
    this.upgradeSystem = new UpgradeSystem(this);
    this.collisionSystem = new CollisionSystem(this);
    this.abilitySystem = new AbilitySystem(this);
    this.synergySystem = new SynergySystem(this);
    this.marketEventSystem = new MarketEventSystem(this);
    this.popTracker = new PopTracker();

    // Event modifiers (set by MarketEventSystem)
    this._eventSpeedMult = 1;
    this._eventFireRateMult = 1;
    this._eventHPMult = 1;
    this._eventPopIncomeMult = 1;
    this._eventWaveBonusMult = 1;
    this._eventRugAlert = false;

    // Initialize dynamic bloon types from pit data (if loaded)
    const pitBloonData = this.registry.get('pitBloonData');
    if (pitBloonData) {
      const dynamicTypes = createDynamicBloonTypes(pitBloonData);
      if (dynamicTypes) {
        this.registry.set('dynamicBloonTypes', dynamicTypes);
      }
    }

    // Draw map background
    this.drawMap(mapId);

    // Apply challenge overrides
    if (this.challengeRules) {
      if (this.challengeRules.lockedSpeed) {
        this.gameSpeed = this.challengeRules.lockedSpeed;
      }
    }

    // Emit initial state
    eventBus.emit('moneyChanged', this.economySystem.cash);
    eventBus.emit('livesChanged', this.lives);
    eventBus.emit('waveInfo', { wave: 0, total: this.waveSystem.totalWaves });

    // Listen for React events
    this.eventUnsubs = [];
    this.eventUnsubs.push(
      eventBus.on('startWave', () => this.waveSystem.startWave()),
      eventBus.on('toggleSpeed', () => this.toggleSpeed()),
      eventBus.on('sellTower', (tower) => this.sellTower(tower)),
      eventBus.on('upgradeTower', ({ tower, path, tier }) => this.doUpgrade(tower, path, tier)),
      eventBus.on('deselectTower', () => this.deselectTower()),
      eventBus.on('togglePause', () => {
        if (this.challengeRules && this.challengeRules.canPause === false) return;
        this.isPaused = !this.isPaused;
        eventBus.emit('pauseChanged', this.isPaused);
      }),
      eventBus.on('cycleTargeting', () => {
        if (this.selectedTower) {
          this.selectedTower.cycleTargeting();
          eventBus.emit('towerSelected', this.selectedTower);
        }
      }),
      eventBus.on('activateAbility', (towerRef) => {
        this.abilitySystem.activate(towerRef);
      }),
      eventBus.on('placeHero', ({ heroId, x, y }) => {
        this.placeHero(heroId, x, y);
      }),
      eventBus.on('mergeParagon', (towerId) => {
        const paragon = this.upgradeSystem.executeParagon(towerId);
        if (paragon) {
          eventBus.emit('towerDeselected');
        }
      }),
      eventBus.on('heroSelected', (hero) => {
        this.deselectTower();
        this.selectedTower = hero;
        hero.showRange();
        eventBus.emit('towerSelected', hero);
      }),
    );

    // Auto-place hero if one was selected in lobby
    if (this.heroId && HEROES[this.heroId]) {
      // Place hero at center of map initially — player can reposition via drag later
      const { width, height } = this.scale;
      this.placeHero(this.heroId, width / 2, height / 2);
    }

    // Right-click to cancel placement or deselect
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.towerPlacementSystem.cancelPlacing();
        this.deselectTower();
      }
    });

    // Keyboard shortcuts
    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.waveSystem.waveActive || this.waveSystem.spawning) return;
      this.waveSystem.startWave();
    });
    this.input.keyboard.on('keydown-ESC', () => {
      this.towerPlacementSystem.cancelPlacing();
      this.deselectTower();
    });
    // Tower hotkeys 1-9, 0
    const towerIds = ['dart', 'bomb', 'ice', 'banana', 'sniper', 'wizard', 'mev', 'flipper', 'alchemist', 'spikefactory'];
    for (let i = 0; i < towerIds.length; i++) {
      const keyName = i === 9 ? 'ZERO' : `${i + 1}`;
      this.input.keyboard.on(`keydown-${keyName === '1' ? 'ONE' : keyName === '2' ? 'TWO' : keyName === '3' ? 'THREE' : keyName === '4' ? 'FOUR' : keyName === '5' ? 'FIVE' : keyName === '6' ? 'SIX' : keyName === '7' ? 'SEVEN' : keyName === '8' ? 'EIGHT' : keyName === '9' ? 'NINE' : 'ZERO'}`, () => {
        eventBus.emit('selectTowerToPlace', towerIds[i]);
      });
    }

    this.input.keyboard.on('keydown-TAB', (e) => {
      e.preventDefault();
      if (this.selectedTower) {
        this.selectedTower.cycleTargeting();
        // Re-emit selection to refresh UI
        eventBus.emit('towerSelected', this.selectedTower);
      }
    });
  }

  drawMap(mapId) {
    const map = MAPS[mapId];
    const { width, height } = this.scale;

    // Background
    const bg = this.add.graphics();
    bg.fillStyle(map.backgroundColor, 1);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(0);

    // Path
    const pathGfx = this.add.graphics();
    pathGfx.setDepth(1);
    this.pathSystem.drawPath(pathGfx);
  }

  getTowerData(towerId) {
    return TOWER_TYPES[towerId];
  }

  placeTower(towerId, x, y) {
    // Challenge: allowed/banned tower checks
    if (this.challengeRules) {
      if (this.challengeRules.allowedTowers && !this.challengeRules.allowedTowers.includes(towerId)) return;
      if (this.challengeRules.bannedTowers && this.challengeRules.bannedTowers.includes(towerId)) return;
      // Random towers challenge
      if (this.challengeRules.randomTowers) {
        const allTowerIds = Object.keys(TOWER_TYPES);
        towerId = allTowerIds[Math.floor(Math.random() * allTowerIds.length)];
      }
    }

    // Cost multiplier from market events
    const def = TOWER_TYPES[towerId];
    const cost = Math.ceil(def.cost * this.economySystem.costMultiplier);
    if (!this.economySystem.canAfford(cost)) return;

    const tower = new Tower(this, x, y, towerId);
    this.towers.push(tower);
    eventBus.emit('towerPlaced', { towerId, x, y, count: this.towers.length });
    this.synergySystem.checkSynergies();
  }

  placeHero(heroId, x, y) {
    if (this.hero) return; // Only 1 hero per game
    this.hero = new Hero(this, x, y, heroId);
    eventBus.emit('heroPlaced', { heroId, x, y });
  }

  sellTower(tower) {
    if (!tower) return;
    // Challenge: HODL — can't sell
    if (this.challengeRules && this.challengeRules.canSell === false) return;
    const value = this.economySystem.getSellValue(tower);
    this.economySystem.addCash(value);

    const idx = this.towers.indexOf(tower);
    if (idx >= 0) this.towers.splice(idx, 1);

    this.abilitySystem.unregisterTower(tower);
    tower.hideRange();
    tower.destroy();

    this.deselectTower();
    eventBus.emit('towerSold', { value });
    this.synergySystem.checkSynergies();
  }

  doUpgrade(tower, path, tier) {
    // Challenge: No Upgrades
    if (this.challengeRules && this.challengeRules.canUpgrade === false) return;

    // Challenge: One Path — lock tower type to first upgraded path
    if (this.challengeRules && this.challengeRules.onePathPerType) {
      const lockKey = tower.towerId;
      if (this._onePathLocks[lockKey] && this._onePathLocks[lockKey] !== path) return;
      if (!this._onePathLocks[lockKey]) this._onePathLocks[lockKey] = path;
    }

    const upgrades = this.upgradeSystem.getAvailableUpgrades(tower);
    const upgrade = upgrades.find(u => u.path === path && u.tier === tier);
    if (!upgrade) return;

    if (!this.economySystem.canAfford(upgrade.cost)) {
      eventBus.emit('cannotAfford', upgrade.cost);
      return;
    }

    this.economySystem.spendCash(upgrade.cost);
    this.upgradeSystem.applyUpgrade(tower, path, tier);
    eventBus.emit('towerUpgraded', { tower, path, tier });

    // Refresh selected tower info
    if (this.selectedTower === tower) {
      eventBus.emit('towerSelected', tower);
    }
  }

  deselectTower() {
    if (this.selectedTower) {
      this.selectedTower.hideRange();
      this.selectedTower = null;
    }
    eventBus.emit('towerDeselected');
  }

  spawnBloon(typeId, progress = 0, modifiers = null) {
    if (this.gameOver) return;

    // Challenge: Reverse mode
    if (this.challengeRules && this.challengeRules.reverseMode && progress === 0) {
      progress = 1.0;
    }

    const bloon = new Bloon(this, typeId, progress);
    if (modifiers) {
      bloon.applyModifiers(modifiers);
    }

    // Challenge: Reverse mode
    if (this.challengeRules && this.challengeRules.reverseMode) {
      bloon.reverseMode = true;
    }

    // Market event: HP mult
    if (this._eventHPMult && this._eventHPMult !== 1) {
      bloon.hp = Math.ceil(bloon.hp * this._eventHPMult);
    }

    // Market event: speed mult
    if (this._eventSpeedMult && this._eventSpeedMult !== 1) {
      bloon.baseSpeed *= this._eventSpeedMult;
    }

    // Market event: rug alert — random chance to gain camo
    if (this._eventRugAlert && !bloon.isCamo && Math.random() < 0.15) {
      bloon.isCamo = true;
      if (bloon.sprite) bloon.sprite.setAlpha(0.6);
    }

    this.bloons.push(bloon);
    return bloon;
  }

  popBloon(bloon) {
    if (!bloon.active) return;
    bloon.active = false;
    this.totalPops++;

    // Track per-token pops
    this.popTracker.recordPop(bloon.tokenData);

    // Award cash (hero whale passive: 2x cash if bloon in range)
    let cashAmount = POP_CASH;
    if (this.hero && this.hero.heroDef.passive.type === 'doubleCash') {
      const dx = bloon.x - this.hero.x;
      const dy = bloon.y - this.hero.y;
      const range = this.hero.heroDef.passive.range || 150;
      if (dx * dx + dy * dy <= range * range) {
        cashAmount *= 2;
      }
    }
    this.economySystem.addCash(cashAmount);

    // Hero XP — pops within hero range give XP
    if (this.hero) {
      const dx = bloon.x - this.hero.x;
      const dy = bloon.y - this.hero.y;
      if (dx * dx + dy * dy <= this.hero.stats.range * this.hero.stats.range) {
        this.hero.addXP(1);
      }
    }

    // Spawn children, propagating modifiers
    const children = bloon.bloonData.children;
    if (children && children.length > 0) {
      const childModifiers = {};
      if (bloon.isRegrow) childModifiers.regrow = true;
      if (bloon.isFortified) childModifiers.fortified = true;
      const hasModifiers = Object.keys(childModifiers).length > 0;

      children.forEach((childType) => {
        const childProgress = bloon.pathProgress + (Math.random() - 0.5) * 0.005;
        const child = this.spawnBloon(childType, childProgress, hasModifiers ? childModifiers : null);
        if (child && bloon.isRegrow) {
          child.originalType = bloon.originalType;
        }
      });
    }

    // Pop effect
    this.createPopEffect(bloon.x, bloon.y, bloon.bloonData.color);

    // Floating cash text
    this.createFloatingText(bloon.x, bloon.y - 10, `+$${POP_CASH}`, '#44ff44');

    bloon.pop();
  }

  createPopEffect(x, y, color) {
    const particles = this.add.graphics();
    particles.setDepth(25);

    // Burst of 8 color-matched particles with size variation
    const count = 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.3;
      const dist = 2 + Math.random() * 4;
      const px = x + Math.cos(angle) * dist;
      const py = y + Math.sin(angle) * dist;
      const size = 1.5 + Math.random() * 2.5;
      particles.fillStyle(color, 0.6 + Math.random() * 0.4);
      particles.fillCircle(px, py, size);
    }

    // Fade out and remove
    this.tweens.add({
      targets: particles,
      alpha: 0,
      scaleX: 2,
      scaleY: 2,
      duration: 250,
      onComplete: () => particles.destroy(),
    });
  }

  createFloatingText(x, y, text, color) {
    const floatText = this.add.text(x, y, text, {
      fontSize: '10px',
      fontFamily: 'monospace',
      color: color,
      stroke: '#000000',
      strokeThickness: 2,
    });
    floatText.setOrigin(0.5, 0.5);
    floatText.setDepth(30);

    this.tweens.add({
      targets: floatText,
      y: y - 20,
      alpha: 0,
      duration: 600,
      ease: 'Power2',
      onComplete: () => floatText.destroy(),
    });
  }

  loseLife(amount) {
    this.lives -= amount;
    if (this.lives < 0) this.lives = 0;
    eventBus.emit('livesChanged', this.lives);

    if (this.lives <= 0 && !this.gameOver) {
      this.triggerGameOver(false);
    }
  }

  triggerGameOver(won) {
    this.gameOver = true;
    eventBus.emit('gameOver', {
      won,
      wave: this.waveSystem.currentWave + (won ? 0 : 1),
      totalWaves: this.waveSystem.totalWaves,
      totalPops: this.totalPops,
      towersPlaced: this.towers.length,
      popStats: this.popTracker.getStats(),
      challenge: this.challengeId,
    });
  }

  addProjectile(proj) {
    this.projectiles.push(proj);
  }

  removeProjectile(proj) {
    proj.active = false;
  }

  toggleSpeed() {
    if (this.challengeRules && this.challengeRules.lockedSpeed) return;
    if (this.gameSpeed === 1) this.gameSpeed = 2;
    else if (this.gameSpeed === 2) this.gameSpeed = 3;
    else this.gameSpeed = 1;
    eventBus.emit('speedChanged', this.gameSpeed);
  }

  update(time, rawDelta) {
    if (this.gameOver || this.isPaused) return;

    const delta = rawDelta * this.gameSpeed;
    this.gameTime += delta;

    // Update bloons
    for (let i = this.bloons.length - 1; i >= 0; i--) {
      const bloon = this.bloons[i];
      if (!bloon.active) {
        this.bloons.splice(i, 1);
        continue;
      }
      bloon.update(delta);
    }

    // Update towers
    for (const tower of this.towers) {
      tower.update(this.gameTime, delta);
    }

    // Update hero
    if (this.hero) {
      this.hero.update(this.gameTime, delta);
    }

    // Apply paragon passives
    for (const tower of this.towers) {
      if (!tower.isParagon || !tower._paragonPassive) continue;
      switch (tower._paragonPassive) {
        case 'globalCamo':
          // All towers gain camo detection
          for (const t of this.towers) {
            t.stats.canDetectCamo = true;
          }
          break;
        case 'costReduction':
          this.economySystem.costMultiplier = Math.min(
            this.economySystem.costMultiplier,
            1 - (tower._paragonDef.costReduction || 0.3)
          );
          break;
      }
    }

    // Update projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      if (!proj.active) {
        proj.destroy();
        this.projectiles.splice(i, 1);
        continue;
      }
      proj.update(delta);
    }

    // Boss: Whale Dump crash aura — slow nearby towers' fire rate
    const activeBoss = this.bloons.find(b => b.active && b.isBoss);
    if (activeBoss && activeBoss.bloonData.bossAbility === 'crashAuraAndHeal') {
      const range = activeBoss.bloonData.crashAuraRange || 80;
      for (const tower of this.towers) {
        const dx = tower.x - activeBoss.x;
        const dy = tower.y - activeBoss.y;
        if (dx * dx + dy * dy <= range * range) {
          tower._bossSlowed = true;
        } else {
          tower._bossSlowed = false;
        }
      }
    }

    // Emit boss HP for HUD
    if (activeBoss) {
      eventBus.emit('bossHP', {
        name: activeBoss.bloonData.name,
        current: activeBoss.hp,
        max: activeBoss.bloonData.hp,
      });
    } else {
      eventBus.emit('bossHP', null);
    }

    // Collision detection
    this.collisionSystem.update();

    // Ability cooldowns
    this.abilitySystem.update(delta);

    // Check if wave is complete (no bloons left and not spawning)
    if (this.waveSystem.waveActive && !this.waveSystem.spawning && this.bloons.length === 0) {
      this.waveSystem.onAllBloonsCleared();
    }
  }

  shutdown() {
    // Clean up event listeners
    this.eventUnsubs.forEach(unsub => unsub());
    this.towerPlacementSystem.destroy();
    this.waveSystem.cleanup();

    // Destroy game objects
    this.towers.forEach(t => t.destroy());
    this.bloons.forEach(b => { if (b.active) b.destroy(); });
    this.projectiles.forEach(p => p.destroy());
    if (this.hero) this.hero.destroy();
  }
}
