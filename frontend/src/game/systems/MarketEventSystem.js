import eventBus from '../GameEventBus';

const EVENTS = [
  {
    id: 'bullRun',
    name: 'Bull Run',
    description: 'All bloons +30% speed',
    duration: 3,
    apply: (scene) => { scene._eventSpeedMult = 1.3; },
    remove: (scene) => { scene._eventSpeedMult = 1; },
  },
  {
    id: 'flashCrash',
    name: 'Flash Crash',
    description: 'All towers fire 25% slower',
    duration: 3,
    apply: (scene) => { scene._eventFireRateMult = 1.25; },
    remove: (scene) => { scene._eventFireRateMult = 1; },
  },
  {
    id: 'airdrop',
    name: 'Airdrop',
    description: '+$500 instant + all income 2x',
    duration: 2,
    apply: (scene) => {
      scene.economySystem.addCash(500);
      scene.economySystem.incomeMultiplier *= 2;
    },
    remove: (scene) => {
      scene.economySystem.incomeMultiplier /= 2;
    },
  },
  {
    id: 'gasWar',
    name: 'Gas War',
    description: 'Tower placement costs +40%',
    duration: 3,
    apply: (scene) => { scene.economySystem.costMultiplier *= 1.4; },
    remove: (scene) => { scene.economySystem.costMultiplier /= 1.4; },
  },
  {
    id: 'rugAlert',
    name: 'Rug Alert',
    description: 'Random bloons gain camo mid-path',
    duration: 2,
    apply: (scene) => { scene._eventRugAlert = true; },
    remove: (scene) => { scene._eventRugAlert = false; },
  },
  {
    id: 'defiSummer',
    name: 'DeFi Summer',
    description: 'Tower sell value = 90% (up from 70%)',
    duration: 3,
    apply: (scene) => { scene.economySystem.sellMultiplier = 0.9; },
    remove: (scene) => { scene.economySystem.sellMultiplier = 0.7; },
  },
  {
    id: 'mergeSeason',
    name: 'Merge Season',
    description: 'Bloons have +50% HP',
    duration: 2,
    apply: (scene) => { scene._eventHPMult = 1.5; },
    remove: (scene) => { scene._eventHPMult = 1; },
  },
  {
    id: 'halving',
    name: 'Halving',
    description: 'Pop income halved, wave bonus doubled',
    duration: 3,
    apply: (scene) => {
      scene._eventPopIncomeMult = 0.5;
      scene._eventWaveBonusMult = 2;
    },
    remove: (scene) => {
      scene._eventPopIncomeMult = 1;
      scene._eventWaveBonusMult = 1;
    },
  },
];

export default class MarketEventSystem {
  constructor(scene) {
    this.scene = scene;
    this.activeEvent = null;
    this.wavesRemaining = 0;
    this.recentEvents = []; // last 3 event IDs, to prevent repeats
    this.nextEventIn = this.rollNextInterval(); // waves until next event
    this.wavesSinceLastEvent = 0;
  }

  rollNextInterval() {
    return 8 + Math.floor(Math.random() * 5); // 8-12 waves
  }

  onWaveStart(waveNum) {
    // Apply rug alert: random bloons gain camo
    if (this.scene._eventRugAlert) {
      // Will be applied to spawned bloons in GameScene
    }
  }

  onWaveComplete() {
    // Decrement active event duration
    if (this.activeEvent) {
      this.wavesRemaining--;
      if (this.wavesRemaining <= 0) {
        this.removeEvent();
      } else {
        eventBus.emit('marketEvent', {
          name: this.activeEvent.name,
          description: this.activeEvent.description,
          wavesRemaining: this.wavesRemaining,
        });
      }
    }

    // Check if it's time for a new event
    this.wavesSinceLastEvent++;
    if (!this.activeEvent && this.wavesSinceLastEvent >= this.nextEventIn) {
      this.rollEvent();
    }
  }

  rollEvent() {
    // Filter out recent events
    const available = EVENTS.filter(e => !this.recentEvents.includes(e.id));
    if (available.length === 0) return;

    const event = available[Math.floor(Math.random() * available.length)];
    this.applyEvent(event);
  }

  applyEvent(event) {
    this.activeEvent = event;
    this.wavesRemaining = event.duration;
    this.wavesSinceLastEvent = 0;
    this.nextEventIn = this.rollNextInterval();

    // Track recent
    this.recentEvents.push(event.id);
    if (this.recentEvents.length > 3) this.recentEvents.shift();

    // Apply effect
    event.apply(this.scene);

    eventBus.emit('marketEvent', {
      name: event.name,
      description: event.description,
      wavesRemaining: this.wavesRemaining,
    });
  }

  removeEvent() {
    if (!this.activeEvent) return;
    this.activeEvent.remove(this.scene);
    this.activeEvent = null;
    this.wavesRemaining = 0;
    eventBus.emit('marketEventEnd');
  }
}
