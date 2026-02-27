import Phaser from 'phaser';
import { generateAllSprites } from '../sprites/SpriteRenderer';
import { getPitHoldings } from '../../services/pitService';
import { preloadPitImages } from '../../services/pitImageLoader';
import { mapTokensToTiers } from '../../services/tierMapper';
import eventBus from '../GameEventBus';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  preload() {
    const { width, height } = this.scale;

    // Loading bar
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
  }

  async create() {
    // Generate all procedural pixel art sprites as fallback
    generateAllSprites(this);

    // Attempt to load pit tokens (non-blocking — game works without them)
    try {
      await this.loadPitData();
    } catch (err) {
      console.warn('[BootScene] Pit data loading failed, using fallback sprites:', err);
    }

    // Start correct scene based on mode
    const sandbox = this.registry.get('sandbox');
    this.scene.start(sandbox ? 'SandboxScene' : 'GameScene');
  }

  async loadPitData() {
    const { width, height } = this.scale;

    // Show loading text
    const loadingText = this.add.text(width / 2, height / 2 + 40, 'Raiding The Pit...', {
      fontSize: '14px',
      fill: '#aaaaaa',
      fontFamily: 'monospace',
    }).setOrigin(0.5);

    eventBus.emit('pitLoadingStart');

    const holdings = await getPitHoldings();
    if (holdings.total === 0) {
      loadingText.destroy();
      eventBus.emit('pitLoadingEnd', { count: 0 });
      return;
    }

    loadingText.setText(`Loading ${holdings.total} dead tokens...`);

    // Preload images
    const imageMap = await preloadPitImages(holdings);

    if (imageMap.size === 0) {
      loadingText.destroy();
      eventBus.emit('pitLoadingEnd', { count: 0 });
      return;
    }

    // Map tokens to bloon tiers
    const tierData = mapTokensToTiers(holdings, imageMap);

    // Draw each loaded image onto 32x32 canvases and register as Phaser textures
    for (const [key, entry] of imageMap) {
      const textureKey = `pit_${key}`;
      if (this.textures.exists(textureKey)) continue;

      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');

      // Draw the token image scaled to 32x32
      try {
        ctx.drawImage(entry.image, 0, 0, 32, 32);
        this.textures.addCanvas(textureKey, canvas);
      } catch {
        // Skip images that fail to draw (tainted canvas, etc.)
      }
    }

    // Store tier mapping in registry for GameScene to pick up
    this.registry.set('pitBloonData', tierData);

    loadingText.destroy();

    const totalTokens = Object.values(tierData).reduce((sum, arr) => sum + arr.length, 0);
    eventBus.emit('pitLoadingEnd', { count: totalTokens });
    console.log(`[BootScene] Loaded ${totalTokens} pit tokens across tiers`);
  }
}
