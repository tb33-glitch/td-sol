import { WAVES, WAVE_BONUS } from '../data/waveData';
import eventBus from '../GameEventBus';

export default class WaveSystem {
  constructor(scene) {
    this.scene = scene;
    this.currentWave = 0; // 0-indexed, displayed as +1
    this.totalWaves = WAVES.length;
    this.spawning = false;
    this.waveActive = false;
    this.spawnTimers = [];
    this.autoStart = false;
  }

  startWave() {
    if (this.spawning || this.currentWave >= this.totalWaves) return;

    this.spawning = true;
    this.waveActive = true;
    const waveData = WAVES[this.currentWave];

    eventBus.emit('waveStarted', {
      wave: this.currentWave + 1,
      total: this.totalWaves,
    });

    // Schedule each spawn group
    waveData.forEach((group) => {
      for (let i = 0; i < group.count; i++) {
        const delay = group.startDelay + i * group.delay;
        const timer = this.scene.time.delayedCall(delay, () => {
          this.scene.spawnBloon(group.type);
        });
        this.spawnTimers.push(timer);
      }
    });

    // Calculate total spawn time
    const maxTime = waveData.reduce((max, group) => {
      const groupEnd = group.startDelay + (group.count - 1) * group.delay;
      return Math.max(max, groupEnd);
    }, 0);

    // After all spawns complete, mark spawning as done
    const endTimer = this.scene.time.delayedCall(maxTime + 500, () => {
      this.spawning = false;
    });
    this.spawnTimers.push(endTimer);
  }

  onAllBloonsCleared() {
    if (this.spawning) return; // still spawning
    if (!this.waveActive) return;

    this.waveActive = false;

    // Award wave completion bonus
    const bonus = WAVE_BONUS(this.currentWave + 1);
    this.scene.economySystem.addCash(bonus);

    this.currentWave++;

    if (this.currentWave >= this.totalWaves) {
      eventBus.emit('gameWon', {
        wave: this.currentWave,
        totalWaves: this.totalWaves,
      });
      return;
    }

    eventBus.emit('waveCompleted', {
      wave: this.currentWave,
      total: this.totalWaves,
      bonus,
    });

    // Auto-start next wave if enabled
    if (this.autoStart) {
      this.scene.time.delayedCall(1000, () => this.startWave());
    }
  }

  cleanup() {
    this.spawnTimers.forEach(t => t.remove(false));
    this.spawnTimers = [];
  }
}
