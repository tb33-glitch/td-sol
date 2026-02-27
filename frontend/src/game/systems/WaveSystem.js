import { WAVES, WAVE_BONUS, SEND_EARLY_BONUS, generateFreeplayWave } from '../data/waveData';
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
    this.freeplay = false;
    this.hpMult = 1.0;
  }

  startWave() {
    if (this.spawning) return;

    // Allow send-early: if wave is active, starting next wave gives bonus
    if (this.waveActive && !this.spawning && this.currentWave < this.totalWaves) {
      const bonus = SEND_EARLY_BONUS(this.currentWave + 1);
      this.scene.economySystem.addCash(bonus);
    }

    if (!this.freeplay && this.currentWave >= this.totalWaves) return;

    this.spawning = true;
    this.waveActive = true;

    // Get wave data — use freeplay generator if past defined waves
    const waveData = this.currentWave < WAVES.length
      ? WAVES[this.currentWave]
      : generateFreeplayWave(this.currentWave + 1);

    eventBus.emit('waveStarted', {
      wave: this.currentWave + 1,
      total: this.totalWaves,
    });

    // Notify market event system
    if (this.scene.marketEventSystem) {
      this.scene.marketEventSystem.onWaveStart(this.currentWave + 1);
    }

    // Schedule each spawn group
    waveData.forEach((group) => {
      for (let i = 0; i < group.count; i++) {
        const delay = group.startDelay + i * group.delay;
        const timer = this.scene.time.delayedCall(delay, () => {
          this.scene.spawnBloon(group.type, 0, group.modifiers || null);
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

    if (this.currentWave >= this.totalWaves && !this.freeplay) {
      // Enable freeplay mode
      this.freeplay = true;
      eventBus.emit('gameWon', {
        wave: this.currentWave,
        totalWaves: this.totalWaves,
        freeplay: true,
      });
      // Don't return — allow continued play
    }

    eventBus.emit('waveCompleted', {
      wave: this.currentWave,
      total: this.totalWaves,
      bonus,
    });

    // Notify market event system
    if (this.scene.marketEventSystem) {
      this.scene.marketEventSystem.onWaveComplete();
    }

    // Emit preview of next wave
    this.emitWavePreview();

    // Auto-start next wave if enabled
    if (this.autoStart) {
      this.scene.time.delayedCall(1000, () => this.startWave());
    }
  }

  emitWavePreview() {
    if (this.currentWave < WAVES.length) {
      const nextWave = WAVES[this.currentWave];
      const types = [...new Set(nextWave.map(g => g.type))];
      eventBus.emit('wavePreview', { wave: this.currentWave + 1, types });
    } else if (this.freeplay) {
      const wave = generateFreeplayWave(this.currentWave + 1);
      const types = [...new Set(wave.map(g => g.type))];
      eventBus.emit('wavePreview', { wave: this.currentWave + 1, types });
    }
  }

  cleanup() {
    this.spawnTimers.forEach(t => t.remove(false));
    this.spawnTimers = [];
  }
}
