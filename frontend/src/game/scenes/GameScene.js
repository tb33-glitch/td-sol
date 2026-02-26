import Phaser from 'phaser';
import PathSystem from '../systems/PathSystem';
import WaveSystem from '../systems/WaveSystem';
import EconomySystem from '../systems/EconomySystem';
import TowerPlacementSystem from '../systems/TowerPlacementSystem';
import UpgradeSystem from '../systems/UpgradeSystem';
import CollisionSystem from '../systems/CollisionSystem';
import Tower from '../objects/Tower';
import Bloon from '../objects/Bloon';
import { TOWER_TYPES } from '../data/towerData';
import { BLOON_TYPES, POP_CASH } from '../data/bloonData';
import { STARTING_LIVES } from '../data/waveData';
import { MAPS } from '../data/mapData';
import eventBus from '../GameEventBus';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super({ key: 'GameScene' });
  }

  create() {
    const mapId = this.registry.get('mapId') || 'meadow';

    // Game state
    this.lives = STARTING_LIVES;
    this.towers = [];
    this.bloons = [];
    this.projectiles = [];
    this.totalPops = 0;
    this.gameOver = false;
    this.gameSpeed = 1;
    this.gameTime = 0; // accumulated game time (affected by speed)
    this.selectedTower = null;
    this.isPaused = false;

    // Systems
    this.pathSystem = new PathSystem(this, mapId);
    this.pathSystem.init();

    this.waveSystem = new WaveSystem(this);
    this.economySystem = new EconomySystem(this);
    this.towerPlacementSystem = new TowerPlacementSystem(this);
    this.towerPlacementSystem.init();
    this.upgradeSystem = new UpgradeSystem(this);
    this.collisionSystem = new CollisionSystem(this);

    // Draw map background
    this.drawMap(mapId);

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
        this.isPaused = !this.isPaused;
        eventBus.emit('pauseChanged', this.isPaused);
      }),
    );

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
    const tower = new Tower(this, x, y, towerId);
    this.towers.push(tower);
    eventBus.emit('towerPlaced', { towerId, x, y, count: this.towers.length });
  }

  sellTower(tower) {
    if (!tower) return;
    const value = this.economySystem.getSellValue(tower);
    this.economySystem.addCash(value);

    const idx = this.towers.indexOf(tower);
    if (idx >= 0) this.towers.splice(idx, 1);

    tower.hideRange();
    tower.destroy();

    this.deselectTower();
    eventBus.emit('towerSold', { value });
  }

  doUpgrade(tower, path, tier) {
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

  spawnBloon(typeId) {
    if (this.gameOver) return;
    const bloon = new Bloon(this, typeId);
    this.bloons.push(bloon);
  }

  popBloon(bloon) {
    if (!bloon.active) return;
    bloon.active = false;
    this.totalPops++;

    // Award cash
    this.economySystem.addCash(POP_CASH);

    // Spawn children
    const children = bloon.bloonData.children;
    if (children && children.length > 0) {
      children.forEach((childType) => {
        const child = new Bloon(this, childType, bloon.pathProgress);
        // Offset slightly to prevent stacking
        child.pathProgress += (Math.random() - 0.5) * 0.005;
        this.bloons.push(child);
      });
    }

    // Pop effect
    this.createPopEffect(bloon.x, bloon.y, bloon.bloonData.color);

    bloon.pop();
  }

  createPopEffect(x, y, color) {
    const particles = this.add.graphics();
    particles.setDepth(25);

    // Simple burst of circles
    const count = 4;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const px = x + Math.cos(angle) * 3;
      const py = y + Math.sin(angle) * 3;
      particles.fillStyle(color, 0.8);
      particles.fillCircle(px, py, 3);
    }

    // Fade out and remove
    this.tweens.add({
      targets: particles,
      alpha: 0,
      scaleX: 1.5,
      scaleY: 1.5,
      duration: 200,
      onComplete: () => particles.destroy(),
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
    });
  }

  addProjectile(proj) {
    this.projectiles.push(proj);
  }

  removeProjectile(proj) {
    proj.active = false;
  }

  toggleSpeed() {
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

    // Collision detection
    this.collisionSystem.update();

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
  }
}
