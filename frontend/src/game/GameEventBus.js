// Shared EventEmitter bridge between Phaser and React
// Both sides import this singleton and subscribe/emit events

class GameEventBus {
  constructor() {
    this.listeners = {};
  }

  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  emit(event, ...args) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(cb => cb(...args));
  }

  removeAllListeners(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

const eventBus = new GameEventBus();
export default eventBus;
