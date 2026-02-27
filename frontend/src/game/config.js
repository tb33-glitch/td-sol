import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';
import SandboxScene from './scenes/SandboxScene';

export function createGameConfig(parent, mapId = 'meadow', difficulty = 'medium', options = {}) {
  const scenes = options.sandbox ? [BootScene, SandboxScene] : [BootScene, GameScene];

  return {
    type: Phaser.CANVAS,
    parent,
    width: 900,
    height: 600,
    backgroundColor: '#333333',
    scene: scenes,
    physics: {
      default: 'arcade',
      arcade: {
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    // Pass custom data to scenes
    callbacks: {
      preBoot: (game) => {
        game.registry.set('mapId', mapId);
        game.registry.set('difficulty', difficulty);
        if (options.heroId) game.registry.set('heroId', options.heroId);
        if (options.challenge) game.registry.set('challenge', options.challenge);
        if (options.sandbox) game.registry.set('sandbox', true);
      },
    },
  };
}
