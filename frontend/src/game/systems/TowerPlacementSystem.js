import { TOWER_FOOTPRINT } from '../data/towerData';
import eventBus from '../GameEventBus';

export default class TowerPlacementSystem {
  constructor(scene) {
    this.scene = scene;
    this.placingTower = null; // tower type id being placed
    this.previewGraphics = null;
    this.rangeGraphics = null;
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
  }

  cancelPlacing() {
    this.placingTower = null;
    this.previewGraphics.clear();
    this.previewGraphics.setVisible(false);
    this.rangeGraphics.clear();
    this.rangeGraphics.setVisible(false);
  }

  updatePreview(x, y) {
    if (!this.placingTower) return;

    const towerData = this.scene.getTowerData(this.placingTower);
    if (!towerData) return;

    this.isValid = this.canPlace(x, y);

    // Draw tower preview
    this.previewGraphics.clear();
    const color = this.isValid ? towerData.color : 0xff0000;
    this.previewGraphics.fillStyle(color, 0.6);
    this.previewGraphics.fillCircle(x, y, towerData.radius);
    this.previewGraphics.lineStyle(2, this.isValid ? 0xffffff : 0xff0000, 0.8);
    this.previewGraphics.strokeCircle(x, y, towerData.radius);

    // Draw range preview
    this.rangeGraphics.clear();
    if (towerData.range > 0) {
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
  }
}
