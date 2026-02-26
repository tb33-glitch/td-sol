import { TOWER_FOOTPRINT, TOWER_TYPES } from '../data/towerData';
import eventBus from '../GameEventBus';

export default class TowerPlacementSystem {
  constructor(scene) {
    this.scene = scene;
    this.placingTower = null;
    this.previewGraphics = null;
    this.rangeGraphics = null;
    this.previewSprite = null;
    this.isValid = false;
  }

  init() {
    this.previewGraphics = this.scene.add.graphics();
    this.previewGraphics.setDepth(100);
    this.rangeGraphics = this.scene.add.graphics();
    this.rangeGraphics.setDepth(99);

    this.scene.input.on('pointermove', (pointer) => {
      if (this.placingTower) {
        this.updatePreview(pointer.x, pointer.y);
      }
    });

    this.scene.input.on('pointerdown', (pointer) => {
      if (this.placingTower && pointer.leftButtonDown()) {
        this.attemptPlace(pointer.x, pointer.y);
      }
    });

    // Listen for tower selection from React
    this.unsub = eventBus.on('selectTowerToPlace', (towerId) => {
      this.startPlacing(towerId);
    });

    this.unsubCancel = eventBus.on('cancelPlacement', () => {
      this.cancelPlacing();
    });
  }

  startPlacing(towerId) {
    this.placingTower = towerId;
    this.previewGraphics.setVisible(true);
    this.rangeGraphics.setVisible(true);

    // Create sprite preview
    if (this.previewSprite) {
      this.previewSprite.destroy();
      this.previewSprite = null;
    }
    const towerDef = TOWER_TYPES[towerId];
    if (towerDef && towerDef.textureKey && this.scene.textures.exists(towerDef.textureKey)) {
      this.previewSprite = this.scene.add.image(0, 0, towerDef.textureKey);
      this.previewSprite.setDisplaySize(towerDef.radius * 2.2, towerDef.radius * 2.2);
      this.previewSprite.setAlpha(0.6);
      this.previewSprite.setDepth(101);
      this.previewSprite.setVisible(false);
    }
  }

  cancelPlacing() {
    this.placingTower = null;
    this.previewGraphics.clear();
    this.previewGraphics.setVisible(false);
    this.rangeGraphics.clear();
    this.rangeGraphics.setVisible(false);
    if (this.previewSprite) {
      this.previewSprite.destroy();
      this.previewSprite = null;
    }
  }

  updatePreview(x, y) {
    if (!this.placingTower) return;

    const towerData = this.scene.getTowerData(this.placingTower);
    if (!towerData) return;

    this.isValid = this.canPlace(x, y);

    // Position sprite preview
    if (this.previewSprite) {
      this.previewSprite.setPosition(x, y);
      this.previewSprite.setVisible(true);
      this.previewSprite.setTint(this.isValid ? 0xffffff : 0xff4444);
      this.previewSprite.setAlpha(this.isValid ? 0.7 : 0.4);
    }

    // Draw placement circle
    this.previewGraphics.clear();
    this.previewGraphics.lineStyle(2, this.isValid ? 0x44ff44 : 0xff0000, 0.6);
    this.previewGraphics.strokeCircle(x, y, towerData.radius + 2);

    // Draw range preview
    this.rangeGraphics.clear();
    if (towerData.range > 0 && towerData.range < 9999) {
      this.rangeGraphics.lineStyle(1, 0xffffff, 0.3);
      this.rangeGraphics.strokeCircle(x, y, towerData.range);
      this.rangeGraphics.fillStyle(0xffffff, 0.05);
      this.rangeGraphics.fillCircle(x, y, towerData.range);
    }
  }

  canPlace(x, y) {
    const { width, height } = this.scene.scale;

    // Check bounds
    if (x < TOWER_FOOTPRINT || x > width - TOWER_FOOTPRINT) return false;
    if (y < TOWER_FOOTPRINT || y > height - TOWER_FOOTPRINT) return false;

    // Check path collision
    if (this.scene.pathSystem.isOnPath(x, y, TOWER_FOOTPRINT)) return false;

    // Check tower collision
    const towers = this.scene.towers || [];
    for (const tower of towers) {
      const dx = tower.x - x;
      const dy = tower.y - y;
      const minDist = TOWER_FOOTPRINT * 2;
      if (dx * dx + dy * dy < minDist * minDist) return false;
    }

    return true;
  }

  attemptPlace(x, y) {
    if (!this.placingTower || !this.isValid) return;

    const towerData = this.scene.getTowerData(this.placingTower);
    if (!towerData) return;

    if (!this.scene.economySystem.canAfford(towerData.cost)) {
      eventBus.emit('cannotAfford', towerData.cost);
      return;
    }

    this.scene.economySystem.spendCash(towerData.cost);
    this.scene.placeTower(this.placingTower, x, y);

    // Keep placing if shift is held, otherwise stop
    if (!this.scene.input.keyboard.addKey('SHIFT').isDown) {
      this.cancelPlacing();
    }
  }

  destroy() {
    if (this.unsub) this.unsub();
    if (this.unsubCancel) this.unsubCancel();
    if (this.previewGraphics) this.previewGraphics.destroy();
    if (this.rangeGraphics) this.rangeGraphics.destroy();
    if (this.previewSprite) this.previewSprite.destroy();
  }
}
