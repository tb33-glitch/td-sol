import { STARTING_CASH } from '../data/waveData';
import eventBus from '../GameEventBus';

export default class EconomySystem {
  constructor(scene, startingCash = null) {
    this.scene = scene;
    this.cash = startingCash !== null ? startingCash : STARTING_CASH;
    this.cashMult = 1.0;
    this.incomeMultiplier = 1.0; // modified by market events
    this.costMultiplier = 1.0; // modified by market events
    this.sellMultiplier = 0.7; // modified by market events
  }

  addCash(amount) {
    let mult = this.cashMult * this.incomeMultiplier;
    // Hero passive: Satoshi gives +10% income
    if (this.scene.hero && this.scene.hero.heroDef.passive.type === 'incomeBoost') {
      mult *= (1 + this.scene.hero.heroDef.passive.value);
    }
    this.cash += Math.floor(amount * mult);
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
    const totalSpent = tower.totalSpent || tower.baseCost || 0;
    return Math.floor(totalSpent * this.sellMultiplier);
  }
}
