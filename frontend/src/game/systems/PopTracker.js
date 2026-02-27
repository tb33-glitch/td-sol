// Pop Tracker — per-token pop ledger for pit tokens
import eventBus from '../GameEventBus';

export default class PopTracker {
  constructor() {
    // Map<address, { name, symbol, imageUrl, pops }>
    this.ledger = new Map();
  }

  recordPop(tokenData) {
    if (!tokenData || !tokenData.address) return;

    const key = tokenData.address;
    if (this.ledger.has(key)) {
      this.ledger.get(key).pops++;
    } else {
      this.ledger.set(key, {
        name: tokenData.name,
        symbol: tokenData.symbol,
        address: tokenData.address,
        imageUrl: tokenData.imageUrl || null,
        pops: 1,
      });
    }

    eventBus.emit('popStatsUpdated', this.getStats());
  }

  getStats() {
    return Array.from(this.ledger.values())
      .sort((a, b) => b.pops - a.pops);
  }

  reset() {
    this.ledger.clear();
  }
}
