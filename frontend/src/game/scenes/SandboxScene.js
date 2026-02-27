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
import { STARTING_LIVES, DIFFICULTIES } from '../data/waveData';
import { MAPS } from '../data/mapData';
import PopTracker from '../systems/PopTracker';
import eventBus from '../GameEventBus';

// SandboxScene — identical to GameScene but with infinite money, custom spawning, etc.
// We duplicate the create/update structure to avoid Phaser Scene inheritance issues.

export default class SandboxScene extends Phaser.Scene {
  constructor() {
    super({ key: 'SandboxScene' });
  }

  create() {
    const mapId = this.registry.get('mapId') || 'meadow';
    const difficultyId = this.registry.get('difficulty') || 'easy';
    const difficulty = DIFFICULTIES[difficultyId] || DIFFICULTIES.easy;

    this.lives = 9999;
    this.towers = [];
    this.bloons = [];
    this.projectiles = [];
    this.totalPops = 0;
    this.gameOver = false;
    this.gameSpeed = 1;
    this.gameTime = 0;
    this.selectedTower = null;
    this.isPaused = false;
    this.hero = null;
    this.heroId = this.registry.get('heroId') || null;
    this.challengeRules = null;
    this.challengeId = null;
    this._onePathLocks = {};
    this._invincible = true;

    // Event modifiers
    this._eventSpeedMult = 1;
    this._eventFireRateMult = 1;
    this._eventHPMult = 1;
    this._eventPopIncomeMult = 1;
    this._eventWaveBonusMult = 1;
    this._eventRugAlert = false;

    // Systems
    this.pathSystem = new PathSystem(this, mapId);
    this.pathSystem.init();
    this.waveSystem = new WaveSystem(this);
    this.waveSystem.hpMult = difficulty.hpMult;
    this.economySystem = new EconomySystem(this, 999999);
    this.economySystem.cashMult = 1.0;
    this.towerPlacementSystem = new TowerPlacementSystem(this);
    this.towerPlacementSystem.init();
    this.upgradeSystem = new UpgradeSystem(this);
    this.collisionSystem = new CollisionSystem(this);
    this.abilitySystem = new AbilitySystem(this);
    this.synergySystem = new SynergySystem(this);
    this.marketEventSystem = new MarketEventSystem(this);
    this.popTracker = new PopTracker();

    // Dynamic bloon types
    const pitBloonData = this.registry.get('pitBloonData');
    if (pitBloonData) {
      const dynamicTypes = createDynamicBloonTypes(pitBloonData);
      if (dynamicTypes) this.registry.set('dynamicBloonTypes', dynamicTypes);
    }

    this.drawMap(mapId);

    // Hero
    if (this.heroId && HEROES[this.heroId]) {
      const { width, height } = this.scale;
      this.placeHero(this.heroId, width / 2, height / 2);
    }

    eventBus.emit('moneyChanged', 999999);
    eventBus.emit('livesChanged', this.lives);
    eventBus.emit('waveInfo', { wave: 0, total: this.waveSystem.totalWaves });

    // React event listeners
    this.eventUnsubs = [];
    this.eventUnsubs.push(
      eventBus.on('startWave', () => this.waveSystem.startWave()),
      eventBus.on('toggleSpeed', () => this.toggleSpeed()),
      eventBus.on('sellTower', (tower) => this.sellTower(tower)),
      eventBus.on('upgradeTower', ({ tower, path, tier }) => this.doUpgrade(tower, path, tier)),
      eventBus.on('deselectTower', () => this.deselectTower()),
      eventBus.on('togglePause', () => {
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
      eventBus.on('mergeParagon', (towerId) => {
        this.upgradeSystem.executeParagon(towerId);
      }),
      eventBus.on('heroSelected', (hero) => {
        this.deselectTower();
        this.selectedTower = hero;
        hero.showRange();
        eventBus.emit('towerSelected', hero);
      }),
      // Sandbox-specific events
      eventBus.on('sandboxSpawnBloon', ({ typeId, count, modifiers }) => {
        for (let i = 0; i < (count || 1); i++) {
          this.spawnBloon(typeId, 0, modifiers || null);
        }
      }),
      eventBus.on('sandboxSetSpeed', (speed) => {
        this.gameSpeed = speed;
        eventBus.emit('speedChanged', this.gameSpeed);
      }),
      eventBus.on('sandboxReset', () => {
        for (const bloon of this.bloons) {
          if (bloon.active) bloon.destroy();
        }
        this.bloons = [];
        for (const proj of this.projectiles) {
          proj.destroy();
        }
        this.projectiles = [];
        this.economySystem.cash = 999999;
        eventBus.emit('moneyChanged', 999999);
        this.lives = 9999;
        eventBus.emit('livesChanged', this.lives);
      }),
      eventBus.on('sandboxToggleInvincible', () => {
        this._invincible = !this._invincible;
        eventBus.emit('sandboxInvincible', this._invincible);
      }),
    );

    // Input
    this.input.on('pointerdown', (pointer) => {
      if (pointer.rightButtonDown()) {
        this.towerPlacementSystem.cancelPlacing();
        this.deselectTower();
      }
    });

    this.input.keyboard.on('keydown-SPACE', () => {
      if (this.waveSystem.waveActive || this.waveSystem.spawning) return;
      this.waveSystem.startWave();
    });
    this.input.keyboard.on('keydown-ESC', () => {
      this.towerPlacementSystem.cancelPlacing();
      this.deselectTower();
    });
  }

  // Delegate methods to GameScene pattern
  drawMap(mapId) {
    const map = MAPS[mapId];
    const { width, height } = this.scale;
    const bg = this.add.graphics();
    bg.fillStyle(map.backgroundColor, 1);
    bg.fillRect(0, 0, width, height);
    bg.setDepth(0);
    const pathGfx = this.add.graphics();
    pathGfx.setDepth(1);
    this.pathSystem.drawPath(pathGfx);
  }

  getTowerData(towerId) { return TOWER_TYPES[towerId]; }

  placeTower(towerId, x, y) {
    const tower = new Tower(this, x, y, towerId);
    this.towers.push(tower);
    eventBus.emit('towerPlaced', { towerId, x, y, count: this.towers.length });
    this.synergySystem.checkSynergies();
  }

  placeHero(heroId, x, y) {
    if (this.hero) return;
    this.hero = new Hero(this, x, y, heroId);
    eventBus.emit('heroPlaced', { heroId, x, y });
  }

  sellTower(tower) {
    if (!tower) return;
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
    const upgrades = this.upgradeSystem.getAvailableUpgrades(tower);
    const upgrade = upgrades.find(u => u.path === path && u.tier === tier);
    if (!upgrade) return;
    // In sandbox, upgrades are free
    this.upgradeSystem.applyUpgrade(tower, path, tier);
    eventBus.emit('towerUpgraded', { tower, path, tier });
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
    const bloon = new Bloon(this, typeId, progress);
    if (modifiers) bloon.applyModifiers(modifiers);
    this.bloons.push(bloon);
    return bloon;
  }

  popBloon(bloon) {
    if (!bloon.active) return;
    bloon.active = false;
    this.totalPops++;
    this.popTracker.recordPop(bloon.tokenData);
    this.economySystem.addCash(POP_CASH);

    if (this.hero) {
      const dx = bloon.x - this.hero.x;
      const dy = bloon.y - this.hero.y;
      if (dx * dx + dy * dy <= this.hero.stats.range * this.hero.stats.range) {
        this.hero.addXP(1);
      }
    }

    const children = bloon.bloonData.children;
    if (children && children.length > 0) {
      const childModifiers = {};
      if (bloon.isRegrow) childModifiers.regrow = true;
      if (bloon.isFortified) childModifiers.fortified = true;
      const hasModifiers = Object.keys(childModifiers).length > 0;
      children.forEach((childType) => {
        const childProgress = bloon.pathProgress + (Math.random() - 0.5) * 0.005;
        const child = this.spawnBloon(childType, childProgress, hasModifiers ? childModifiers : null);
        if (child && bloon.isRegrow) child.originalType = bloon.originalType;
      });
    }

    this.createPopEffect(bloon.x, bloon.y, bloon.bloonData.color);
    bloon.pop();
  }

  createPopEffect(x, y, color) {
    const particles = this.add.graphics();
    particles.setDepth(25);
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
    if (this._invincible) return;
    this.lives -= amount;
    if (this.lives < 0) this.lives = 0;
    eventBus.emit('livesChanged', this.lives);
  }

  triggerGameOver() { /* Sandbox never ends */ }

  addProjectile(proj) { this.projectiles.push(proj); }
  removeProjectile(proj) { proj.active = false; }

  toggleSpeed() {
    const speeds = [0.5, 1, 2, 3, 5, 10];
    const idx = speeds.indexOf(this.gameSpeed);
    this.gameSpeed = speeds[(idx + 1) % speeds.length];
    eventBus.emit('speedChanged', this.gameSpeed);
  }

  update(time, rawDelta) {
    if (this.isPaused) return;

    const delta = rawDelta * this.gameSpeed;
    this.gameTime += delta;

    for (let i = this.bloons.length - 1; i >= 0; i--) {
      const bloon = this.bloons[i];
      if (!bloon.active) { this.bloons.splice(i, 1); continue; }
      bloon.update(delta);
    }

    for (const tower of this.towers) {
      tower.update(this.gameTime, delta);
    }

    if (this.hero) this.hero.update(this.gameTime, delta);

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      if (!proj.active) { proj.destroy(); this.projectiles.splice(i, 1); continue; }
      proj.update(delta);
    }

    this.collisionSystem.update();
    this.abilitySystem.update(delta);

    if (this.waveSystem.waveActive && !this.waveSystem.spawning && this.bloons.length === 0) {
      this.waveSystem.onAllBloonsCleared();
    }

    // Keep money infinite
    if (this.economySystem.cash < 999999) {
      this.economySystem.cash = 999999;
      eventBus.emit('moneyChanged', 999999);
    }
  }

  shutdown() {
    this.eventUnsubs.forEach(unsub => unsub());
    this.towerPlacementSystem.destroy();
    this.waveSystem.cleanup();
    this.towers.forEach(t => t.destroy());
    this.bloons.forEach(b => { if (b.active) b.destroy(); });
    this.projectiles.forEach(p => p.destroy());
    if (this.hero) this.hero.destroy();
  }
}
