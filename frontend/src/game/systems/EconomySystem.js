import { STARTING_CASH } from '../data/waveData';
import eventBus from '../GameEventBus';

export default class EconomySystem {
  constructor(scene) {
    this.scene = scene;
    this.cash = STARTING_CASH;
  }

  addCash(amount) {
    this.cash += amount;
    eventBus.emit('moneyChanged', this.cash);
  }

  spendCash(amount) {
    if (this.cash < amount) return false;
    this.cash -= amount;
    eventBus.emit('moneyChanged', this.cash);
    return true;
  }

  canAfford(amount) {
    return this.cash >= amount;
  }

  getSellValue(tower) {
    // Sell for 70% of total invested
    const totalSpent = tower.totalSpent || tower.baseCost || 0;
    return Math.floor(totalSpent * 0.7);
  }
}
