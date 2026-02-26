import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    // No external assets needed — everything is drawn with graphics
    // Show a loading bar for future asset loading
    const { width, height } = this.scale;

    const barW = 300;
    const barH = 20;
    const barX = (width - barW) / 2;
    const barY = height / 2;

    const bg = this.add.graphics();
    bg.fillStyle(0x222222, 1);
    bg.fillRect(barX, barY, barW, barH);

    const fill = this.add.graphics();

    this.load.on('progress', (value) => {
      fill.clear();
      fill.fillStyle(0x44aa44, 1);
      fill.fillRect(barX + 2, barY + 2, (barW - 4) * value, barH - 4);
    });

    this.load.on('complete', () => {
      bg.destroy();
      fill.destroy();
    });

    // Placeholder load to trigger progress events
    // In future, load sprite sheets / audio here
  }

  create() {
    this.scene.start('GameScene');
  }
}
