import { WAVES, WAVE_BONUS, SEND_EARLY_BONUS, generateFreeplayWave } from './data/waveData.js';

export default class HeadlessWaveSystem {
  constructor(game) {
    this.game = game;
    this.currentWave = 0;
    this.totalWaves = WAVES.length;
    this.spawning = false;
    this.waveActive = false;
    this.freeplay = false;

    // Spawn queue: sorted list of { time, typeId, modifiers }
    this.spawnQueue = [];
    this.spawnTimer = 0;
    this.spawnEndTime = 0;
  }

  startWave() {
    if (this.spawning) return false;

    // Send-early bonus
    if (this.waveActive && !this.spawning && this.currentWave < this.totalWaves) {
      const bonus = SEND_EARLY_BONUS(this.currentWave + 1);
      this.game.addCash(bonus);
    }

    if (!this.freeplay && this.currentWave >= this.totalWaves) return false;

    this.spawning = true;
    this.waveActive = true;

    const waveData = this.currentWave < WAVES.length
      ? WAVES[this.currentWave]
      : generateFreeplayWave(this.currentWave + 1);

    // Build spawn queue
    this.spawnQueue = [];
    let maxTime = 0;

    for (const group of waveData) {
      for (let i = 0; i < group.count; i++) {
        const time = group.startDelay + i * group.delay;
        this.spawnQueue.push({
          time,
          typeId: group.type,
          modifiers: group.modifiers || null,
        });
        maxTime = Math.max(maxTime, time);
      }
    }

    // Sort by spawn time
    this.spawnQueue.sort((a, b) => a.time - b.time);
    this.spawnTimer = 0;
    this.spawnEndTime = maxTime + 500;

    return true;
  }

  tick(deltaMs) {
    if (!this.spawning) return;

    this.spawnTimer += deltaMs;

    // Spawn bloons whose time has come
    while (this.spawnQueue.length > 0 && this.spawnQueue[0].time <= this.spawnTimer) {
      const spawn = this.spawnQueue.shift();
      this.game.spawnBloon(spawn.typeId, 0, spawn.modifiers);
    }

    // All spawns done
    if (this.spawnQueue.length === 0 && this.spawnTimer >= this.spawnEndTime) {
      this.spawning = false;
    }
  }

  onAllBloonsCleared() {
    if (this.spawning) return;
    if (!this.waveActive) return;

    this.waveActive = false;

    // Wave completion bonus
    const bonus = WAVE_BONUS(this.currentWave + 1);
    this.game.addCash(bonus);

    this.currentWave++;

    if (this.currentWave >= this.totalWaves && !this.freeplay) {
      this.freeplay = true;
      this.game.gameWon = true;
    }

    // Notify market event system
    if (this.game.marketEventSystem) {
      this.game.marketEventSystem.onWaveComplete();
    }
  }

  getWavePreview() {
    const waveIdx = this.currentWave;
    if (waveIdx < WAVES.length) {
      const wave = WAVES[waveIdx];
      return [...new Set(wave.map(g => g.type))];
    } else if (this.freeplay) {
      const wave = generateFreeplayWave(waveIdx + 1);
      return [...new Set(wave.map(g => g.type))];
    }
    return [];
  }
}
