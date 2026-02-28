import { randomUUID } from 'node:crypto';
import HeadlessGame from './HeadlessGame.js';

const MAX_GAMES = 50;
const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export default class GameManager {
  constructor() {
    this.games = new Map(); // gameId -> { game, lastAccess, config }
  }

  createGame(config = {}) {
    if (this.games.size >= MAX_GAMES) {
      // Evict oldest inactive game
      this._evictOldest();
      if (this.games.size >= MAX_GAMES) {
        throw new Error('Max concurrent games reached');
      }
    }

    const gameId = randomUUID().slice(0, 8);
    const game = new HeadlessGame(config);

    this.games.set(gameId, {
      game,
      lastAccess: Date.now(),
      config,
    });

    return { gameId, observation: game.getObservation() };
  }

  getGame(gameId) {
    const entry = this.games.get(gameId);
    if (!entry) return null;
    entry.lastAccess = Date.now();
    return entry.game;
  }

  destroyGame(gameId) {
    return this.games.delete(gameId);
  }

  _evictOldest() {
    let oldest = null;
    let oldestTime = Infinity;

    for (const [id, entry] of this.games) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldest = id;
      }
    }

    if (oldest) this.games.delete(oldest);
  }

  cleanup() {
    const now = Date.now();
    for (const [id, entry] of this.games) {
      if (now - entry.lastAccess > INACTIVITY_TIMEOUT) {
        this.games.delete(id);
      }
    }
  }

  startCleanupInterval() {
    this._cleanupTimer = setInterval(() => this.cleanup(), 60_000);
  }

  stopCleanupInterval() {
    if (this._cleanupTimer) clearInterval(this._cleanupTimer);
  }

  get size() {
    return this.games.size;
  }
}
