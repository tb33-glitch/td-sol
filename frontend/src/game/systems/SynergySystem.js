import eventBus from '../GameEventBus';

// Synergy definitions — tower proximity combos within range 100
const SYNERGY_DEFS = [
  {
    id: 'pumpAndDump',
    name: 'Pump & Dump',
    description: 'Boom +20% dmg, Suit +15% income',
    flavor: 'Explosive growth!',
    requires: ['bomb', 'banana'],
    effects: {
      bomb: { damageMult: 1.2 },
      banana: { incomeMult: 1.15 },
    },
  },
  {
    id: 'coldStorage',
    name: 'Cold Storage',
    description: 'Ice slow +30% duration, Sniper +2 pierce vs frozen',
    flavor: 'Locked and loaded',
    requires: ['ice', 'sniper'],
    effects: {
      ice: { slowDurationMult: 1.3 },
      sniper: { pierceBonusVsFrozen: 2 },
    },
  },
  {
    id: 'arcaneProtocol',
    name: 'Arcane Protocol',
    description: 'Both +15% range, Wizard projectiles become homing',
    flavor: 'Magic hack',
    requires: ['wizard', 'mev'],
    effects: {
      wizard: { rangeMult: 1.15, isHoming: true },
      mev: { rangeMult: 1.15 },
    },
  },
  {
    id: 'defiStack',
    name: 'DeFi Stack',
    description: 'Alchemist buff strength +25%',
    flavor: 'Composability',
    requires: ['alchemist'],
    minOtherTowers: 2, // alchemist + 2 others nearby
    effects: {
      alchemist: { buffStrengthMult: 1.25 },
    },
  },
  {
    id: 'exitLiquidity',
    name: 'Exit Liquidity',
    description: 'Flipper +1 bounce, Spikes last 2x longer',
    flavor: 'Trap & return',
    requires: ['flipper', 'spikefactory'],
    effects: {
      flipper: { pierceBonusFlat: 1 },
      spikefactory: { spikeDurationMult: 2.0 },
    },
  },
  {
    id: 'fullSend',
    name: 'Full Send',
    description: 'All 3 gain +30% attack speed',
    flavor: 'Spam meta',
    requires: ['dart', 'dart', 'dart'], // Need 3 darts
    effects: {
      dart: { fireRateMult: 0.7 },
    },
  },
];

const SYNERGY_RANGE = 100;

export default class SynergySystem {
  constructor(scene) {
    this.scene = scene;
    this.activeSynergies = []; // { synergy, towers }
  }

  checkSynergies() {
    // Clear all existing synergy buffs
    for (const tower of this.scene.towers) {
      if (tower.synergies) {
        for (const syn of tower.synergies) {
          this.removeSynergyBuff(tower, syn);
        }
      }
      tower.synergies = [];
    }

    this.activeSynergies = [];

    // Check each synergy definition
    for (const synDef of SYNERGY_DEFS) {
      const matches = this.findSynergyMatches(synDef);
      for (const match of matches) {
        this.activeSynergies.push({ synergy: synDef, towers: match });
        // Apply buffs
        for (const tower of match) {
          const effectKey = tower.towerId;
          if (synDef.effects[effectKey]) {
            this.applySynergyBuff(tower, synDef);
            tower.synergies.push(synDef);
          }
        }
      }
    }

    eventBus.emit('synergiesChanged', this.activeSynergies.map(s => ({
      id: s.synergy.id,
      name: s.synergy.name,
      description: s.synergy.description,
      flavor: s.synergy.flavor,
    })));
  }

  findSynergyMatches(synDef) {
    const towers = this.scene.towers;
    const matches = [];

    if (synDef.id === 'fullSend') {
      // Special: need 3 darts near each other
      const darts = towers.filter(t => t.towerId === 'dart');
      if (darts.length < 3) return matches;

      // Check if any 3 darts are all within range of each other
      for (let i = 0; i < darts.length - 2; i++) {
        for (let j = i + 1; j < darts.length - 1; j++) {
          for (let k = j + 1; k < darts.length; k++) {
            if (this.inRange(darts[i], darts[j]) &&
                this.inRange(darts[j], darts[k]) &&
                this.inRange(darts[i], darts[k])) {
              matches.push([darts[i], darts[j], darts[k]]);
              return matches; // Only one full-send group
            }
          }
        }
      }
      return matches;
    }

    if (synDef.minOtherTowers) {
      // DeFi Stack: alchemist + N others nearby
      const alchs = towers.filter(t => t.towerId === 'alchemist');
      for (const alch of alchs) {
        const nearby = towers.filter(t => t !== alch && this.inRange(alch, t));
        if (nearby.length >= synDef.minOtherTowers) {
          matches.push([alch, ...nearby.slice(0, synDef.minOtherTowers)]);
        }
      }
      return matches;
    }

    // Standard 2-tower synergy
    const [typeA, typeB] = synDef.requires;
    const towersA = towers.filter(t => t.towerId === typeA);
    const towersB = towers.filter(t => t.towerId === typeB);

    for (const a of towersA) {
      for (const b of towersB) {
        if (a === b) continue;
        if (this.inRange(a, b)) {
          matches.push([a, b]);
          return matches; // One match per synergy type
        }
      }
    }

    return matches;
  }

  inRange(a, b) {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy <= SYNERGY_RANGE * SYNERGY_RANGE;
  }

  applySynergyBuff(tower, synDef) {
    const effects = synDef.effects[tower.towerId];
    if (!effects) return;

    if (effects.damageMult) {
      tower._synergyDamageMult = (tower._synergyDamageMult || 1) * effects.damageMult;
    }
    if (effects.incomeMult) {
      tower._synergyIncomeMult = (tower._synergyIncomeMult || 1) * effects.incomeMult;
    }
    if (effects.rangeMult) {
      tower._synergyRangeMult = (tower._synergyRangeMult || 1) * effects.rangeMult;
    }
    if (effects.fireRateMult) {
      tower._synergyFireRateMult = (tower._synergyFireRateMult || 1) * effects.fireRateMult;
    }
    if (effects.isHoming) {
      tower._synergyHoming = true;
    }
    if (effects.pierceBonusFlat) {
      tower._synergyPierceBonus = (tower._synergyPierceBonus || 0) + effects.pierceBonusFlat;
    }
    if (effects.slowDurationMult) {
      tower._synergySlowDurMult = (tower._synergySlowDurMult || 1) * effects.slowDurationMult;
    }
    if (effects.buffStrengthMult) {
      tower._synergyBuffStrengthMult = (tower._synergyBuffStrengthMult || 1) * effects.buffStrengthMult;
    }
  }

  removeSynergyBuff(tower) {
    tower._synergyDamageMult = 1;
    tower._synergyIncomeMult = 1;
    tower._synergyRangeMult = 1;
    tower._synergyFireRateMult = 1;
    tower._synergyHoming = false;
    tower._synergyPierceBonus = 0;
    tower._synergySlowDurMult = 1;
    tower._synergyBuffStrengthMult = 1;
  }
}
