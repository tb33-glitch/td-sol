import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import GameScene from './scenes/GameScene';

export function createGameConfig(parent, mapId = 'meadow') {
  return {
    type: Phaser.CANVAS,
    parent,
    width: 900,
    height: 600,
    backgroundColor: '#333333',
    scene: [BootScene, GameScene],
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
      },
    },
  };
}
