import { BLOON_TYPES, POP_CASH } from './data/bloonData.js';
import { TOWER_TYPES, TOWER_FOOTPRINT } from './data/towerData.js';
import { DIFFICULTIES, STARTING_CASH, STARTING_LIVES } from './data/waveData.js';
import { MAPS } from './data/mapData.js';
import { HEROES, HERO_XP_TABLE, getHeroStatMult } from './data/heroData.js';
import { CHALLENGES } from './data/challengeData.js';
import HeadlessPathSystem from './HeadlessPathSystem.js';
import HeadlessWaveSystem from './HeadlessWaveSystem.js';

const CANVAS_WIDTH = 900;
const CANVAS_HEIGHT = 600;
const CELL_SIZE = 30;
const GRID_COLS = CANVAS_WIDTH / CELL_SIZE;  // 30
const GRID_ROWS = CANVAS_HEIGHT / CELL_SIZE; // 20
const TICK_MS = 1000 / 60; // 16.67ms
const BASE_BLOON_SPEED = 60; // pixels per second at speed=1.0

// Synergy definitions (mirrored from frontend SynergySystem)
const SYNERGY_DEFS = [
  { id: 'pumpAndDump', requires: ['bomb', 'banana'], effects: { bomb: { damageMult: 1.2 }, banana: { incomeMult: 1.15 } } },
  { id: 'coldStorage', requires: ['ice', 'sniper'], effects: { ice: { slowDurationMult: 1.3 }, sniper: { pierceBonusVsFrozen: 2 } } },
  { id: 'arcaneProtocol', requires: ['wizard', 'mev'], effects: { wizard: { rangeMult: 1.15, isHoming: true }, mev: { rangeMult: 1.15 } } },
  { id: 'defiStack', requires: ['alchemist'], minOtherTowers: 2, effects: { alchemist: { buffStrengthMult: 1.25 } } },
  { id: 'exitLiquidity', requires: ['flipper', 'spikefactory'], effects: { flipper: { pierceBonusFlat: 1 }, spikefactory: { spikeDurationMult: 2.0 } } },
  { id: 'fullSend', requires: ['dart', 'dart', 'dart'], effects: { dart: { fireRateMult: 0.7 } } },
];
const SYNERGY_RANGE = 100;

// Market events (simplified from frontend)
const MARKET_EVENTS = [
  { id: 'bullRun', name: 'Bull Run', description: 'All bloons +30% speed', duration: 3, field: '_eventSpeedMult', value: 1.3, defaultValue: 1 },
  { id: 'flashCrash', name: 'Flash Crash', description: 'All towers fire 25% slower', duration: 3, field: '_eventFireRateMult', value: 1.25, defaultValue: 1 },
  { id: 'airdrop', name: 'Airdrop', description: '+$500 instant + all income 2x', duration: 2, field: '_incomeMultiplier', value: 2, defaultValue: 1, onApply: (g) => g.addCash(500) },
  { id: 'gasWar', name: 'Gas War', description: 'Tower placement costs +40%', duration: 3, field: '_costMultiplier', value: 1.4, defaultValue: 1 },
  { id: 'defiSummer', name: 'DeFi Summer', description: 'Tower sell value = 90%', duration: 3, field: '_sellMultiplier', value: 0.9, defaultValue: 0.7 },
  { id: 'mergeSeason', name: 'Merge Season', description: 'Bloons have +50% HP', duration: 2, field: '_eventHPMult', value: 1.5, defaultValue: 1 },
  { id: 'halving', name: 'Halving', description: 'Pop income halved, wave bonus doubled', duration: 3, field: '_eventPopIncomeMult', value: 0.5, defaultValue: 1 },
];

export default class HeadlessGame {
  constructor({ mapId = 'meadow', difficulty = 'medium', heroId = 'satoshi', challenge = null } = {}) {
    if (!MAPS[mapId]) throw new Error(`Unknown map: ${mapId}`);
    if (!DIFFICULTIES[difficulty]) throw new Error(`Unknown difficulty: ${difficulty}`);
    if (heroId && !HEROES[heroId]) throw new Error(`Unknown hero: ${heroId}`);
    if (challenge && !CHALLENGES[challenge]) throw new Error(`Unknown challenge: ${challenge}`);

    this.config = { mapId, difficulty, heroId, challenge };
    this.reset();
  }

  reset() {
    const { mapId, difficulty, heroId, challenge } = this.config;
    const diff = DIFFICULTIES[difficulty];

    this.pathSystem = new HeadlessPathSystem(mapId);
    this.waveSystem = new HeadlessWaveSystem(this);

    // Economy
    this.money = challenge && CHALLENGES[challenge]?.rules?.startingCash
      ? CHALLENGES[challenge].rules.startingCash
      : diff.cash;
    this.lives = diff.lives;
    this.cashMult = diff.cashMult;
    this.hpMult = diff.hpMult;

    // Market event modifiers
    this._eventSpeedMult = 1;
    this._eventFireRateMult = 1;
    this._incomeMultiplier = 1;
    this._costMultiplier = 1;
    this._sellMultiplier = 0.7;
    this._eventHPMult = 1;
    this._eventPopIncomeMult = 1;

    // Game state
    this.towers = [];
    this.bloons = [];
    this.projectiles = [];
    this.gameTime = 0;
    this.gameOver = false;
    this.gameWon = false;
    this.totalPops = 0;
    this.totalReward = 0;
    this.nextBloonId = 0;
    this.nextTowerId = 0;

    // Challenge rules
    this.challengeRules = challenge ? CHALLENGES[challenge].rules : {};

    // Hero
    this.hero = null;
    if (heroId) {
      const heroDef = HEROES[heroId];
      this.hero = {
        heroId,
        heroDef,
        level: 1,
        xp: 0,
        x: 0, y: 0,
        placed: false,
        stats: { ...heroDef.baseStats },
        fireTimer: 0,
        pops: 0,
        abilityCooldowns: {},
      };
    }

    // Market event system
    this.marketEventSystem = {
      activeEvent: null,
      wavesRemaining: 0,
      recentEvents: [],
      wavesSinceLastEvent: 0,
      nextEventIn: 8 + Math.floor(Math.random() * 5),

      onWaveComplete: () => {
        const mes = this.marketEventSystem;
        if (mes.activeEvent) {
          mes.wavesRemaining--;
          if (mes.wavesRemaining <= 0) {
            this._removeMarketEvent();
          }
        }
        mes.wavesSinceLastEvent++;
        if (!mes.activeEvent && mes.wavesSinceLastEvent >= mes.nextEventIn) {
          this._rollMarketEvent();
        }
      },
    };

    // Synergies
    this.activeSynergies = [];

    // Placement grid: track occupied cells
    this.occupiedCells = new Set();

    return this.getObservation();
  }

  // =========== STEP ===========

  step(action, ticksPerStep = 60) {
    if (this.gameOver) {
      return { observation: this.getObservation(), reward: 0, done: true, info: { reason: 'game_over' } };
    }

    const prevLives = this.lives;
    const prevPops = this.totalPops;
    const prevWave = this.waveSystem.currentWave;
    const wasWon = this.gameWon;

    // Apply action
    const actionResult = this._applyAction(action);

    // Simulate ticks
    for (let i = 0; i < ticksPerStep; i++) {
      this._tick(TICK_MS);
      if (this.gameOver) break;
    }

    // Calculate reward
    let reward = 0;
    const popsThisStep = this.totalPops - prevPops;
    reward += popsThisStep; // +1 per pop (already scaled by RBE in popBloon)
    const wavesCompleted = this.waveSystem.currentWave - prevWave;
    reward += wavesCompleted * 100;
    const livesLost = prevLives - this.lives;
    reward -= livesLost * 10;
    if (this.gameWon && !wasWon) reward += 1000;
    if (this.gameOver) reward -= 1000;

    this.totalReward += reward;

    return {
      observation: this.getObservation(),
      reward,
      done: this.gameOver,
      info: {
        actionResult,
        pops: popsThisStep,
        wavesCompleted,
        livesLost,
        totalReward: this.totalReward,
      },
    };
  }

  // =========== TICK ===========

  _tick(deltaMs) {
    if (this.gameOver) return;

    this.gameTime += deltaMs;

    // Wave spawning
    this.waveSystem.tick(deltaMs);

    // Move bloons
    this._updateBloons(deltaMs);

    // Update towers (fire projectiles)
    this._updateTowers(deltaMs);

    // Update hero
    this._updateHero(deltaMs);

    // Move projectiles & check collisions
    this._updateProjectiles(deltaMs);

    // Check wave completion
    if (this.waveSystem.waveActive && !this.waveSystem.spawning) {
      const activeBloons = this.bloons.filter(b => b.active);
      if (activeBloons.length === 0) {
        this.waveSystem.onAllBloonsCleared();
      }
    }

    // Check game over
    if (this.lives <= 0) {
      this.lives = 0;
      this.gameOver = true;
    }
  }

  // =========== BLOONS ===========

  _updateBloons(deltaMs) {
    const deltaSec = deltaMs / 1000;

    for (const bloon of this.bloons) {
      if (!bloon.active) continue;

      // Stun timer
      if (bloon.stunTimer > 0) {
        bloon.stunTimer -= deltaMs;
        continue; // stunned, don't move
      }

      // Slow timer
      let speedMult = 1;
      if (bloon.slowTimer > 0) {
        bloon.slowTimer -= deltaMs;
        speedMult = bloon.slowAmount;
      }

      // Market event speed mult
      speedMult *= this._eventSpeedMult;

      // Move along path
      const pixelsPerSec = BASE_BLOON_SPEED * bloon.speed * speedMult;
      const progressPerSec = pixelsPerSec / this.pathSystem.getPathLength();
      bloon.pathProgress += progressPerSec * deltaSec;

      // Update position
      const pos = this.pathSystem.getPositionAtProgress(bloon.pathProgress);
      bloon.x = pos.x;
      bloon.y = pos.y;

      // Reached end of path
      if (bloon.pathProgress >= 1) {
        bloon.active = false;
        const livesLost = bloon.bloonData.isMoab ? Math.ceil(bloon.bloonData.rbe / 10) : 1;
        this.lives -= livesLost;
      }
    }
  }

  spawnBloon(typeId, startProgress = 0, modifiers = null) {
    const bloonData = BLOON_TYPES[typeId];
    if (!bloonData) return null;

    let hp = bloonData.hp * this.hpMult * this._eventHPMult;
    if (modifiers?.fortified) hp *= 2;

    const pos = this.pathSystem.getPositionAtProgress(startProgress);

    const bloon = {
      id: this.nextBloonId++,
      typeId,
      bloonData,
      hp,
      maxHp: hp,
      speed: bloonData.speed,
      pathProgress: startProgress,
      x: pos.x,
      y: pos.y,
      active: true,
      isCamo: bloonData.isCamo || false,
      isMoab: bloonData.isMoab || false,
      isBoss: bloonData.isBoss || false,
      isCeramic: bloonData.isCeramic || false,
      stunTimer: 0,
      slowTimer: 0,
      slowAmount: 1,
      modifiers: modifiers || {},
      radius: bloonData.radius || 8,
    };

    this.bloons.push(bloon);
    return bloon;
  }

  popBloon(bloon) {
    if (!bloon.active) return;
    bloon.active = false;
    this.totalPops++;

    // Cash from pop
    const popCash = POP_CASH * this.cashMult * this._incomeMultiplier * this._eventPopIncomeMult;
    this.addCash(popCash);

    // Spawn children at same progress
    const children = bloon.bloonData.children || [];
    for (const childId of children) {
      this.spawnBloon(childId, bloon.pathProgress, bloon.modifiers);
    }
  }

  // =========== TOWERS ===========

  _updateTowers(deltaMs) {
    for (const tower of this.towers) {
      if (!tower.active) continue;

      tower.fireTimer += deltaMs;

      // Generator towers produce income
      if (tower.stats.isGenerator) {
        const effectiveFireRate = tower.stats.fireRate * (tower.stats._fireRateMult || 1) * this._eventFireRateMult;
        if (tower.fireTimer >= effectiveFireRate) {
          tower.fireTimer = 0;
          const income = Math.floor(tower.stats.incomePerTick * (tower.stats.incomeMultiplier || 1));
          this.addCash(income);
        }
        continue;
      }

      // Aura towers (ice/wojak) apply slow in range
      if (tower.stats.isAura) {
        const effectiveFireRate = tower.stats.fireRate * (tower.stats._fireRateMult || 1) * this._eventFireRateMult;
        if (tower.fireTimer >= effectiveFireRate) {
          tower.fireTimer = 0;
          this._applyAura(tower);
        }
        continue;
      }

      // Spike factory: place spikes on path
      if (tower.stats.isSpike) {
        const effectiveFireRate = tower.stats.fireRate * (tower.stats._fireRateMult || 1) * this._eventFireRateMult;
        if (tower.fireTimer >= effectiveFireRate) {
          tower.fireTimer = 0;
          this._placeSpike(tower);
        }
        continue;
      }

      // Normal towers: find target and fire
      if (tower.stats.range === 0) continue;

      const effectiveFireRate = tower.stats.fireRate * (tower.stats._fireRateMult || 1) * this._eventFireRateMult;
      if (tower.fireTimer < effectiveFireRate) continue;

      const target = this._findTarget(tower);
      if (!target) continue;

      tower.fireTimer = 0;
      const shots = tower.stats.multishot || 1;
      for (let i = 0; i < shots; i++) {
        this._fireProjectile(tower, target);
      }
    }
  }

  _findTarget(tower) {
    let best = null;
    let bestValue = null;

    for (const bloon of this.bloons) {
      if (!bloon.active) continue;
      if (bloon.isCamo && !tower.stats.canDetectCamo) continue;

      let dist = 0;
      if (!tower.stats.isSniper) {
        const dx = bloon.x - tower.x;
        const dy = bloon.y - tower.y;
        dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > tower.stats.range) continue;
      }

      let value;
      switch (tower.targetingMode) {
        case 'last':
          value = -bloon.pathProgress;
          break;
        case 'strong':
          value = bloon.hp;
          break;
        case 'close':
          if (tower.stats.isSniper) {
            value = bloon.pathProgress;
          } else {
            value = -dist;
          }
          break;
        case 'first':
        default:
          value = bloon.pathProgress;
          break;
      }

      if (bestValue === null || value > bestValue) {
        bestValue = value;
        best = bloon;
      }
    }

    return best;
  }

  _fireProjectile(tower, target) {
    const dx = target.x - tower.x;
    const dy = target.y - tower.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const proj = {
      x: tower.x,
      y: tower.y,
      dx: (dx / dist) * tower.stats.projectileSpeed,
      dy: (dy / dist) * tower.stats.projectileSpeed,
      speed: tower.stats.projectileSpeed,
      damage: tower.stats.damage * (tower._buffedDamageMult || 1) * (tower._synergyDamageMult || 1),
      pierce: tower.stats.pierce + (tower._synergyPierceBonus || 0),
      hitsLeft: tower.stats.pierce + (tower._synergyPierceBonus || 0),
      splashRadius: tower.stats.splashRadius || 0,
      damageType: tower.stats.damageType,
      moabDamageMult: tower.stats.moabDamageMult || 1,
      stunDuration: tower.stats.stunDuration || 0,
      slowAmount: tower.stats.slowAmount || 0,
      slowDuration: tower.stats.slowDuration || 0,
      sourceTowerId: tower.id,
      targetId: target.id,
      isHoming: tower.stats.isHoming || tower._synergyHoming || false,
      active: true,
      hitBloons: new Set(),
      lifetime: 0,
      isSniper: tower.stats.isSniper || false,
      isSpike: false,
    };

    // Snipers hit instantly
    if (tower.stats.isSniper) {
      this._hitBloon(proj, target, tower);
      return;
    }

    this.projectiles.push(proj);
  }

  _applyAura(tower) {
    for (const bloon of this.bloons) {
      if (!bloon.active) continue;
      if (bloon.isCamo && !tower.stats.canDetectCamo) continue;

      const dx = bloon.x - tower.x;
      const dy = bloon.y - tower.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= tower.stats.range) {
        bloon.slowTimer = tower.stats.slowDuration;
        bloon.slowAmount = tower.stats.slowAmount;

        if (tower.stats.freezeDamage > 0) {
          bloon.hp -= tower.stats.freezeDamage;
          if (bloon.hp <= 0) {
            if (tower.pops !== undefined) tower.pops++;
            this.popBloon(bloon);
          }
        }
      }
    }
  }

  _placeSpike(tower) {
    const progress = Math.random();
    const pos = this.pathSystem.getPositionAtProgress(progress);

    const spike = {
      x: pos.x,
      y: pos.y,
      dx: 0,
      dy: 0,
      speed: 0,
      damage: tower.stats.damage * (tower._synergyDamageMult || 1),
      pierce: tower.stats.pierce,
      hitsLeft: tower.stats.pierce,
      splashRadius: tower.stats.splashRadius || 0,
      damageType: tower.stats.damageType,
      moabDamageMult: tower.stats.moabDamageMult || 1,
      sourceTowerId: tower.id,
      active: true,
      hitBloons: new Set(),
      lifetime: 0,
      maxLifetime: 30000,
      isSpike: true,
      isSniper: false,
      isHoming: false,
      stunDuration: 0,
      slowAmount: 0,
      slowDuration: 0,
    };

    this.projectiles.push(spike);
  }

  // =========== HERO ===========

  _updateHero(deltaMs) {
    if (!this.hero || !this.hero.placed) return;

    this.hero.fireTimer += deltaMs;

    const mult = getHeroStatMult(this.hero.level);
    const effectiveFireRate = this.hero.stats.fireRate / mult;

    if (this.hero.fireTimer < effectiveFireRate) return;

    // Find target in range
    const range = this.hero.stats.range * mult;
    let best = null;
    let bestProgress = -1;

    for (const bloon of this.bloons) {
      if (!bloon.active) continue;
      if (bloon.isCamo && !this.hero.stats.canDetectCamo) continue;

      const dx = bloon.x - this.hero.x;
      const dy = bloon.y - this.hero.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= range && bloon.pathProgress > bestProgress) {
        best = bloon;
        bestProgress = bloon.pathProgress;
      }
    }

    if (!best) return;

    this.hero.fireTimer = 0;
    const damage = this.hero.stats.damage * mult;

    // Direct hit (simplified — hero fires instant projectile)
    const dx = best.x - this.hero.x;
    const dy = best.y - this.hero.y;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;

    const proj = {
      x: this.hero.x,
      y: this.hero.y,
      dx: (dx / dist) * this.hero.stats.projectileSpeed,
      dy: (dy / dist) * this.hero.stats.projectileSpeed,
      speed: this.hero.stats.projectileSpeed,
      damage,
      pierce: this.hero.stats.pierce,
      hitsLeft: this.hero.stats.pierce,
      splashRadius: 0,
      damageType: this.hero.stats.damageType,
      moabDamageMult: 1,
      stunDuration: 0,
      slowAmount: 0,
      slowDuration: 0,
      sourceTowerId: 'hero',
      targetId: best.id,
      isHoming: false,
      active: true,
      hitBloons: new Set(),
      lifetime: 0,
      isSniper: false,
      isSpike: false,
    };

    this.projectiles.push(proj);

    // Give XP to hero based on pops in range
    this._heroGainXP(1);
  }

  _heroGainXP(amount) {
    if (!this.hero || this.hero.level >= 20) return;
    this.hero.xp += amount;
    while (this.hero.level < 20 && this.hero.xp >= HERO_XP_TABLE[this.hero.level]) {
      this.hero.level++;
    }
  }

  // =========== PROJECTILES ===========

  _updateProjectiles(deltaMs) {
    const deltaSec = deltaMs / 1000;

    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const proj = this.projectiles[i];
      if (!proj.active) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Spikes don't move but expire
      if (proj.isSpike) {
        proj.lifetime += deltaMs;
        if (proj.lifetime >= (proj.maxLifetime || 30000)) {
          proj.active = false;
          this.projectiles.splice(i, 1);
          continue;
        }
        // Check collision with bloons passing over spike
        this._checkSpikeCollision(proj);
        if (!proj.active) {
          this.projectiles.splice(i, 1);
        }
        continue;
      }

      // Homing: steer toward target
      if (proj.isHoming && proj.targetId !== undefined) {
        const target = this.bloons.find(b => b.id === proj.targetId && b.active);
        if (target) {
          const dx = target.x - proj.x;
          const dy = target.y - proj.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          proj.dx = (dx / dist) * proj.speed;
          proj.dy = (dy / dist) * proj.speed;
        }
      }

      // Move
      proj.x += proj.dx * deltaSec * 60;
      proj.y += proj.dy * deltaSec * 60;
      proj.lifetime += deltaMs;

      // Out of bounds or too old
      if (proj.x < -50 || proj.x > CANVAS_WIDTH + 50 ||
          proj.y < -50 || proj.y > CANVAS_HEIGHT + 50 ||
          proj.lifetime > 5000) {
        proj.active = false;
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with bloons
      this._checkProjectileCollision(proj);
      if (!proj.active) {
        this.projectiles.splice(i, 1);
      }
    }
  }

  _checkProjectileCollision(proj) {
    for (const bloon of this.bloons) {
      if (!bloon.active) continue;
      if (proj.hitBloons.has(bloon.id)) continue;

      const dx = proj.x - bloon.x;
      const dy = proj.y - bloon.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitDist = 5 + bloon.radius;

      if (dist < hitDist) {
        const tower = this.towers.find(t => t.id === proj.sourceTowerId);
        this._hitBloon(proj, bloon, tower);
        proj.hitBloons.add(bloon.id);
        proj.hitsLeft--;

        if (proj.hitsLeft <= 0) {
          proj.active = false;
          return;
        }
      }
    }
  }

  _checkSpikeCollision(spike) {
    for (const bloon of this.bloons) {
      if (!bloon.active) continue;
      if (spike.hitBloons.has(bloon.id)) continue;

      const dx = spike.x - bloon.x;
      const dy = spike.y - bloon.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 15 + bloon.radius) {
        const tower = this.towers.find(t => t.id === spike.sourceTowerId);
        this._hitBloon(spike, bloon, tower);
        spike.hitBloons.add(bloon.id);
        spike.hitsLeft--;

        if (spike.hitsLeft <= 0) {
          spike.active = false;
          return;
        }
      }
    }
  }

  _hitBloon(proj, bloon, tower) {
    // Check immunity
    if (this._isImmune(proj.damageType, bloon)) return;

    let damage = proj.damage || 1;
    if (bloon.isMoab && proj.moabDamageMult) {
      damage *= proj.moabDamageMult;
    }

    bloon.hp -= damage;

    // Stun
    if (proj.stunDuration > 0) {
      bloon.stunTimer = Math.max(bloon.stunTimer, proj.stunDuration);
    }

    // Slow
    if (proj.slowAmount > 0) {
      bloon.slowTimer = proj.slowDuration || 1000;
      bloon.slowAmount = proj.slowAmount;
    }

    // Splash
    if (proj.splashRadius > 0) {
      this._applySplash(proj, bloon);
    }

    if (bloon.hp <= 0) {
      if (tower && tower.pops !== undefined) tower.pops++;
      this.popBloon(bloon);
      // Hero XP from pops
      if (this.hero && this.hero.placed) {
        const hdx = bloon.x - this.hero.x;
        const hdy = bloon.y - this.hero.y;
        const heroRange = this.hero.stats.range * getHeroStatMult(this.hero.level);
        if (hdx * hdx + hdy * hdy <= heroRange * heroRange) {
          this._heroGainXP(1);
        }
      }
    }
  }

  _isImmune(damageType, bloon) {
    const immunities = bloon.bloonData.immunities;
    if (!immunities || immunities.length === 0) return false;
    if (damageType === 'normal') return false;
    if (damageType === 'magic') {
      return immunities.some(i => i !== 'sharp' && i !== 'detection');
    }
    return immunities.includes(damageType);
  }

  _applySplash(proj, hitBloon) {
    for (const bloon of this.bloons) {
      if (!bloon.active || bloon === hitBloon) continue;
      if (this._isImmune(proj.damageType, bloon)) continue;

      const dx = hitBloon.x - bloon.x;
      const dy = hitBloon.y - bloon.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= proj.splashRadius) {
        let dmg = proj.damage || 1;
        if (bloon.isMoab && proj.moabDamageMult) dmg *= proj.moabDamageMult;
        bloon.hp -= dmg;
        if (proj.stunDuration > 0) {
          bloon.stunTimer = Math.max(bloon.stunTimer, proj.stunDuration);
        }
        if (bloon.hp <= 0) {
          const tower = this.towers.find(t => t.id === proj.sourceTowerId);
          if (tower && tower.pops !== undefined) tower.pops++;
          this.popBloon(bloon);
        }
      }
    }
  }

  // =========== ECONOMY ===========

  addCash(amount) {
    let mult = this.cashMult * this._incomeMultiplier;
    // Hero passive: Satoshi income boost
    if (this.hero?.placed && this.hero.heroDef.passive.type === 'incomeBoost') {
      mult *= (1 + this.hero.heroDef.passive.value);
    }
    this.money += Math.floor(amount * mult);
  }

  // =========== SYNERGIES ===========

  _checkSynergies() {
    // Reset synergy buffs
    for (const tower of this.towers) {
      tower._synergyDamageMult = 1;
      tower._synergyIncomeMult = 1;
      tower._synergyRangeMult = 1;
      tower._synergyFireRateMult = 1;
      tower._synergyHoming = false;
      tower._synergyPierceBonus = 0;
    }

    this.activeSynergies = [];

    for (const synDef of SYNERGY_DEFS) {
      const matches = this._findSynergyMatches(synDef);
      for (const match of matches) {
        this.activeSynergies.push(synDef.id);
        for (const tower of match) {
          const effects = synDef.effects[tower.towerId];
          if (!effects) continue;
          if (effects.damageMult) tower._synergyDamageMult *= effects.damageMult;
          if (effects.rangeMult) tower._synergyRangeMult *= effects.rangeMult;
          if (effects.fireRateMult) tower._synergyFireRateMult *= effects.fireRateMult;
          if (effects.isHoming) tower._synergyHoming = true;
          if (effects.pierceBonusFlat) tower._synergyPierceBonus += effects.pierceBonusFlat;
          if (effects.incomeMult) tower._synergyIncomeMult *= effects.incomeMult;
        }
      }
    }
  }

  _findSynergyMatches(synDef) {
    const towers = this.towers.filter(t => t.active);
    const matches = [];

    if (synDef.id === 'fullSend') {
      const darts = towers.filter(t => t.towerId === 'dart');
      if (darts.length < 3) return matches;
      for (let i = 0; i < darts.length - 2; i++) {
        for (let j = i + 1; j < darts.length - 1; j++) {
          for (let k = j + 1; k < darts.length; k++) {
            if (this._towerInRange(darts[i], darts[j]) &&
                this._towerInRange(darts[j], darts[k]) &&
                this._towerInRange(darts[i], darts[k])) {
              matches.push([darts[i], darts[j], darts[k]]);
              return matches;
            }
          }
        }
      }
      return matches;
    }

    if (synDef.minOtherTowers) {
      const alchs = towers.filter(t => t.towerId === 'alchemist');
      for (const alch of alchs) {
        const nearby = towers.filter(t => t !== alch && this._towerInRange(alch, t));
        if (nearby.length >= synDef.minOtherTowers) {
          matches.push([alch, ...nearby.slice(0, synDef.minOtherTowers)]);
        }
      }
      return matches;
    }

    const [typeA, typeB] = synDef.requires;
    const towersA = towers.filter(t => t.towerId === typeA);
    const towersB = towers.filter(t => t.towerId === typeB);
    for (const a of towersA) {
      for (const b of towersB) {
        if (a === b) continue;
        if (this._towerInRange(a, b)) {
          matches.push([a, b]);
          return matches;
        }
      }
    }
    return matches;
  }

  _towerInRange(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy <= SYNERGY_RANGE * SYNERGY_RANGE;
  }

  // =========== MARKET EVENTS ===========

  _rollMarketEvent() {
    const mes = this.marketEventSystem;
    const available = MARKET_EVENTS.filter(e => !mes.recentEvents.includes(e.id));
    if (available.length === 0) return;

    const event = available[Math.floor(Math.random() * available.length)];
    mes.activeEvent = event;
    mes.wavesRemaining = event.duration;
    mes.wavesSinceLastEvent = 0;
    mes.nextEventIn = 8 + Math.floor(Math.random() * 5);
    mes.recentEvents.push(event.id);
    if (mes.recentEvents.length > 3) mes.recentEvents.shift();

    // Apply effect
    this[event.field] = event.value;
    if (event.onApply) event.onApply(this);
  }

  _removeMarketEvent() {
    const mes = this.marketEventSystem;
    if (!mes.activeEvent) return;
    this[mes.activeEvent.field] = mes.activeEvent.defaultValue;
    mes.activeEvent = null;
    mes.wavesRemaining = 0;
  }

  // =========== ACTIONS ===========

  _applyAction(action) {
    if (!action || action.type === 'noop') return { success: true, type: 'noop' };

    switch (action.type) {
      case 'place_tower': return this._placeTower(action);
      case 'upgrade_tower': return this._upgradeTower(action);
      case 'sell_tower': return this._sellTower(action);
      case 'start_wave': return this._startWave();
      case 'change_targeting': return this._changeTargeting(action);
      case 'place_hero': return this._placeHero(action);
      case 'activate_ability': return this._activateAbility(action);
      default: return { success: false, error: `Unknown action type: ${action.type}` };
    }
  }

  _placeTower(action) {
    const { towerId, x, y } = action;
    const def = TOWER_TYPES[towerId];
    if (!def) return { success: false, error: `Unknown tower: ${towerId}` };

    // Challenge: allowed/banned towers
    if (this.challengeRules.allowedTowers && !this.challengeRules.allowedTowers.includes(towerId)) {
      return { success: false, error: `Tower ${towerId} not allowed in this challenge` };
    }
    if (this.challengeRules.bannedTowers && this.challengeRules.bannedTowers.includes(towerId)) {
      return { success: false, error: `Tower ${towerId} banned in this challenge` };
    }

    // Cost
    const cost = Math.floor(def.cost * this._costMultiplier);
    if (this.money < cost) return { success: false, error: 'Not enough money' };

    // Bounds check
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) {
      return { success: false, error: 'Out of bounds' };
    }

    // Path check
    if (this.pathSystem.isOnPath(x, y, TOWER_FOOTPRINT)) {
      return { success: false, error: 'Cannot place on path' };
    }

    // Overlap check with existing towers
    for (const t of this.towers) {
      if (!t.active) continue;
      const dx = t.x - x;
      const dy = t.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < TOWER_FOOTPRINT * 2) {
        return { success: false, error: 'Too close to another tower' };
      }
    }

    // Check hero overlap
    if (this.hero?.placed) {
      const dx = this.hero.x - x;
      const dy = this.hero.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < TOWER_FOOTPRINT * 2) {
        return { success: false, error: 'Too close to hero' };
      }
    }

    this.money -= cost;

    const tower = {
      id: this.nextTowerId++,
      towerId,
      x, y,
      active: true,
      stats: {
        range: def.range,
        fireRate: def.fireRate,
        damage: def.damage,
        pierce: def.pierce,
        projectileSpeed: def.projectileSpeed,
        damageType: def.damageType,
        canDetectCamo: def.canDetectCamo,
        splashRadius: def.splashRadius || 0,
        isAura: def.isAura || false,
        isGenerator: def.isGenerator || false,
        isSniper: def.isSniper || false,
        isSpike: def.isSpike || false,
        isHoming: def.isHoming || false,
        isBoomerang: def.isBoomerang || false,
        isBuffer: def.isBuffer || false,
        slowAmount: def.slowAmount || 0,
        slowDuration: def.slowDuration || 0,
        incomePerTick: def.incomePerTick || 0,
        incomeMultiplier: 1,
        multishot: 1,
        stunDuration: 0,
        moabDamageMult: 1,
        freezeDamage: 0,
        decamoRange: 0,
        supplyDropIncome: 0,
        supplyDropInterval: 0,
        buffDamageMult: def.buffDamageMult || 1,
        buffFireRateMult: def.buffFireRateMult || 1,
        buffRange: def.buffRange || 0,
        projectileColor: def.projectileColor,
        _fireRateMult: 1,
      },
      upgradeLevels: { path1: 0, path2: 0, path3: 0 },
      targetingMode: 'first',
      pops: 0,
      totalSpent: cost,
      baseCost: def.cost,
      fireTimer: 0,
      _buffedDamageMult: 1,
      _synergyDamageMult: 1,
      _synergyIncomeMult: 1,
      _synergyRangeMult: 1,
      _synergyFireRateMult: 1,
      _synergyHoming: false,
      _synergyPierceBonus: 0,
    };

    this.towers.push(tower);
    this._checkSynergies();

    return { success: true, towerId: tower.id };
  }

  _upgradeTower(action) {
    const { towerIndex, path, tier } = action;
    const tower = this.towers[towerIndex];
    if (!tower || !tower.active) return { success: false, error: 'Invalid tower' };

    if (this.challengeRules.canUpgrade === false) {
      return { success: false, error: 'Upgrades disabled in this challenge' };
    }

    const def = TOWER_TYPES[tower.towerId];
    if (!def.upgrades[path]) return { success: false, error: `Invalid path: ${path}` };

    const currentLevel = tower.upgradeLevels[path];
    const targetTier = tier !== undefined ? tier : currentLevel + 1;
    if (targetTier !== currentLevel + 1) {
      return { success: false, error: `Must upgrade sequentially. Current: ${currentLevel}, requested: ${targetTier}` };
    }

    const upgrades = def.upgrades[path];
    if (targetTier < 1 || targetTier > upgrades.length) {
      return { success: false, error: `Invalid tier: ${targetTier}` };
    }

    // One-path challenge
    if (this.challengeRules.onePathPerType) {
      const usedPaths = Object.entries(tower.upgradeLevels)
        .filter(([, level]) => level > 0)
        .map(([p]) => p);
      if (usedPaths.length > 0 && !usedPaths.includes(path)) {
        return { success: false, error: 'One path per tower type in this challenge' };
      }
    }

    const upgrade = upgrades[targetTier - 1];
    const cost = Math.floor(upgrade.cost * this._costMultiplier);
    if (this.money < cost) return { success: false, error: 'Not enough money' };

    this.money -= cost;
    tower.totalSpent += cost;
    tower.upgradeLevels[path] = targetTier;

    // Apply effects
    const effects = upgrade.effects;
    if (effects.damage !== undefined) tower.stats.damage = effects.damage;
    if (effects.pierce !== undefined) tower.stats.pierce = effects.pierce;
    if (effects.fireRateMult !== undefined) tower.stats._fireRateMult = effects.fireRateMult;
    if (effects.rangeMult !== undefined) tower.stats.range = def.range * effects.rangeMult;
    if (effects.splashRadius !== undefined) tower.stats.splashRadius = effects.splashRadius;
    if (effects.canDetectCamo !== undefined) tower.stats.canDetectCamo = effects.canDetectCamo;
    if (effects.multishot !== undefined) tower.stats.multishot = effects.multishot;
    if (effects.stunDuration !== undefined) tower.stats.stunDuration = effects.stunDuration;
    if (effects.moabDamageMult !== undefined) tower.stats.moabDamageMult = effects.moabDamageMult;
    if (effects.incomePerTick !== undefined) tower.stats.incomePerTick = effects.incomePerTick;
    if (effects.incomeMultiplier !== undefined) tower.stats.incomeMultiplier = effects.incomeMultiplier;
    if (effects.slowAmount !== undefined) tower.stats.slowAmount = effects.slowAmount;
    if (effects.slowDuration !== undefined) tower.stats.slowDuration = effects.slowDuration;
    if (effects.freezeDamage !== undefined) tower.stats.freezeDamage = effects.freezeDamage;
    if (effects.damageType !== undefined) tower.stats.damageType = effects.damageType;
    if (effects.decamoRange !== undefined) tower.stats.decamoRange = effects.decamoRange;
    if (effects.supplyDropIncome !== undefined) tower.stats.supplyDropIncome = effects.supplyDropIncome;
    if (effects.supplyDropInterval !== undefined) tower.stats.supplyDropInterval = effects.supplyDropInterval;
    if (effects.buffDamageMult !== undefined) tower.stats.buffDamageMult = effects.buffDamageMult;
    if (effects.buffFireRateMult !== undefined) tower.stats.buffFireRateMult = effects.buffFireRateMult;
    if (effects.buffRange !== undefined) tower.stats.buffRange = effects.buffRange;
    if (effects.autoCollect !== undefined) tower.stats.autoCollect = effects.autoCollect;

    this._checkSynergies();
    return { success: true, upgrade: upgrade.name };
  }

  _sellTower(action) {
    const { towerIndex } = action;
    const tower = this.towers[towerIndex];
    if (!tower || !tower.active) return { success: false, error: 'Invalid tower' };

    if (this.challengeRules.canSell === false) {
      return { success: false, error: 'Selling disabled in this challenge' };
    }

    const sellValue = Math.floor(tower.totalSpent * this._sellMultiplier);
    this.money += sellValue;
    tower.active = false;

    this._checkSynergies();
    return { success: true, cashBack: sellValue };
  }

  _startWave() {
    const started = this.waveSystem.startWave();
    if (!started) return { success: false, error: 'Cannot start wave' };
    return { success: true, wave: this.waveSystem.currentWave + 1 };
  }

  _changeTargeting(action) {
    const { towerIndex, mode } = action;
    const tower = this.towers[towerIndex];
    if (!tower || !tower.active) return { success: false, error: 'Invalid tower' };

    const validModes = ['first', 'last', 'strong', 'close'];
    if (!validModes.includes(mode)) return { success: false, error: `Invalid targeting mode: ${mode}` };

    tower.targetingMode = mode;
    return { success: true };
  }

  _placeHero(action) {
    if (!this.hero) return { success: false, error: 'No hero selected' };
    if (this.hero.placed) return { success: false, error: 'Hero already placed' };

    const { x, y } = action;
    if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) {
      return { success: false, error: 'Out of bounds' };
    }
    if (this.pathSystem.isOnPath(x, y, TOWER_FOOTPRINT)) {
      return { success: false, error: 'Cannot place on path' };
    }
    for (const t of this.towers) {
      if (!t.active) continue;
      const dx = t.x - x;
      const dy = t.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < TOWER_FOOTPRINT * 2) {
        return { success: false, error: 'Too close to a tower' };
      }
    }

    this.hero.x = x;
    this.hero.y = y;
    this.hero.placed = true;
    return { success: true };
  }

  _activateAbility(action) {
    // Simplified: ability activation is a no-op placeholder for now
    return { success: false, error: 'Abilities not yet implemented in headless mode' };
  }

  // =========== OBSERVATION ===========

  getObservation() {
    const activeBloons = this.bloons.filter(b => b.active);

    return {
      game: {
        wave: this.waveSystem.currentWave + 1,
        totalWaves: this.waveSystem.totalWaves,
        lives: this.lives,
        money: this.money,
        gameTime: Math.round(this.gameTime),
        gameOver: this.gameOver,
        gameWon: this.gameWon,
        freeplay: this.waveSystem.freeplay,
      },
      towers: this.towers.filter(t => t.active).map(t => ({
        id: t.id,
        type: t.towerId,
        x: Math.round(t.x),
        y: Math.round(t.y),
        upgrades: [t.upgradeLevels.path1, t.upgradeLevels.path2, t.upgradeLevels.path3],
        pops: t.pops,
        targeting: t.targetingMode,
        range: Math.round(t.stats.range),
        damage: t.stats.damage,
      })),
      bloons: activeBloons.slice(0, 200).map(b => ({
        id: b.id,
        type: b.typeId,
        hp: Math.round(b.hp),
        maxHp: Math.round(b.maxHp),
        progress: Math.round(b.pathProgress * 1000) / 1000,
        speed: b.speed,
        camo: b.isCamo,
        moab: b.isMoab,
        boss: b.isBoss,
        stunned: b.stunTimer > 0,
        slowed: b.slowTimer > 0,
        x: Math.round(b.x),
        y: Math.round(b.y),
      })),
      bloonCount: activeBloons.length,
      projectileCount: this.projectiles.filter(p => p.active).length,
      hero: this.hero ? {
        type: this.hero.heroId,
        level: this.hero.level,
        xp: this.hero.xp,
        placed: this.hero.placed,
        x: Math.round(this.hero.x),
        y: Math.round(this.hero.y),
      } : null,
      synergies: [...new Set(this.activeSynergies)],
      marketEvent: this.marketEventSystem.activeEvent ? {
        name: this.marketEventSystem.activeEvent.name,
        description: this.marketEventSystem.activeEvent.description,
        wavesRemaining: this.marketEventSystem.wavesRemaining,
      } : null,
      waveActive: this.waveSystem.waveActive,
      spawning: this.waveSystem.spawning,
      wavePreview: this.waveSystem.getWavePreview(),
    };
  }

  // =========== VALID ACTIONS ===========

  getValidActions() {
    const actions = [];

    // Noop
    actions.push({ type: 'noop' });

    // Start wave (if not currently spawning)
    if (!this.waveSystem.spawning) {
      if (this.waveSystem.freeplay || this.waveSystem.currentWave < this.waveSystem.totalWaves) {
        actions.push({ type: 'start_wave' });
      }
    }

    // Place hero
    if (this.hero && !this.hero.placed) {
      // Return a sample of valid positions (every other grid cell)
      for (let gx = 1; gx < GRID_COLS - 1; gx += 2) {
        for (let gy = 1; gy < GRID_ROWS - 1; gy += 2) {
          const x = gx * CELL_SIZE + CELL_SIZE / 2;
          const y = gy * CELL_SIZE + CELL_SIZE / 2;
          if (!this._isPlacementBlocked(x, y)) {
            actions.push({ type: 'place_hero', x, y });
          }
        }
      }
    }

    // Place towers (sample grid positions for affordable towers)
    const towerTypes = Object.keys(TOWER_TYPES);
    const affordableTowers = towerTypes.filter(id => {
      const cost = Math.floor(TOWER_TYPES[id].cost * this._costMultiplier);
      if (this.money < cost) return false;
      if (this.challengeRules.allowedTowers && !this.challengeRules.allowedTowers.includes(id)) return false;
      if (this.challengeRules.bannedTowers && this.challengeRules.bannedTowers.includes(id)) return false;
      return true;
    });

    if (affordableTowers.length > 0) {
      // Sample placement positions on grid
      for (let gx = 0; gx < GRID_COLS; gx += 2) {
        for (let gy = 0; gy < GRID_ROWS; gy += 2) {
          const x = gx * CELL_SIZE + CELL_SIZE / 2;
          const y = gy * CELL_SIZE + CELL_SIZE / 2;
          if (!this._isPlacementBlocked(x, y)) {
            for (const towerId of affordableTowers) {
              actions.push({ type: 'place_tower', towerId, x, y });
            }
          }
        }
      }
    }

    // Tower upgrades and sells
    for (let i = 0; i < this.towers.length; i++) {
      const tower = this.towers[i];
      if (!tower.active) continue;

      // Sell
      if (this.challengeRules.canSell !== false) {
        actions.push({ type: 'sell_tower', towerIndex: i });
      }

      // Targeting
      const modes = ['first', 'last', 'strong', 'close'];
      for (const mode of modes) {
        if (mode !== tower.targetingMode) {
          actions.push({ type: 'change_targeting', towerIndex: i, mode });
        }
      }

      // Upgrades
      if (this.challengeRules.canUpgrade !== false) {
        const def = TOWER_TYPES[tower.towerId];
        for (const path of ['path1', 'path2', 'path3']) {
          const currentLevel = tower.upgradeLevels[path];
          const upgrades = def.upgrades[path];
          if (currentLevel < upgrades.length) {
            const upgrade = upgrades[currentLevel];
            const cost = Math.floor(upgrade.cost * this._costMultiplier);
            if (this.money >= cost) {
              // One-path challenge check
              if (this.challengeRules.onePathPerType) {
                const usedPaths = Object.entries(tower.upgradeLevels)
                  .filter(([, level]) => level > 0)
                  .map(([p]) => p);
                if (usedPaths.length > 0 && !usedPaths.includes(path)) continue;
              }
              actions.push({ type: 'upgrade_tower', towerIndex: i, path, tier: currentLevel + 1 });
            }
          }
        }
      }
    }

    return actions;
  }

  _isPlacementBlocked(x, y) {
    if (this.pathSystem.isOnPath(x, y, TOWER_FOOTPRINT)) return true;

    for (const t of this.towers) {
      if (!t.active) continue;
      const dx = t.x - x;
      const dy = t.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < TOWER_FOOTPRINT * 2) return true;
    }

    if (this.hero?.placed) {
      const dx = this.hero.x - x;
      const dy = this.hero.y - y;
      if (Math.sqrt(dx * dx + dy * dy) < TOWER_FOOTPRINT * 2) return true;
    }

    return false;
  }
}
