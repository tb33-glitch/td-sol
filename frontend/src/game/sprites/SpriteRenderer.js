// Pixel Art Sprite Renderer
// Draws 32x32 pixel art on offscreen canvases, registers as Phaser textures.
// Each sprite is defined as a 2D pixel array with a palette.

const SIZE = 32;
const HALF = 16;

// ========== COLOR PALETTES ==========
const P = {
  // Shared
  transparent: 'rgba(0,0,0,0)',
  black: '#111111',
  white: '#ffffff',
  outline: '#222222',
  shadow: '#1a1a2e',

  // Punk skin tones & common
  skin: '#e8b88a',
  skinLight: '#f5d0a9',
  skinDark: '#c89060',
  skinShadow: '#a06830',

  // Bat Punk (dart)
  capRed: '#cc2222',
  capRedDark: '#881111',
  batBrown: '#6b4226',
  batLight: '#8b6240',

  // Boom Punk (bomb)
  punkGreen: '#3aaa3a',
  punkGreenLight: '#55cc55',
  punkGreenDark: '#228822',
  mohawkRed: '#dd2222',
  mohawkRedDark: '#aa1111',
  bombGrey: '#555555',
  bombDark: '#333333',
  fuseOrange: '#ff8800',

  // Emo Punk (ice)
  emoSkin: '#ddc8b0',
  emoSkinLight: '#eee0cc',
  emoHair: '#111111',
  emoTear: '#4488cc',
  emoTearLight: '#66aaee',
  emoPurple: '#442255',

  // Suit Punk (banana/yield)
  suitGrey: '#333344',
  suitLight: '#555566',
  shirtWhite: '#dddddd',
  tieGreen: '#44aa44',
  shadeBlack: '#111122',
  moneyGreen: '#44aa44',
  moneyLight: '#66dd66',
  printerGrey: '#888888',

  // Laser Punk (sniper)
  visorCyan: '#00ccff',
  visorDark: '#0088aa',
  laserRed: '#ff0000',
  laserPink: '#ff4466',
  laserGlow: '#ff6666',
  hairBlonde: '#ddaa44',

  // Wizard Punk (wizard)
  wizardPurple: '#7733cc',
  wizardLight: '#9955ee',
  wizardDark: '#552299',
  starYellow: '#ffdd00',
  wandBrown: '#6b4226',

  // Enemies
  candleRed: '#cc2222',
  candleRedLight: '#ee4444',
  candleRedDark: '#881111',
  candleWick: '#666666',

  tweetBlue: '#1da1f2',
  tweetBlueDark: '#0d8bd9',
  tweetBlueLight: '#55c0ff',

  bearGreen: '#338833',
  bearGreenLight: '#55aa55',
  bearGreenDark: '#226622',

  suitYellow: '#ccaa22',
  suitDark: '#333355',
  suitLight: '#555577',
  tieRed: '#cc3333',

  rugPink: '#dd4488',
  rugPinkLight: '#ee66aa',
  rugPinkDark: '#bb2266',

  walletGrey: '#777777',
  walletDark: '#444444',
  walletLight: '#999999',
  walletGold: '#ffcc00',

  darkPoolPurple: '#442266',
  darkPoolLight: '#663388',

  moabRed: '#aa1111',
  moabRedDark: '#770000',
  moabRedLight: '#dd3333',
  moabEye: '#ffff00',

  // Black Swan
  swanBlack: '#222222',
  swanDark: '#111111',
  swanGrey: '#444444',
  swanBeak: '#ff8800',

  // Paper Hands
  paperWhite: '#eeeeee',
  paperLight: '#ffffff',
  paperGrey: '#cccccc',
  paperTear: '#88bbff',

  // Hedge Fund
  hedgeGrey: '#888888',
  hedgeLight: '#aaaaaa',
  hedgeDark: '#555555',
  hedgeStripe: '#222222',

  // Altcoin Season
  altOrange: '#ff6600',
  altGreen: '#00cc44',
  altBlue: '#0088ff',
  altPurple: '#aa00ff',
  altYellow: '#ffcc00',

  // Diamond Safe
  ceramicBrown: '#bb6622',
  ceramicLight: '#dd8844',
  ceramicDark: '#884411',
  diamondBlue: '#88ddff',

  // Crypto Winter (BFB)
  bfbRed: '#990000',
  bfbDark: '#660000',
  bfbLight: '#cc2222',
  bfbIce: '#aaddff',

  // Total Collapse (ZOMG)
  zomgGreen: '#006600',
  zomgDark: '#004400',
  zomgLight: '#009900',
  zomgSkull: '#ffffff',

  // Flash Crash (DDT)
  ddtNavy: '#333366',
  ddtDark: '#222244',
  ddtLight: '#555588',
  ddtSpeed: '#ff4444',

  // Protocol Hack (BAD)
  badPurple: '#660066',
  badDark: '#440044',
  badLight: '#882288',
  badGlow: '#ff00ff',
};

// ========== PIXEL ART DEFINITIONS ==========
// Each is a function that draws on a 32x32 canvas context

function drawBonk(ctx) {
  // BAT PUNK — Punk head + backwards cap + baseball bat
  // Body (torso)
  fillRect(ctx, 11, 18, 10, 8, P.capRed);
  fillRect(ctx, 12, 19, 8, 6, P.capRedDark);

  // Head (24x24 punk style on 32 canvas)
  fillRect(ctx, 10, 6, 12, 12, P.skin);
  fillRect(ctx, 11, 7, 10, 10, P.skinLight);

  // Backwards cap
  fillRect(ctx, 9, 4, 14, 4, P.capRed);
  fillRect(ctx, 10, 5, 12, 2, P.capRedDark);
  // Brim (backwards)
  fillRect(ctx, 8, 7, 3, 2, P.capRed);

  // Eyes (2px dots)
  fillRect(ctx, 13, 10, 2, 2, P.black);
  fillRect(ctx, 18, 10, 2, 2, P.black);

  // Mouth (1px smirk)
  fillRect(ctx, 14, 15, 4, 1, P.skinDark);
  fillRect(ctx, 18, 14, 1, 1, P.skinDark);

  // Baseball bat (held over shoulder)
  fillRect(ctx, 24, 2, 3, 16, P.batBrown);
  fillRect(ctx, 25, 3, 1, 14, P.batLight);
  // Bat head (thicker top)
  fillRect(ctx, 23, 0, 5, 4, P.batBrown);
  fillRect(ctx, 24, 1, 3, 2, P.batLight);

  // Arms
  fillRect(ctx, 7, 18, 4, 3, P.skin);
  fillRect(ctx, 21, 18, 4, 3, P.skin);

  // Legs
  fillRect(ctx, 12, 26, 3, 4, P.suitGrey);
  fillRect(ctx, 18, 26, 3, 4, P.suitGrey);

  // Shoes
  fillRect(ctx, 11, 29, 5, 2, P.black);
  fillRect(ctx, 17, 29, 5, 2, P.black);
}

function drawPepe(ctx) {
  // BOOM PUNK — Green-skinned punk + red mohawk + bomb
  // Body
  fillRect(ctx, 11, 18, 10, 8, P.black);
  fillRect(ctx, 12, 19, 8, 6, P.outline);

  // Head (green skin)
  fillRect(ctx, 10, 6, 12, 12, P.punkGreen);
  fillRect(ctx, 11, 7, 10, 10, P.punkGreenLight);

  // Red mohawk
  fillRect(ctx, 14, 0, 4, 7, P.mohawkRed);
  fillRect(ctx, 15, 1, 2, 5, P.mohawkRedDark);
  fillRect(ctx, 13, 3, 6, 2, P.mohawkRed);

  // Eyes (2px dots)
  fillRect(ctx, 13, 10, 2, 2, P.black);
  fillRect(ctx, 18, 10, 2, 2, P.black);

  // Grin
  fillRect(ctx, 13, 14, 6, 1, P.punkGreenDark);
  fillRect(ctx, 14, 15, 4, 1, P.punkGreenDark);

  // Bomb in hand (right side)
  fillCirclePixel(ctx, 26, 16, 4, P.bombGrey);
  fillCirclePixel(ctx, 26, 16, 3, P.bombDark);
  // Fuse
  fillRect(ctx, 26, 11, 1, 2, P.bombGrey);
  fillRect(ctx, 27, 10, 2, 2, P.fuseOrange);
  fillRect(ctx, 28, 9, 1, 1, P.starYellow);

  // Arms
  fillRect(ctx, 7, 18, 4, 3, P.punkGreen);
  fillRect(ctx, 21, 18, 4, 3, P.punkGreen);

  // Legs
  fillRect(ctx, 12, 26, 3, 4, P.punkGreenDark);
  fillRect(ctx, 18, 26, 3, 4, P.punkGreenDark);

  // Boots
  fillRect(ctx, 11, 29, 5, 2, P.black);
  fillRect(ctx, 17, 29, 5, 2, P.black);
}

function drawWojak(ctx) {
  // EMO PUNK — Pale punk + emo side hair + tears streaming
  // Body (dark hoodie)
  fillRect(ctx, 10, 18, 12, 8, P.emoPurple);
  fillRect(ctx, 11, 19, 10, 6, P.black);

  // Head (pale skin)
  fillRect(ctx, 10, 5, 12, 13, P.emoSkin);
  fillRect(ctx, 11, 6, 10, 11, P.emoSkinLight);

  // Emo side-swept hair (covers right eye)
  fillRect(ctx, 9, 3, 14, 4, P.emoHair);
  fillRect(ctx, 8, 5, 4, 4, P.emoHair);
  // Side-sweep over right eye
  fillRect(ctx, 16, 7, 6, 4, P.emoHair);
  fillRect(ctx, 17, 8, 5, 3, P.emoHair);

  // Left eye visible (2px)
  fillRect(ctx, 13, 10, 2, 2, P.black);
  // Right eye hidden under hair — just a glint
  fillRect(ctx, 19, 10, 1, 1, P.emoTearLight);

  // Frown
  fillRect(ctx, 13, 15, 5, 1, P.skinDark);
  fillRect(ctx, 12, 14, 1, 1, P.skinDark);

  // Tears streaming from left eye
  fillRect(ctx, 13, 12, 1, 6, P.emoTear);
  fillRect(ctx, 12, 14, 1, 3, P.emoTearLight);
  // Tear drops on hoodie
  fillRect(ctx, 13, 18, 1, 2, P.emoTear);
  fillRect(ctx, 12, 19, 1, 1, P.emoTearLight);

  // Arms (hoodie sleeves)
  fillRect(ctx, 6, 18, 4, 4, P.emoPurple);
  fillRect(ctx, 22, 18, 4, 4, P.emoPurple);

  // Legs
  fillRect(ctx, 12, 26, 3, 4, P.black);
  fillRect(ctx, 18, 26, 3, 4, P.black);

  // Shoes
  fillRect(ctx, 11, 29, 5, 2, P.emoPurple);
  fillRect(ctx, 17, 29, 5, 2, P.emoPurple);
}

function drawYieldFarm(ctx) {
  // SUIT PUNK — Punk in shades + business suit + money printer on side
  // Body (suit)
  fillRect(ctx, 10, 18, 12, 8, P.suitGrey);
  fillRect(ctx, 11, 19, 10, 6, P.suitLight);

  // Shirt & tie
  fillRect(ctx, 14, 18, 4, 6, P.shirtWhite);
  fillRect(ctx, 15, 18, 2, 6, P.tieGreen);

  // Head
  fillRect(ctx, 10, 5, 12, 13, P.skin);
  fillRect(ctx, 11, 6, 10, 11, P.skinLight);

  // Slicked-back hair
  fillRect(ctx, 9, 3, 14, 4, P.black);
  fillRect(ctx, 10, 4, 12, 2, P.outline);

  // Sunglasses (dark shades)
  fillRect(ctx, 11, 9, 5, 3, P.shadeBlack);
  fillRect(ctx, 17, 9, 5, 3, P.shadeBlack);
  fillRect(ctx, 16, 10, 1, 1, P.shadeBlack); // bridge

  // Smirk
  fillRect(ctx, 14, 15, 4, 1, P.skinDark);
  fillRect(ctx, 18, 14, 1, 1, P.skinDark);

  // Money printer (small, on right)
  fillRect(ctx, 24, 20, 6, 5, P.printerGrey);
  fillRect(ctx, 25, 21, 4, 3, P.moneyGreen);
  // Bills flying out
  fillRect(ctx, 25, 17, 4, 3, P.moneyGreen);
  fillRect(ctx, 26, 18, 2, 1, P.moneyLight);
  fillRect(ctx, 26, 15, 3, 2, P.moneyLight);

  // Arms
  fillRect(ctx, 6, 18, 4, 4, P.suitGrey);
  fillRect(ctx, 22, 18, 4, 4, P.suitGrey);

  // Legs
  fillRect(ctx, 12, 26, 3, 4, P.suitGrey);
  fillRect(ctx, 18, 26, 3, 4, P.suitGrey);

  // Dress shoes
  fillRect(ctx, 11, 29, 5, 2, P.black);
  fillRect(ctx, 17, 29, 5, 2, P.black);
}

function drawLaserEyes(ctx) {
  // LASER PUNK — Punk + visor shades + laser beams from eyes
  // Body
  fillRect(ctx, 11, 18, 10, 8, P.black);
  fillRect(ctx, 12, 19, 8, 6, P.outline);

  // Head
  fillRect(ctx, 10, 5, 12, 13, P.skin);
  fillRect(ctx, 11, 6, 10, 11, P.skinLight);

  // Blonde spiky hair
  fillRect(ctx, 9, 2, 14, 4, P.hairBlonde);
  fillRect(ctx, 11, 0, 3, 3, P.hairBlonde);
  fillRect(ctx, 16, 1, 3, 2, P.hairBlonde);
  fillRect(ctx, 20, 2, 3, 2, P.hairBlonde);

  // Visor shades (cyan)
  fillRect(ctx, 10, 9, 12, 3, P.visorCyan);
  fillRect(ctx, 11, 10, 10, 1, P.visorDark);

  // LASER BEAMS shooting from eyes
  fillRect(ctx, 0, 10, 10, 2, P.laserRed);
  fillRect(ctx, 1, 9, 6, 1, P.laserPink);
  fillRect(ctx, 1, 12, 6, 1, P.laserPink);

  fillRect(ctx, 22, 10, 10, 2, P.laserRed);
  fillRect(ctx, 25, 9, 6, 1, P.laserPink);
  fillRect(ctx, 25, 12, 6, 1, P.laserPink);

  // Glow at eye positions
  fillRect(ctx, 12, 9, 2, 3, P.laserGlow);
  fillRect(ctx, 19, 9, 2, 3, P.laserGlow);

  // Mouth (determined line)
  fillRect(ctx, 14, 15, 4, 1, P.skinDark);

  // Arms
  fillRect(ctx, 7, 18, 4, 3, P.skin);
  fillRect(ctx, 21, 18, 4, 3, P.skin);

  // Legs
  fillRect(ctx, 12, 26, 3, 4, P.black);
  fillRect(ctx, 18, 26, 3, 4, P.black);

  // Boots
  fillRect(ctx, 11, 29, 5, 2, P.outline);
  fillRect(ctx, 17, 29, 5, 2, P.outline);
}

function drawDogeWizard(ctx) {
  // WIZARD PUNK — Punk + purple wizard hat + wand + stars
  // Body (wizard robe)
  fillRect(ctx, 10, 18, 12, 8, P.wizardPurple);
  fillRect(ctx, 11, 19, 10, 6, P.wizardLight);
  // Stars on robe
  fillRect(ctx, 12, 21, 2, 2, P.starYellow);
  fillRect(ctx, 19, 23, 2, 2, P.starYellow);

  // Head
  fillRect(ctx, 10, 6, 12, 12, P.skin);
  fillRect(ctx, 11, 7, 10, 10, P.skinLight);

  // Wizard hat (pointy)
  fillRect(ctx, 9, 4, 14, 3, P.wizardPurple);
  fillRect(ctx, 11, 2, 10, 3, P.wizardPurple);
  fillRect(ctx, 13, 0, 6, 3, P.wizardPurple);
  fillRect(ctx, 15, 0, 2, 1, P.wizardDark);
  // Hat brim
  fillRect(ctx, 7, 6, 18, 2, P.wizardLight);
  // Star on hat
  fillRect(ctx, 14, 2, 2, 2, P.starYellow);
  fillRect(ctx, 13, 3, 4, 1, P.starYellow);

  // Eyes (2px dots, slight glow)
  fillRect(ctx, 13, 10, 2, 2, P.wizardPurple);
  fillRect(ctx, 18, 10, 2, 2, P.wizardPurple);
  fillRect(ctx, 13, 10, 1, 1, P.white);
  fillRect(ctx, 18, 10, 1, 1, P.white);

  // Slight smile
  fillRect(ctx, 14, 14, 4, 1, P.skinDark);

  // Wand (right hand)
  fillRect(ctx, 25, 12, 2, 14, P.wandBrown);
  // Wand tip (glowing star)
  fillRect(ctx, 24, 10, 4, 3, P.starYellow);
  fillRect(ctx, 25, 9, 2, 1, P.starYellow);
  fillRect(ctx, 25, 13, 2, 1, P.starYellow);

  // Arms (robe sleeves)
  fillRect(ctx, 6, 18, 4, 4, P.wizardPurple);
  fillRect(ctx, 22, 18, 4, 4, P.wizardPurple);

  // Legs (under robe)
  fillRect(ctx, 12, 26, 3, 4, P.wizardDark);
  fillRect(ctx, 18, 26, 3, 4, P.wizardDark);

  // Boots
  fillRect(ctx, 11, 29, 5, 2, P.wizardDark);
  fillRect(ctx, 17, 29, 5, 2, P.wizardDark);
}

function drawMevPunk(ctx) {
  // MEV PUNK — Hooded hacker with green glow
  // Hoodie body
  fillRect(ctx, 10, 18, 12, 8, P.punkGreenDark);
  fillRect(ctx, 11, 19, 10, 6, P.punkGreen);
  // Hood
  fillRect(ctx, 8, 3, 16, 8, P.punkGreenDark);
  fillRect(ctx, 9, 4, 14, 6, P.punkGreen);
  // Face (dark, barely visible)
  fillRect(ctx, 11, 6, 10, 8, P.shadow);
  // Glowing eyes
  fillRect(ctx, 13, 9, 2, 2, P.visorCyan);
  fillRect(ctx, 18, 9, 2, 2, P.visorCyan);
  // Laptop
  fillRect(ctx, 20, 20, 8, 5, P.suitGrey);
  fillRect(ctx, 21, 21, 6, 3, P.visorCyan);
  fillRect(ctx, 22, 22, 4, 1, P.punkGreen);
  // Arms
  fillRect(ctx, 6, 18, 4, 4, P.punkGreenDark);
  fillRect(ctx, 22, 18, 4, 3, P.punkGreenDark);
  // Legs
  fillRect(ctx, 12, 26, 3, 4, P.shadow);
  fillRect(ctx, 18, 26, 3, 4, P.shadow);
  // Shoes
  fillRect(ctx, 11, 29, 5, 2, P.punkGreenDark);
  fillRect(ctx, 17, 29, 5, 2, P.punkGreenDark);
}

function drawFlipperPunk(ctx) {
  // FLIPPER PUNK — Orange mohawk, holding boomerang
  // Body
  fillRect(ctx, 11, 18, 10, 8, P.fuseOrange);
  fillRect(ctx, 12, 19, 8, 6, P.suitYellow);
  // Head
  fillRect(ctx, 10, 6, 12, 12, P.skin);
  fillRect(ctx, 11, 7, 10, 10, P.skinLight);
  // Orange mohawk
  fillRect(ctx, 14, 0, 4, 7, P.fuseOrange);
  fillRect(ctx, 13, 2, 6, 3, P.fuseOrange);
  fillRect(ctx, 15, 1, 2, 2, P.suitYellow);
  // Eyes
  fillRect(ctx, 13, 10, 2, 2, P.black);
  fillRect(ctx, 18, 10, 2, 2, P.black);
  // Grin
  fillRect(ctx, 14, 14, 4, 1, P.skinDark);
  // Boomerang in hand
  fillRect(ctx, 24, 14, 6, 2, P.suitYellow);
  fillRect(ctx, 28, 12, 2, 6, P.suitYellow);
  fillRect(ctx, 24, 12, 2, 2, P.fuseOrange);
  // Arms
  fillRect(ctx, 7, 18, 4, 3, P.skin);
  fillRect(ctx, 21, 18, 4, 3, P.skin);
  // Legs
  fillRect(ctx, 12, 26, 3, 4, P.black);
  fillRect(ctx, 18, 26, 3, 4, P.black);
  // Shoes
  fillRect(ctx, 11, 29, 5, 2, P.fuseOrange);
  fillRect(ctx, 17, 29, 5, 2, P.fuseOrange);
}

function drawAlchemistPunk(ctx) {
  // DEFI PUNK — Lab coat, goggles, potion
  // Body (lab coat)
  fillRect(ctx, 9, 18, 14, 8, P.white);
  fillRect(ctx, 10, 19, 12, 6, P.shirtWhite);
  // Head
  fillRect(ctx, 10, 5, 12, 12, P.punkGreen);
  fillRect(ctx, 11, 6, 10, 10, P.punkGreenLight);
  // Goggles
  fillRect(ctx, 10, 8, 5, 4, P.suitYellow);
  fillRect(ctx, 17, 8, 5, 4, P.suitYellow);
  fillRect(ctx, 11, 9, 3, 2, P.visorCyan);
  fillRect(ctx, 18, 9, 3, 2, P.visorCyan);
  fillRect(ctx, 15, 9, 2, 1, P.suitYellow);
  // Hair (wild)
  fillRect(ctx, 9, 2, 14, 4, P.punkGreenDark);
  fillRect(ctx, 11, 0, 3, 3, P.punkGreenDark);
  fillRect(ctx, 18, 1, 3, 2, P.punkGreenDark);
  // Potion in hand
  fillRect(ctx, 24, 16, 4, 6, P.visorCyan);
  fillRect(ctx, 25, 17, 2, 4, P.punkGreenLight);
  fillRect(ctx, 23, 14, 6, 3, P.walletGrey);
  // Bubbles
  fillCirclePixel(ctx, 26, 12, 1, P.punkGreenLight);
  fillCirclePixel(ctx, 28, 10, 1, P.visorCyan);
  // Arms
  fillRect(ctx, 5, 18, 4, 4, P.white);
  fillRect(ctx, 23, 18, 4, 4, P.white);
  // Legs
  fillRect(ctx, 12, 26, 3, 4, P.suitGrey);
  fillRect(ctx, 18, 26, 3, 4, P.suitGrey);
  // Shoes
  fillRect(ctx, 11, 29, 5, 2, P.black);
  fillRect(ctx, 17, 29, 5, 2, P.black);
}

function drawSpikeFactoryPunk(ctx) {
  // GAS FEE PUNK — Goggled punk + spike machine
  // Machine base
  fillRect(ctx, 6, 14, 20, 14, P.walletGrey);
  fillRect(ctx, 7, 15, 18, 12, P.walletLight);
  // Machine gears
  fillCirclePixel(ctx, 12, 20, 3, P.walletDark);
  fillCirclePixel(ctx, 20, 20, 3, P.walletDark);
  fillCirclePixel(ctx, 12, 20, 1, P.walletGold);
  fillCirclePixel(ctx, 20, 20, 1, P.walletGold);
  // Spikes coming out
  fillRect(ctx, 14, 10, 2, 5, P.walletDark);
  fillRect(ctx, 18, 11, 2, 4, P.walletDark);
  fillRect(ctx, 10, 12, 2, 3, P.walletDark);
  fillRect(ctx, 22, 12, 2, 3, P.walletDark);
  // Spike tips
  fillRect(ctx, 14, 8, 2, 2, P.candleWick);
  fillRect(ctx, 18, 9, 2, 2, P.candleWick);
  fillRect(ctx, 10, 10, 2, 2, P.candleWick);
  fillRect(ctx, 22, 10, 2, 2, P.candleWick);
  // Operator (small punk on top)
  fillRect(ctx, 13, 2, 6, 6, P.skin);
  fillRect(ctx, 14, 3, 4, 4, P.skinLight);
  // Goggles
  fillRect(ctx, 13, 4, 3, 2, P.suitYellow);
  fillRect(ctx, 17, 4, 3, 2, P.suitYellow);
  fillRect(ctx, 14, 4, 1, 1, P.visorCyan);
  fillRect(ctx, 18, 4, 1, 1, P.visorCyan);
  // Legs of machine
  fillRect(ctx, 8, 28, 4, 3, P.walletDark);
  fillRect(ctx, 20, 28, 4, 3, P.walletDark);
}

// ========== ENEMY SPRITES ==========

function drawRedCandle(ctx) {
  // Red candlestick (trading)
  // Wick
  fillRect(ctx, 15, 4, 2, 6, P.candleWick);
  // Body
  fillRect(ctx, 11, 10, 10, 16, P.candleRed);
  fillRect(ctx, 12, 11, 8, 14, P.candleRedLight);
  // Shadow
  fillRect(ctx, 11, 10, 1, 16, P.candleRedDark);
  fillRect(ctx, 21, 10, 1, 16, P.candleRedDark);
  // Bottom wick
  fillRect(ctx, 15, 26, 2, 4, P.candleWick);
  // Angry eyes
  fillRect(ctx, 13, 15, 2, 2, P.black);
  fillRect(ctx, 17, 15, 2, 2, P.black);
  // Frown
  fillRect(ctx, 14, 20, 4, 1, P.candleRedDark);
}

function drawFudTweet(ctx) {
  // Tweet/speech bubble
  // Bubble
  fillRect(ctx, 4, 4, 24, 18, P.tweetBlue);
  fillRect(ctx, 5, 5, 22, 16, P.tweetBlueLight);
  fillRect(ctx, 6, 3, 20, 1, P.tweetBlue);
  fillRect(ctx, 6, 22, 20, 1, P.tweetBlue);
  // Tail
  fillRect(ctx, 8, 22, 4, 3, P.tweetBlue);
  fillRect(ctx, 6, 25, 4, 2, P.tweetBlue);
  // "FUD" text
  fillRect(ctx, 8, 8, 2, 6, P.tweetBlueDark);
  fillRect(ctx, 8, 8, 4, 2, P.tweetBlueDark);
  fillRect(ctx, 8, 11, 3, 2, P.tweetBlueDark);
  fillRect(ctx, 14, 8, 2, 8, P.tweetBlueDark);
  fillRect(ctx, 16, 14, 2, 2, P.tweetBlueDark);
  fillRect(ctx, 18, 8, 2, 8, P.tweetBlueDark);
  fillRect(ctx, 20, 8, 4, 2, P.tweetBlueDark);
  fillRect(ctx, 22, 8, 2, 8, P.tweetBlueDark);
  fillRect(ctx, 20, 14, 4, 2, P.tweetBlueDark);
}

function drawBear(ctx) {
  // Bear (market bear)
  // Body
  fillRect(ctx, 8, 12, 16, 14, P.bearGreen);
  fillRect(ctx, 9, 13, 14, 12, P.bearGreenLight);
  // Head
  fillRect(ctx, 9, 4, 14, 10, P.bearGreen);
  fillRect(ctx, 10, 5, 12, 8, P.bearGreenLight);
  // Ears
  fillRect(ctx, 7, 2, 5, 4, P.bearGreen);
  fillRect(ctx, 8, 3, 3, 2, P.bearGreenDark);
  fillRect(ctx, 20, 2, 5, 4, P.bearGreen);
  fillRect(ctx, 21, 3, 3, 2, P.bearGreenDark);
  // Angry eyes
  fillRect(ctx, 12, 7, 3, 2, P.black);
  fillRect(ctx, 18, 7, 3, 2, P.black);
  // Angry eyebrows
  fillRect(ctx, 11, 6, 4, 1, P.bearGreenDark);
  fillRect(ctx, 18, 6, 4, 1, P.bearGreenDark);
  // Growl mouth
  fillRect(ctx, 13, 11, 6, 2, P.bearGreenDark);
  fillRect(ctx, 14, 11, 1, 1, P.white);
  fillRect(ctx, 17, 11, 1, 1, P.white);
  // Arms
  fillRect(ctx, 5, 14, 3, 8, P.bearGreen);
  fillRect(ctx, 24, 14, 3, 8, P.bearGreen);
  // Legs
  fillRect(ctx, 9, 26, 5, 4, P.bearGreenDark);
  fillRect(ctx, 18, 26, 5, 4, P.bearGreenDark);
  // Down arrow on belly
  fillRect(ctx, 15, 16, 2, 6, P.candleRed);
  fillRect(ctx, 13, 20, 6, 2, P.candleRed);
}

function drawSecSuit(ctx) {
  // SEC regulator in suit
  // Head
  fillRect(ctx, 11, 4, 10, 10, P.wojakSkin);
  fillRect(ctx, 12, 5, 8, 8, P.wojakLight);
  // Sunglasses
  fillRect(ctx, 11, 7, 10, 3, P.black);
  fillRect(ctx, 12, 8, 3, 1, P.suitLight);
  fillRect(ctx, 17, 8, 3, 1, P.suitLight);
  // Mouth (stern)
  fillRect(ctx, 14, 11, 4, 1, P.wojakDark);
  // Hair
  fillRect(ctx, 10, 2, 12, 3, P.suitDark);
  fillRect(ctx, 11, 4, 10, 1, P.suitDark);
  // Body (suit)
  fillRect(ctx, 8, 14, 16, 14, P.suitDark);
  fillRect(ctx, 9, 15, 14, 12, P.suitLight);
  // Tie
  fillRect(ctx, 15, 14, 2, 10, P.tieRed);
  fillRect(ctx, 14, 14, 4, 2, P.tieRed);
  // Arms
  fillRect(ctx, 5, 14, 3, 10, P.suitDark);
  fillRect(ctx, 24, 14, 3, 10, P.suitDark);
  // Briefcase
  fillRect(ctx, 24, 22, 6, 5, P.suitYellow);
  fillRect(ctx, 25, 23, 4, 3, P.shibaDark);
  fillRect(ctx, 26, 21, 2, 2, P.suitYellow);
  // Legs
  fillRect(ctx, 10, 28, 4, 3, P.suitDark);
  fillRect(ctx, 18, 28, 4, 3, P.suitDark);
}

function drawRugPull(ctx) {
  // Rolling carpet/rug
  // Rolled top
  fillCirclePixel(ctx, 16, 8, 6, P.rugPink);
  fillCirclePixel(ctx, 16, 8, 4, P.rugPinkLight);
  fillCirclePixel(ctx, 16, 8, 2, P.rugPinkDark);
  // Unrolled carpet body
  fillRect(ctx, 6, 14, 20, 12, P.rugPink);
  fillRect(ctx, 7, 15, 18, 10, P.rugPinkLight);
  // Pattern on carpet
  fillRect(ctx, 9, 17, 2, 2, P.rugPinkDark);
  fillRect(ctx, 13, 17, 2, 2, P.rugPinkDark);
  fillRect(ctx, 17, 17, 2, 2, P.rugPinkDark);
  fillRect(ctx, 21, 17, 2, 2, P.rugPinkDark);
  fillRect(ctx, 11, 21, 2, 2, P.rugPinkDark);
  fillRect(ctx, 15, 21, 2, 2, P.rugPinkDark);
  fillRect(ctx, 19, 21, 2, 2, P.rugPinkDark);
  // Edge tassels
  fillRect(ctx, 7, 26, 2, 3, P.rugPinkDark);
  fillRect(ctx, 11, 26, 2, 3, P.rugPinkDark);
  fillRect(ctx, 15, 26, 2, 3, P.rugPinkDark);
  fillRect(ctx, 19, 26, 2, 3, P.rugPinkDark);
  fillRect(ctx, 23, 26, 2, 3, P.rugPinkDark);
  // Sneaky eyes on roll
  fillRect(ctx, 13, 7, 2, 2, P.black);
  fillRect(ctx, 18, 7, 2, 2, P.black);
}

function drawWhaleWallet(ctx) {
  // Big grey wallet
  // Wallet body
  fillRect(ctx, 4, 6, 24, 20, P.walletGrey);
  fillRect(ctx, 5, 7, 22, 18, P.walletLight);
  fillRect(ctx, 4, 6, 24, 2, P.walletDark);
  // Clasp
  fillRect(ctx, 14, 4, 6, 4, P.walletGold);
  fillRect(ctx, 15, 5, 4, 2, P.suitYellow);
  // Dollar signs
  fillRect(ctx, 9, 12, 2, 6, P.walletGold);
  fillRect(ctx, 8, 13, 4, 1, P.walletGold);
  fillRect(ctx, 8, 15, 4, 1, P.walletGold);
  fillRect(ctx, 8, 17, 4, 1, P.walletGold);
  // SOL logo area
  fillRect(ctx, 16, 12, 8, 8, P.walletDark);
  fillRect(ctx, 17, 13, 6, 2, P.btcLight);
  fillRect(ctx, 17, 16, 6, 2, P.btcLight);
  // Heavy outline (it's big)
  ctx.strokeStyle = P.walletDark;
  ctx.lineWidth = 1;
  ctx.strokeRect(4, 6, 24, 20);
  // Legs (it walks!)
  fillRect(ctx, 8, 26, 4, 4, P.walletDark);
  fillRect(ctx, 20, 26, 4, 4, P.walletDark);
}

function drawDarkPool(ctx) {
  // Semi-transparent shadowy figure
  // Ghostly body
  fillRect(ctx, 8, 6, 16, 20, P.darkPoolPurple);
  fillRect(ctx, 9, 7, 14, 18, P.darkPoolLight);
  // Hood
  fillRect(ctx, 7, 4, 18, 6, P.darkPoolPurple);
  fillRect(ctx, 9, 2, 14, 4, P.darkPoolPurple);
  // Glowing eyes
  fillRect(ctx, 12, 8, 2, 2, P.starYellow);
  fillRect(ctx, 18, 8, 2, 2, P.starYellow);
  // Wavy bottom (ghost-like)
  fillRect(ctx, 6, 24, 4, 4, P.darkPoolPurple);
  fillRect(ctx, 10, 26, 4, 4, P.darkPoolLight);
  fillRect(ctx, 14, 24, 4, 4, P.darkPoolPurple);
  fillRect(ctx, 18, 26, 4, 4, P.darkPoolLight);
  fillRect(ctx, 22, 24, 4, 4, P.darkPoolPurple);
  // "?" on chest
  fillRect(ctx, 15, 14, 2, 1, P.starYellow);
  fillRect(ctx, 17, 15, 1, 2, P.starYellow);
  fillRect(ctx, 15, 17, 2, 1, P.starYellow);
  fillRect(ctx, 15, 18, 1, 2, P.starYellow);
  fillRect(ctx, 15, 21, 1, 1, P.starYellow);
}

function drawBearMarket(ctx) {
  // Giant bear boss (MOAB equivalent) — drawn at larger conceptual size
  // Massive bear head
  fillRect(ctx, 4, 2, 24, 20, P.moabRed);
  fillRect(ctx, 5, 3, 22, 18, P.moabRedLight);
  // Ears
  fillRect(ctx, 2, 0, 6, 6, P.moabRed);
  fillRect(ctx, 3, 1, 4, 4, P.moabRedDark);
  fillRect(ctx, 24, 0, 6, 6, P.moabRed);
  fillRect(ctx, 25, 1, 4, 4, P.moabRedDark);
  // Angry eyes (glowing)
  fillRect(ctx, 9, 8, 5, 4, P.black);
  fillRect(ctx, 18, 8, 5, 4, P.black);
  fillRect(ctx, 10, 9, 3, 2, P.moabEye);
  fillRect(ctx, 19, 9, 3, 2, P.moabEye);
  // Angry eyebrows
  fillRect(ctx, 8, 6, 6, 2, P.moabRedDark);
  fillRect(ctx, 18, 6, 6, 2, P.moabRedDark);
  // Snout
  fillRect(ctx, 11, 14, 10, 6, P.moabRedDark);
  fillRect(ctx, 12, 15, 8, 4, P.moabRed);
  // Fangs
  fillRect(ctx, 12, 18, 2, 3, P.white);
  fillRect(ctx, 18, 18, 2, 3, P.white);
  // Nose
  fillRect(ctx, 14, 14, 4, 2, P.black);
  // Body
  fillRect(ctx, 6, 22, 20, 8, P.moabRed);
  fillRect(ctx, 7, 23, 18, 6, P.moabRedLight);
  // Down arrow on body
  fillRect(ctx, 14, 24, 4, 4, P.moabRedDark);
  fillRect(ctx, 12, 26, 8, 2, P.moabRedDark);
}

function drawBlackSwan(ctx) {
  // Black swan — sleek dark bird
  // Body
  fillRect(ctx, 8, 12, 16, 12, P.swanBlack);
  fillRect(ctx, 9, 13, 14, 10, P.swanDark);
  // Neck (curved up-left)
  fillRect(ctx, 8, 4, 4, 10, P.swanBlack);
  fillRect(ctx, 9, 5, 2, 8, P.swanGrey);
  // Head
  fillRect(ctx, 6, 2, 6, 5, P.swanBlack);
  fillRect(ctx, 7, 3, 4, 3, P.swanGrey);
  // Beak
  fillRect(ctx, 4, 4, 3, 2, P.swanBeak);
  // Eye
  fillRect(ctx, 8, 3, 1, 1, P.moabEye);
  // Wing
  fillRect(ctx, 12, 10, 10, 8, P.swanGrey);
  fillRect(ctx, 14, 11, 8, 6, P.swanBlack);
  // Tail feathers
  fillRect(ctx, 22, 14, 6, 3, P.swanBlack);
  fillRect(ctx, 24, 13, 4, 2, P.swanGrey);
  // Legs
  fillRect(ctx, 12, 24, 2, 4, P.swanDark);
  fillRect(ctx, 18, 24, 2, 4, P.swanDark);
  fillRect(ctx, 10, 27, 5, 2, P.swanDark);
  fillRect(ctx, 17, 27, 5, 2, P.swanDark);
}

function drawPaperHands(ctx) {
  // Paper hands — white crumpled paper with shaky hands
  // Paper body
  fillRect(ctx, 6, 4, 20, 22, P.paperWhite);
  fillRect(ctx, 7, 5, 18, 20, P.paperLight);
  // Crumple lines
  fillRect(ctx, 10, 8, 8, 1, P.paperGrey);
  fillRect(ctx, 8, 13, 10, 1, P.paperGrey);
  fillRect(ctx, 12, 18, 8, 1, P.paperGrey);
  // Shaky hands on sides
  fillRect(ctx, 2, 12, 5, 6, P.paperGrey);
  fillRect(ctx, 3, 13, 3, 4, P.paperWhite);
  fillRect(ctx, 25, 12, 5, 6, P.paperGrey);
  fillRect(ctx, 26, 13, 3, 4, P.paperWhite);
  // Scared eyes
  fillRect(ctx, 12, 10, 3, 3, P.black);
  fillRect(ctx, 19, 10, 3, 3, P.black);
  fillRect(ctx, 13, 11, 1, 1, P.white);
  fillRect(ctx, 20, 11, 1, 1, P.white);
  // Tear
  fillRect(ctx, 13, 14, 1, 3, P.paperTear);
  fillRect(ctx, 20, 14, 1, 3, P.paperTear);
  // Wobbly mouth
  fillRect(ctx, 14, 18, 4, 2, P.paperGrey);
}

function drawHedgeFund(ctx) {
  // Hedge fund — striped (zebra) suited figure
  // Body (striped suit)
  fillRect(ctx, 8, 14, 16, 14, P.hedgeGrey);
  fillRect(ctx, 9, 15, 14, 12, P.hedgeLight);
  // Stripes
  for (let i = 0; i < 6; i++) {
    fillRect(ctx, 9, 15 + i * 2, 14, 1, P.hedgeStripe);
  }
  // Head
  fillRect(ctx, 10, 4, 12, 11, P.hedgeGrey);
  fillRect(ctx, 11, 5, 10, 9, P.hedgeLight);
  // Head stripes
  fillRect(ctx, 11, 5, 10, 1, P.hedgeStripe);
  fillRect(ctx, 11, 8, 10, 1, P.hedgeStripe);
  fillRect(ctx, 11, 11, 10, 1, P.hedgeStripe);
  // Monocle
  fillCirclePixel(ctx, 13, 8, 3, P.walletGold);
  fillRect(ctx, 13, 8, 2, 2, P.black);
  // Top hat
  fillRect(ctx, 9, 0, 14, 3, P.hedgeStripe);
  fillRect(ctx, 11, 0, 10, 5, P.hedgeDark);
  fillRect(ctx, 12, 1, 8, 3, P.hedgeStripe);
  // Cigar
  fillRect(ctx, 18, 12, 6, 2, P.ceramicBrown);
  fillRect(ctx, 23, 11, 2, 1, P.walletGrey);
  // Legs
  fillRect(ctx, 10, 28, 4, 3, P.hedgeDark);
  fillRect(ctx, 18, 28, 4, 3, P.hedgeDark);
}

function drawAltcoinSeason(ctx) {
  // Altcoin season — colorful spinning coin cluster
  // Central coin
  fillCirclePixel(ctx, 16, 16, 8, P.altOrange);
  fillCirclePixel(ctx, 16, 16, 6, P.altYellow);
  // Orbiting mini-coins
  fillCirclePixel(ctx, 8, 8, 4, P.altGreen);
  fillCirclePixel(ctx, 24, 8, 4, P.altBlue);
  fillCirclePixel(ctx, 8, 24, 4, P.altPurple);
  fillCirclePixel(ctx, 24, 24, 4, P.candleRed);
  // Center symbol
  fillRect(ctx, 14, 12, 4, 1, P.altOrange);
  fillRect(ctx, 14, 14, 4, 1, P.altOrange);
  fillRect(ctx, 14, 16, 4, 1, P.altOrange);
  fillRect(ctx, 14, 18, 4, 1, P.altOrange);
  // Sparkles
  fillRect(ctx, 4, 16, 2, 2, P.starYellow);
  fillRect(ctx, 26, 16, 2, 2, P.starYellow);
  fillRect(ctx, 16, 2, 2, 2, P.starYellow);
  fillRect(ctx, 16, 28, 2, 2, P.starYellow);
}

function drawDiamondSafe(ctx) {
  // Diamond safe — brown ceramic box with diamond
  // Safe body
  fillRect(ctx, 6, 8, 20, 18, P.ceramicBrown);
  fillRect(ctx, 7, 9, 18, 16, P.ceramicLight);
  // Border
  fillRect(ctx, 6, 8, 20, 2, P.ceramicDark);
  fillRect(ctx, 6, 24, 20, 2, P.ceramicDark);
  fillRect(ctx, 6, 8, 2, 18, P.ceramicDark);
  fillRect(ctx, 24, 8, 2, 18, P.ceramicDark);
  // Diamond in center
  fillRect(ctx, 14, 12, 4, 2, P.diamondBlue);
  fillRect(ctx, 12, 14, 8, 4, P.diamondBlue);
  fillRect(ctx, 14, 18, 4, 2, P.diamondBlue);
  fillRect(ctx, 15, 13, 2, 1, P.white);
  // Lock
  fillRect(ctx, 24, 15, 4, 4, P.walletGold);
  fillRect(ctx, 25, 13, 2, 3, P.walletGold);
  // Cracks (ceramic look)
  fillRect(ctx, 9, 11, 4, 1, P.ceramicDark);
  fillRect(ctx, 12, 12, 1, 3, P.ceramicDark);
  fillRect(ctx, 19, 20, 5, 1, P.ceramicDark);
  fillRect(ctx, 22, 18, 1, 3, P.ceramicDark);
  // Legs
  fillRect(ctx, 8, 26, 4, 3, P.ceramicDark);
  fillRect(ctx, 20, 26, 4, 3, P.ceramicDark);
}

function drawCryptoWinter(ctx) {
  // BFB — massive red icy bear
  fillRect(ctx, 4, 2, 24, 22, P.bfbRed);
  fillRect(ctx, 5, 3, 22, 20, P.bfbLight);
  // Ears
  fillRect(ctx, 2, 0, 6, 5, P.bfbRed);
  fillRect(ctx, 24, 0, 6, 5, P.bfbRed);
  // Ice crystals
  fillRect(ctx, 2, 8, 3, 3, P.bfbIce);
  fillRect(ctx, 27, 8, 3, 3, P.bfbIce);
  fillRect(ctx, 14, 0, 4, 3, P.bfbIce);
  // Angry eyes
  fillRect(ctx, 9, 8, 5, 4, P.black);
  fillRect(ctx, 18, 8, 5, 4, P.black);
  fillRect(ctx, 10, 9, 3, 2, P.bfbIce);
  fillRect(ctx, 19, 9, 3, 2, P.bfbIce);
  // Snout
  fillRect(ctx, 11, 14, 10, 6, P.bfbDark);
  fillRect(ctx, 12, 18, 2, 3, P.white);
  fillRect(ctx, 18, 18, 2, 3, P.white);
  fillRect(ctx, 14, 14, 4, 2, P.black);
  // Snowflake on chest
  fillRect(ctx, 15, 22, 2, 1, P.bfbIce);
  fillRect(ctx, 14, 23, 4, 1, P.bfbIce);
  fillRect(ctx, 15, 24, 2, 1, P.bfbIce);
  // Body bottom
  fillRect(ctx, 6, 24, 20, 6, P.bfbRed);
}

function drawTotalCollapse(ctx) {
  // ZOMG — massive green armored blimp with skull
  fillRect(ctx, 2, 4, 28, 22, P.zomgGreen);
  fillRect(ctx, 3, 5, 26, 20, P.zomgLight);
  // Armor plates
  fillRect(ctx, 2, 4, 28, 3, P.zomgDark);
  fillRect(ctx, 2, 23, 28, 3, P.zomgDark);
  fillRect(ctx, 2, 4, 3, 22, P.zomgDark);
  fillRect(ctx, 27, 4, 3, 22, P.zomgDark);
  // Cross beam
  fillRect(ctx, 14, 4, 4, 22, P.zomgDark);
  fillRect(ctx, 2, 14, 28, 3, P.zomgDark);
  // Skull
  fillRect(ctx, 10, 8, 12, 10, P.zomgSkull);
  fillRect(ctx, 12, 9, 3, 3, P.black);
  fillRect(ctx, 19, 9, 3, 3, P.black);
  fillRect(ctx, 13, 14, 2, 3, P.black);
  fillRect(ctx, 17, 14, 2, 3, P.black);
  fillRect(ctx, 15, 14, 2, 3, P.black);
  fillRect(ctx, 14, 17, 4, 1, P.black);
  // Propeller
  fillRect(ctx, 0, 12, 3, 6, P.zomgDark);
  fillRect(ctx, 29, 12, 3, 6, P.zomgDark);
}

function drawFlashCrash(ctx) {
  // DDT — fast, dark, camo MOAB with speed lines
  // Sleek body
  fillRect(ctx, 4, 8, 24, 16, P.ddtNavy);
  fillRect(ctx, 5, 9, 22, 14, P.ddtLight);
  // Pointed nose
  fillRect(ctx, 2, 12, 4, 8, P.ddtNavy);
  fillRect(ctx, 0, 14, 3, 4, P.ddtDark);
  // Tail
  fillRect(ctx, 26, 10, 6, 4, P.ddtNavy);
  fillRect(ctx, 26, 18, 6, 4, P.ddtNavy);
  // Speed lines
  fillRect(ctx, 0, 10, 8, 1, P.ddtSpeed);
  fillRect(ctx, 0, 22, 10, 1, P.ddtSpeed);
  fillRect(ctx, 2, 6, 6, 1, P.ddtSpeed);
  // Camo pattern
  fillRect(ctx, 8, 11, 4, 3, P.ddtDark);
  fillRect(ctx, 16, 15, 5, 3, P.ddtDark);
  fillRect(ctx, 10, 19, 4, 3, P.ddtDark);
  fillRect(ctx, 20, 10, 3, 4, P.ddtDark);
  // Eyes (glowing)
  fillRect(ctx, 7, 14, 3, 3, P.ddtSpeed);
  fillRect(ctx, 8, 15, 1, 1, P.white);
  // Lightning bolt
  fillRect(ctx, 14, 10, 2, 3, P.starYellow);
  fillRect(ctx, 12, 13, 2, 2, P.starYellow);
  fillRect(ctx, 14, 15, 2, 3, P.starYellow);
}

function drawProtocolHack(ctx) {
  // BAD — massive purple boss with glowing cracks
  fillRect(ctx, 1, 2, 30, 26, P.badPurple);
  fillRect(ctx, 2, 3, 28, 24, P.badDark);
  // Armor panels
  fillRect(ctx, 1, 2, 30, 3, P.badPurple);
  fillRect(ctx, 1, 25, 30, 3, P.badPurple);
  fillRect(ctx, 1, 2, 3, 26, P.badPurple);
  fillRect(ctx, 28, 2, 3, 26, P.badPurple);
  // Glowing cracks
  fillRect(ctx, 6, 8, 1, 8, P.badGlow);
  fillRect(ctx, 25, 10, 1, 10, P.badGlow);
  fillRect(ctx, 10, 6, 8, 1, P.badGlow);
  fillRect(ctx, 14, 24, 6, 1, P.badGlow);
  fillRect(ctx, 8, 18, 6, 1, P.badGlow);
  fillRect(ctx, 20, 14, 6, 1, P.badGlow);
  // Skull face
  fillRect(ctx, 9, 8, 14, 12, P.badLight);
  fillRect(ctx, 11, 10, 4, 4, P.badGlow);
  fillRect(ctx, 17, 10, 4, 4, P.badGlow);
  fillRect(ctx, 12, 11, 2, 2, P.black);
  fillRect(ctx, 18, 11, 2, 2, P.black);
  // Nose
  fillRect(ctx, 15, 15, 2, 2, P.badDark);
  // Teeth
  fillRect(ctx, 11, 18, 2, 2, P.white);
  fillRect(ctx, 14, 18, 2, 2, P.white);
  fillRect(ctx, 17, 18, 2, 2, P.white);
  fillRect(ctx, 20, 18, 2, 2, P.white);
  // Horns
  fillRect(ctx, 6, 0, 4, 4, P.badPurple);
  fillRect(ctx, 7, 1, 2, 2, P.badGlow);
  fillRect(ctx, 22, 0, 4, 4, P.badPurple);
  fillRect(ctx, 23, 1, 2, 2, P.badGlow);
}

// ========== PARAGON SPRITES (32x32, glowing effects) ==========

function drawParagonDart(ctx) {
  // Apex Bat — golden glowing bat punk
  fillRect(ctx, 10, 16, 12, 10, P.walletGold);
  fillRect(ctx, 11, 17, 10, 8, P.suitYellow);
  fillRect(ctx, 10, 4, 12, 12, P.walletGold);
  fillRect(ctx, 11, 5, 10, 10, P.suitYellow);
  // Crown
  fillRect(ctx, 12, 0, 8, 4, P.starYellow);
  fillRect(ctx, 14, 0, 2, 2, P.white);
  fillRect(ctx, 18, 0, 2, 2, P.white);
  // Eyes
  fillRect(ctx, 13, 8, 2, 2, P.capRed);
  fillRect(ctx, 18, 8, 2, 2, P.capRed);
  // Golden bat
  fillRect(ctx, 24, 2, 4, 16, P.starYellow);
  fillRect(ctx, 23, 0, 6, 4, P.walletGold);
  // Glow border
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 2, 16, 28);
}

function drawParagonBomb(ctx) {
  // Nuke — red/orange glowing explosive
  fillCirclePixel(ctx, 16, 16, 14, P.moabRed);
  fillCirclePixel(ctx, 16, 16, 11, P.moabRedLight);
  // Radiation symbol
  fillRect(ctx, 14, 8, 4, 4, P.starYellow);
  fillRect(ctx, 8, 14, 4, 4, P.starYellow);
  fillRect(ctx, 20, 14, 4, 4, P.starYellow);
  fillCirclePixel(ctx, 16, 16, 3, P.black);
  fillCirclePixel(ctx, 16, 16, 1, P.starYellow);
  // Glow
  ctx.strokeStyle = '#ff4400';
  ctx.lineWidth = 2;
  ctx.strokeRect(2, 2, 28, 28);
}

function drawParagonIce(ctx) {
  // Entropy Engine — blue/white crystalline
  fillRect(ctx, 4, 4, 24, 24, P.visorCyan);
  fillRect(ctx, 6, 6, 20, 20, P.visorDark);
  // Crystal structure
  fillRect(ctx, 14, 2, 4, 28, P.tweetBlueLight);
  fillRect(ctx, 2, 14, 28, 4, P.tweetBlueLight);
  fillRect(ctx, 8, 8, 4, 4, P.white);
  fillRect(ctx, 20, 8, 4, 4, P.white);
  fillRect(ctx, 8, 20, 4, 4, P.white);
  fillRect(ctx, 20, 20, 4, 4, P.white);
  fillCirclePixel(ctx, 16, 16, 4, P.white);
  ctx.strokeStyle = '#88ddff';
  ctx.lineWidth = 2;
  ctx.strokeRect(3, 3, 26, 26);
}

function drawParagonSniper(ctx) {
  // One-Tap — golden laser punk
  fillRect(ctx, 10, 16, 12, 10, P.walletGold);
  fillRect(ctx, 10, 4, 12, 12, P.walletGold);
  fillRect(ctx, 11, 5, 10, 10, P.suitYellow);
  // Golden visor
  fillRect(ctx, 10, 8, 12, 3, P.starYellow);
  // Massive lasers
  fillRect(ctx, 0, 9, 10, 3, P.laserRed);
  fillRect(ctx, 22, 9, 10, 3, P.laserRed);
  // Crosshair
  fillRect(ctx, 24, 4, 1, 8, P.laserRed);
  fillRect(ctx, 20, 7, 8, 1, P.laserRed);
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.strokeRect(8, 2, 16, 28);
}

function drawParagonWizard(ctx) {
  // Archdemon Lord — dark purple with fire
  fillRect(ctx, 8, 16, 16, 12, P.badPurple);
  fillRect(ctx, 9, 17, 14, 10, P.badDark);
  fillRect(ctx, 8, 4, 16, 14, P.badPurple);
  fillRect(ctx, 9, 5, 14, 12, P.badLight);
  // Horns
  fillRect(ctx, 6, 0, 4, 6, P.moabRed);
  fillRect(ctx, 22, 0, 4, 6, P.moabRed);
  // Flaming eyes
  fillRect(ctx, 11, 8, 3, 3, P.moabEye);
  fillRect(ctx, 18, 8, 3, 3, P.moabEye);
  fillRect(ctx, 12, 9, 1, 1, P.moabRed);
  fillRect(ctx, 19, 9, 1, 1, P.moabRed);
  // Triple beam
  fillRect(ctx, 26, 12, 6, 2, P.wizardPurple);
  fillRect(ctx, 26, 16, 6, 2, P.wizardPurple);
  fillRect(ctx, 26, 20, 6, 2, P.wizardPurple);
  ctx.strokeStyle = '#ff00ff';
  ctx.lineWidth = 2;
  ctx.strokeRect(6, 0, 20, 30);
}

function drawParagonBanana(ctx) {
  // Infinite Money Glitch — golden money printer
  fillRect(ctx, 4, 8, 24, 18, P.walletGold);
  fillRect(ctx, 5, 9, 22, 16, P.suitYellow);
  // Glitch lines
  fillRect(ctx, 6, 12, 20, 1, P.starYellow);
  fillRect(ctx, 6, 16, 20, 1, P.starYellow);
  fillRect(ctx, 6, 20, 20, 1, P.starYellow);
  // Dollar signs
  fillRect(ctx, 10, 10, 2, 6, P.moneyGreen);
  fillRect(ctx, 9, 11, 4, 1, P.moneyGreen);
  fillRect(ctx, 9, 13, 4, 1, P.moneyGreen);
  fillRect(ctx, 9, 15, 4, 1, P.moneyGreen);
  fillRect(ctx, 18, 10, 2, 6, P.moneyGreen);
  fillRect(ctx, 17, 11, 4, 1, P.moneyGreen);
  fillRect(ctx, 17, 13, 4, 1, P.moneyGreen);
  fillRect(ctx, 17, 15, 4, 1, P.moneyGreen);
  // Flying money
  fillRect(ctx, 8, 2, 4, 3, P.moneyLight);
  fillRect(ctx, 16, 4, 4, 3, P.moneyLight);
  fillRect(ctx, 22, 2, 4, 3, P.moneyLight);
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 2;
  ctx.strokeRect(3, 6, 26, 22);
}

// ========== BOSS SPRITES (32x32, distinctive designs) ==========

function drawBossBear(ctx) {
  // Giant armored bear with shield aura
  fillRect(ctx, 2, 2, 28, 26, P.moabRed);
  fillRect(ctx, 3, 3, 26, 24, P.moabRedLight);
  // Armor plates
  fillRect(ctx, 2, 2, 28, 3, P.moabRedDark);
  fillRect(ctx, 2, 25, 28, 3, P.moabRedDark);
  // Ears
  fillRect(ctx, 0, 0, 6, 5, P.moabRed);
  fillRect(ctx, 26, 0, 6, 5, P.moabRed);
  // Eyes (glowing yellow)
  fillRect(ctx, 8, 8, 5, 4, P.black);
  fillRect(ctx, 19, 8, 5, 4, P.black);
  fillRect(ctx, 9, 9, 3, 2, P.moabEye);
  fillRect(ctx, 20, 9, 3, 2, P.moabEye);
  // Snout with fangs
  fillRect(ctx, 10, 14, 12, 6, P.moabRedDark);
  fillRect(ctx, 11, 18, 3, 3, P.white);
  fillRect(ctx, 18, 18, 3, 3, P.white);
  fillRect(ctx, 13, 14, 6, 3, P.black);
  // Crown (boss indicator)
  fillRect(ctx, 10, 0, 12, 3, P.walletGold);
  fillRect(ctx, 12, 0, 2, 1, P.starYellow);
  fillRect(ctx, 18, 0, 2, 1, P.starYellow);
  fillRect(ctx, 15, 0, 2, 1, P.starYellow);
  // Shield icon on chest
  fillRect(ctx, 13, 22, 6, 5, P.walletGrey);
  fillRect(ctx, 14, 23, 4, 3, P.walletLight);
}

function drawBossWhale(ctx) {
  // Massive blue whale with crash aura
  fillRect(ctx, 1, 6, 30, 20, P.visorCyan);
  fillRect(ctx, 2, 7, 28, 18, P.visorDark);
  // Head (rounder)
  fillCirclePixel(ctx, 8, 16, 8, P.visorCyan);
  // Tail
  fillRect(ctx, 26, 4, 6, 6, P.visorCyan);
  fillRect(ctx, 26, 20, 6, 6, P.visorCyan);
  // Gold dollar eyes
  fillCirclePixel(ctx, 8, 12, 3, P.walletGold);
  fillRect(ctx, 7, 12, 2, 2, P.black);
  // Belly
  fillRect(ctx, 6, 18, 18, 6, P.tweetBlueLight);
  // Money bags
  fillRect(ctx, 16, 10, 6, 6, P.walletGold);
  fillRect(ctx, 17, 11, 4, 4, P.suitYellow);
  fillRect(ctx, 18, 12, 2, 2, P.walletDark);
  // Crash aura ring
  ctx.strokeStyle = '#ff4444';
  ctx.lineWidth = 1;
  ctx.strokeRect(0, 4, 32, 24);
  // Crown
  fillRect(ctx, 4, 2, 10, 3, P.walletGold);
}

function drawBossHack(ctx) {
  // Dark hooded figure with glitch effects
  fillRect(ctx, 4, 4, 24, 24, P.ddtNavy);
  fillRect(ctx, 5, 5, 22, 22, P.ddtDark);
  // Hood
  fillRect(ctx, 6, 0, 20, 10, P.ddtNavy);
  fillRect(ctx, 8, 2, 16, 6, P.ddtLight);
  // Glowing code eyes
  fillRect(ctx, 10, 8, 4, 3, P.punkGreen);
  fillRect(ctx, 18, 8, 4, 3, P.punkGreen);
  fillRect(ctx, 11, 9, 2, 1, P.punkGreenLight);
  fillRect(ctx, 19, 9, 2, 1, P.punkGreenLight);
  // Binary code on body
  fillRect(ctx, 8, 14, 1, 1, P.punkGreen);
  fillRect(ctx, 10, 15, 1, 1, P.punkGreen);
  fillRect(ctx, 13, 14, 1, 1, P.punkGreen);
  fillRect(ctx, 15, 16, 1, 1, P.punkGreen);
  fillRect(ctx, 18, 14, 1, 1, P.punkGreen);
  fillRect(ctx, 21, 15, 1, 1, P.punkGreen);
  fillRect(ctx, 23, 14, 1, 1, P.punkGreen);
  fillRect(ctx, 12, 18, 1, 1, P.punkGreen);
  fillRect(ctx, 16, 20, 1, 1, P.punkGreen);
  fillRect(ctx, 20, 19, 1, 1, P.punkGreen);
  // Glitch lines
  fillRect(ctx, 0, 12, 32, 1, P.punkGreenLight);
  fillRect(ctx, 0, 22, 32, 1, P.punkGreenLight);
  // Crown
  fillRect(ctx, 10, 0, 12, 2, P.walletGold);
}

function drawBossRug(ctx) {
  // Massive rug with skull and tentacles
  fillRect(ctx, 1, 4, 30, 24, P.badPurple);
  fillRect(ctx, 2, 5, 28, 22, P.badDark);
  // Rug pattern
  fillRect(ctx, 4, 8, 24, 2, P.badGlow);
  fillRect(ctx, 4, 22, 24, 2, P.badGlow);
  fillRect(ctx, 4, 8, 2, 16, P.badGlow);
  fillRect(ctx, 26, 8, 2, 16, P.badGlow);
  // Skull face
  fillRect(ctx, 10, 10, 12, 10, P.badLight);
  fillRect(ctx, 12, 12, 3, 3, P.badGlow);
  fillRect(ctx, 19, 12, 3, 3, P.badGlow);
  fillRect(ctx, 13, 13, 1, 1, P.black);
  fillRect(ctx, 20, 13, 1, 1, P.black);
  // Teeth
  fillRect(ctx, 12, 18, 2, 2, P.white);
  fillRect(ctx, 15, 18, 2, 2, P.white);
  fillRect(ctx, 18, 18, 2, 2, P.white);
  // Tentacles at bottom
  fillRect(ctx, 4, 26, 3, 4, P.badPurple);
  fillRect(ctx, 10, 27, 3, 3, P.badPurple);
  fillRect(ctx, 16, 26, 3, 4, P.badPurple);
  fillRect(ctx, 22, 27, 3, 3, P.badPurple);
  fillRect(ctx, 28, 26, 3, 4, P.badPurple);
  // Crown
  fillRect(ctx, 8, 0, 16, 4, P.walletGold);
  fillRect(ctx, 10, 0, 2, 2, P.starYellow);
  fillRect(ctx, 15, 0, 2, 2, P.starYellow);
  fillRect(ctx, 20, 0, 2, 2, P.starYellow);
}

// ========== HERO SPRITES (36px conceptual, drawn on 32x32) ==========

function drawHeroSatoshi(ctx) {
  // SATOSHI — Bitcoin OG, golden hoodie, BTC symbol, laser eyes
  fillRect(ctx, 10, 16, 12, 10, P.fuseOrange);
  fillRect(ctx, 11, 17, 10, 8, P.suitYellow);
  // BTC symbol on chest
  fillRect(ctx, 14, 19, 4, 4, P.black);
  fillRect(ctx, 15, 20, 2, 2, P.fuseOrange);
  // Head
  fillRect(ctx, 10, 4, 12, 12, P.skin);
  fillRect(ctx, 11, 5, 10, 10, P.skinLight);
  // Hood
  fillRect(ctx, 8, 2, 16, 6, P.fuseOrange);
  fillRect(ctx, 9, 3, 14, 4, P.suitYellow);
  // Glowing eyes
  fillRect(ctx, 12, 8, 3, 2, P.laserRed);
  fillRect(ctx, 18, 8, 3, 2, P.laserRed);
  fillRect(ctx, 13, 8, 1, 1, P.white);
  fillRect(ctx, 19, 8, 1, 1, P.white);
  // Determined mouth
  fillRect(ctx, 14, 13, 4, 1, P.skinDark);
  // Arms
  fillRect(ctx, 6, 17, 4, 4, P.fuseOrange);
  fillRect(ctx, 22, 17, 4, 4, P.fuseOrange);
  // Legs
  fillRect(ctx, 12, 26, 3, 4, P.suitGrey);
  fillRect(ctx, 18, 26, 3, 4, P.suitGrey);
  // Golden glow outline
  ctx.strokeStyle = '#ffcc00';
  ctx.lineWidth = 1;
  ctx.strokeRect(8, 2, 16, 28);
}

function drawHeroDegen(ctx) {
  // DEGEN APE — Brown furry ape, banana, wild expression
  fillRect(ctx, 9, 14, 14, 12, P.ceramicBrown);
  fillRect(ctx, 10, 15, 12, 10, P.ceramicLight);
  // Head (round ape)
  fillRect(ctx, 8, 2, 16, 14, P.ceramicBrown);
  fillRect(ctx, 9, 3, 14, 12, P.ceramicLight);
  // Ears
  fillCirclePixel(ctx, 7, 8, 3, P.ceramicBrown);
  fillCirclePixel(ctx, 25, 8, 3, P.ceramicBrown);
  fillCirclePixel(ctx, 7, 8, 1, P.ceramicLight);
  fillCirclePixel(ctx, 25, 8, 1, P.ceramicLight);
  // Wide crazy eyes
  fillRect(ctx, 11, 7, 4, 4, P.white);
  fillRect(ctx, 18, 7, 4, 4, P.white);
  fillRect(ctx, 12, 8, 2, 2, P.black);
  fillRect(ctx, 19, 8, 2, 2, P.black);
  // Big grin
  fillRect(ctx, 12, 12, 8, 2, P.ceramicDark);
  fillRect(ctx, 13, 12, 1, 1, P.white);
  fillRect(ctx, 18, 12, 1, 1, P.white);
  // Banana in hand
  fillRect(ctx, 24, 18, 2, 8, P.suitYellow);
  fillRect(ctx, 25, 16, 2, 3, P.suitYellow);
  // Arms
  fillRect(ctx, 5, 16, 4, 5, P.ceramicBrown);
  fillRect(ctx, 23, 16, 4, 5, P.ceramicBrown);
  // Legs
  fillRect(ctx, 11, 26, 4, 4, P.ceramicDark);
  fillRect(ctx, 18, 26, 4, 4, P.ceramicDark);
}

function drawHeroWhale(ctx) {
  // WHALE — Blue whale shape with coin eyes
  // Body (whale shape)
  fillRect(ctx, 4, 8, 24, 16, P.visorCyan);
  fillRect(ctx, 5, 9, 22, 14, P.visorDark);
  fillCirclePixel(ctx, 16, 16, 10, P.visorCyan);
  fillCirclePixel(ctx, 16, 16, 8, P.visorDark);
  // Head bump
  fillRect(ctx, 3, 10, 6, 10, P.visorCyan);
  // Tail
  fillRect(ctx, 24, 6, 6, 6, P.visorCyan);
  fillRect(ctx, 24, 18, 6, 6, P.visorCyan);
  fillRect(ctx, 26, 8, 4, 4, P.visorDark);
  fillRect(ctx, 26, 18, 4, 4, P.visorDark);
  // Gold coin eyes
  fillCirclePixel(ctx, 10, 14, 3, P.walletGold);
  fillRect(ctx, 10, 14, 2, 2, P.black);
  // Belly
  fillRect(ctx, 8, 18, 16, 4, P.tweetBlueLight);
  // Water spout
  fillRect(ctx, 14, 2, 2, 6, P.tweetBlueLight);
  fillRect(ctx, 12, 2, 2, 2, P.tweetBlueLight);
  fillRect(ctx, 18, 2, 2, 2, P.tweetBlueLight);
  // Money symbols
  fillRect(ctx, 16, 12, 2, 4, P.walletGold);
  fillRect(ctx, 15, 13, 4, 1, P.walletGold);
  fillRect(ctx, 15, 15, 4, 1, P.walletGold);
}

function drawHeroRugged(ctx) {
  // RUG SURVIVOR — Tattered clothes, magnifying glass, suspicious look
  fillRect(ctx, 10, 16, 12, 10, P.hedgeGrey);
  fillRect(ctx, 11, 17, 10, 8, P.hedgeLight);
  // Torn edges
  fillRect(ctx, 10, 24, 2, 3, P.hedgeDark);
  fillRect(ctx, 14, 25, 2, 2, P.hedgeDark);
  fillRect(ctx, 20, 24, 2, 3, P.hedgeDark);
  // Head
  fillRect(ctx, 10, 4, 12, 12, P.skin);
  fillRect(ctx, 11, 5, 10, 10, P.skinLight);
  // Messy hair
  fillRect(ctx, 9, 2, 14, 4, P.rugPinkDark);
  fillRect(ctx, 11, 0, 3, 3, P.rugPinkDark);
  fillRect(ctx, 18, 1, 3, 2, P.rugPinkDark);
  fillRect(ctx, 8, 4, 2, 3, P.rugPinkDark);
  // Suspicious narrow eyes
  fillRect(ctx, 12, 9, 3, 1, P.black);
  fillRect(ctx, 18, 9, 3, 1, P.black);
  fillRect(ctx, 13, 8, 1, 1, P.black); // eyebrow
  fillRect(ctx, 19, 8, 1, 1, P.black);
  // Frown
  fillRect(ctx, 14, 13, 4, 1, P.skinDark);
  // Magnifying glass
  fillCirclePixel(ctx, 27, 10, 4, P.walletGold);
  fillCirclePixel(ctx, 27, 10, 2, P.tweetBlueLight);
  fillRect(ctx, 24, 14, 2, 6, P.walletDark);
  // Arms
  fillRect(ctx, 6, 17, 4, 4, P.skin);
  fillRect(ctx, 22, 17, 4, 4, P.skin);
  // Legs
  fillRect(ctx, 12, 26, 3, 4, P.hedgeDark);
  fillRect(ctx, 18, 26, 3, 4, P.hedgeDark);
}

function drawHeroSatoshiProjectile(ctx) {
  // Golden bolt
  fillRect(ctx, 2, 3, 8, 6, P.fuseOrange);
  fillRect(ctx, 3, 4, 6, 4, P.suitYellow);
  fillRect(ctx, 5, 2, 2, 2, P.starYellow);
}

function drawHeroDegenProjectile(ctx) {
  // Banana peel
  fillRect(ctx, 3, 2, 6, 8, P.suitYellow);
  fillRect(ctx, 4, 3, 4, 6, P.fuseOrange);
}

function drawHeroWhaleProjectile(ctx) {
  // Water blast
  fillCirclePixel(ctx, 6, 6, 4, P.visorCyan);
  fillCirclePixel(ctx, 6, 6, 2, P.tweetBlueLight);
}

function drawHeroRuggedProjectile(ctx) {
  // Magic bolt (purple)
  fillRect(ctx, 3, 3, 6, 6, P.rugPink);
  fillRect(ctx, 4, 4, 4, 4, P.rugPinkLight);
  fillRect(ctx, 5, 2, 2, 2, P.starYellow);
}

// ========== PROJECTILE SPRITES ==========

function drawBonkProjectile(ctx) {
  // Small bat
  fillRect(ctx, 2, 1, 4, 10, P.batBrown);
  fillRect(ctx, 3, 2, 2, 8, P.batLight);
  fillRect(ctx, 1, 0, 6, 2, P.batBrown);
}

function drawPepeProjectile(ctx) {
  // Small pepe face
  fillRect(ctx, 2, 2, 8, 8, P.pepeGreen);
  fillRect(ctx, 3, 3, 6, 6, P.pepeLight);
  fillRect(ctx, 4, 4, 2, 1, P.black);
  fillRect(ctx, 7, 4, 2, 1, P.black);
}

function drawWojakTear(ctx) {
  // Teardrop
  fillRect(ctx, 4, 1, 4, 2, P.wojakTear);
  fillRect(ctx, 3, 3, 6, 4, P.wojakTear);
  fillRect(ctx, 4, 4, 4, 2, P.tweetBlueLight);
  fillRect(ctx, 3, 7, 6, 2, P.wojakTear);
  fillRect(ctx, 4, 9, 4, 2, P.wojakTear);
}

function drawLaserBeam(ctx) {
  // Laser line
  fillRect(ctx, 0, 3, 12, 2, P.laserRed);
  fillRect(ctx, 1, 4, 10, 1, P.laserPink);
  fillRect(ctx, 0, 2, 12, 1, P.laserPink);
}

function drawMagicBolt(ctx) {
  // Purple magic bolt
  fillRect(ctx, 3, 2, 6, 6, P.wizardPurple);
  fillRect(ctx, 4, 3, 4, 4, P.wizardLight);
  fillRect(ctx, 5, 0, 2, 2, P.starYellow);
  fillRect(ctx, 5, 8, 2, 2, P.starYellow);
  fillRect(ctx, 0, 4, 2, 2, P.starYellow);
  fillRect(ctx, 9, 4, 2, 2, P.starYellow);
}

function drawSniperBullet(ctx) {
  fillRect(ctx, 2, 4, 8, 4, P.btcOrange);
  fillRect(ctx, 3, 5, 6, 2, P.btcLight);
}

function drawMevProjectile(ctx) {
  // Homing green bolt
  fillRect(ctx, 3, 3, 6, 6, P.punkGreen);
  fillRect(ctx, 4, 4, 4, 4, P.visorCyan);
  fillRect(ctx, 5, 2, 2, 2, P.punkGreenLight);
  fillRect(ctx, 5, 8, 2, 2, P.punkGreenLight);
}

function drawFlipperProjectile(ctx) {
  // Boomerang
  fillRect(ctx, 1, 4, 10, 3, P.suitYellow);
  fillRect(ctx, 0, 3, 3, 5, P.fuseOrange);
  fillRect(ctx, 9, 3, 3, 5, P.fuseOrange);
  fillRect(ctx, 4, 5, 4, 1, P.white);
}

function drawAlchemistProjectile(ctx) {
  // Acid blob
  fillCirclePixel(ctx, 6, 6, 4, P.punkGreenLight);
  fillCirclePixel(ctx, 6, 6, 2, P.visorCyan);
  fillRect(ctx, 4, 2, 1, 1, P.punkGreen);
  fillRect(ctx, 8, 3, 1, 1, P.punkGreen);
}

// ========== HELPERS ==========

function fillRect(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

function fillCirclePixel(ctx, cx, cy, r, color) {
  // Draw a pixelated circle
  ctx.fillStyle = color;
  for (let y = cy - r; y <= cy + r; y++) {
    for (let x = cx - r; x <= cx + r; x++) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r * r) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
}

// ========== TEXTURE GENERATION ==========

function createTexture(scene, key, drawFn, size = SIZE) {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Clear with transparency
  ctx.clearRect(0, 0, size, size);

  drawFn(ctx);

  // Add to Phaser texture manager
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }
  scene.textures.addCanvas(key, canvas);
}

// ========== PUBLIC API ==========

export function generateAllSprites(scene) {
  // Towers
  createTexture(scene, 'tower_bonk', drawBonk);
  createTexture(scene, 'tower_pepe', drawPepe);
  createTexture(scene, 'tower_wojak', drawWojak);
  createTexture(scene, 'tower_yield', drawYieldFarm);
  createTexture(scene, 'tower_laser', drawLaserEyes);
  createTexture(scene, 'tower_doge', drawDogeWizard);
  createTexture(scene, 'tower_mev', drawMevPunk);
  createTexture(scene, 'tower_flipper', drawFlipperPunk);
  createTexture(scene, 'tower_alchemist', drawAlchemistPunk);
  createTexture(scene, 'tower_spikefactory', drawSpikeFactoryPunk);

  // Enemies
  createTexture(scene, 'enemy_candle', drawRedCandle);
  createTexture(scene, 'enemy_fud', drawFudTweet);
  createTexture(scene, 'enemy_bear', drawBear);
  createTexture(scene, 'enemy_suit', drawSecSuit);
  createTexture(scene, 'enemy_rug', drawRugPull);
  createTexture(scene, 'enemy_whale', drawWhaleWallet);
  createTexture(scene, 'enemy_darkpool', drawDarkPool);
  createTexture(scene, 'enemy_bearmarket', drawBearMarket);
  createTexture(scene, 'enemy_blackswan', drawBlackSwan);
  createTexture(scene, 'enemy_paperhands', drawPaperHands);
  createTexture(scene, 'enemy_hedgefund', drawHedgeFund);
  createTexture(scene, 'enemy_altseason', drawAltcoinSeason);
  createTexture(scene, 'enemy_diamondsafe', drawDiamondSafe);
  createTexture(scene, 'enemy_cryptowinter', drawCryptoWinter);
  createTexture(scene, 'enemy_totalcollapse', drawTotalCollapse);
  createTexture(scene, 'enemy_flashcrash', drawFlashCrash);
  createTexture(scene, 'enemy_protocolhack', drawProtocolHack);

  // Paragons
  createTexture(scene, 'paragon_dart', drawParagonDart);
  createTexture(scene, 'paragon_bomb', drawParagonBomb);
  createTexture(scene, 'paragon_ice', drawParagonIce);
  createTexture(scene, 'paragon_sniper', drawParagonSniper);
  createTexture(scene, 'paragon_wizard', drawParagonWizard);
  createTexture(scene, 'paragon_banana', drawParagonBanana);

  // Bosses
  createTexture(scene, 'boss_bear', drawBossBear);
  createTexture(scene, 'boss_whale', drawBossWhale);
  createTexture(scene, 'boss_hack', drawBossHack);
  createTexture(scene, 'boss_rug', drawBossRug);

  // Heroes (32x32 but displayed larger)
  createTexture(scene, 'hero_satoshi', drawHeroSatoshi);
  createTexture(scene, 'hero_degen', drawHeroDegen);
  createTexture(scene, 'hero_whale', drawHeroWhale);
  createTexture(scene, 'hero_rugged', drawHeroRugged);

  // Hero projectiles
  createTexture(scene, 'proj_satoshi', drawHeroSatoshiProjectile, 12);
  createTexture(scene, 'proj_degen', drawHeroDegenProjectile, 12);
  createTexture(scene, 'proj_whale', drawHeroWhaleProjectile, 12);
  createTexture(scene, 'proj_rugged', drawHeroRuggedProjectile, 12);

  // Projectiles (smaller: 12x12)
  createTexture(scene, 'proj_bonk', drawBonkProjectile, 12);
  createTexture(scene, 'proj_pepe', drawPepeProjectile, 12);
  createTexture(scene, 'proj_tear', drawWojakTear, 12);
  createTexture(scene, 'proj_laser', drawLaserBeam, 12);
  createTexture(scene, 'proj_magic', drawMagicBolt, 12);
  createTexture(scene, 'proj_sniper', drawSniperBullet, 12);
  createTexture(scene, 'proj_mev', drawMevProjectile, 12);
  createTexture(scene, 'proj_flipper', drawFlipperProjectile, 12);
  createTexture(scene, 'proj_alchemist', drawAlchemistProjectile, 12);
}

// Mapping from tower/bloon IDs to texture keys
export const TOWER_TEXTURES = {
  dart: 'tower_bonk',
  bomb: 'tower_pepe',
  ice: 'tower_wojak',
  banana: 'tower_yield',
  sniper: 'tower_laser',
  wizard: 'tower_doge',
  mev: 'tower_mev',
  flipper: 'tower_flipper',
  alchemist: 'tower_alchemist',
  spikefactory: 'tower_spikefactory',
};

export const ENEMY_TEXTURES = {
  red: 'enemy_candle',
  blue: 'enemy_fud',
  green: 'enemy_bear',
  yellow: 'enemy_suit',
  pink: 'enemy_rug',
  lead: 'enemy_whale',
  camo: 'enemy_darkpool',
  moab: 'enemy_bearmarket',
  black: 'enemy_blackswan',
  white: 'enemy_paperhands',
  zebra: 'enemy_hedgefund',
  rainbow: 'enemy_altseason',
  ceramic: 'enemy_diamondsafe',
  bfb: 'enemy_cryptowinter',
  zomg: 'enemy_totalcollapse',
  ddt: 'enemy_flashcrash',
  bad: 'enemy_protocolhack',
  boss_bear: 'boss_bear',
  boss_whale: 'boss_whale',
  boss_hack: 'boss_hack',
  boss_rug: 'boss_rug',
};

export const HERO_TEXTURES = {
  satoshi: 'hero_satoshi',
  degen: 'hero_degen',
  whale: 'hero_whale',
  rugged: 'hero_rugged',
};

export const PROJECTILE_TEXTURES = {
  dart: 'proj_bonk',
  bomb: 'proj_pepe',
  ice: 'proj_tear',
  banana: null,
  sniper: 'proj_sniper',
  wizard: 'proj_magic',
  mev: 'proj_mev',
  flipper: 'proj_flipper',
  alchemist: 'proj_alchemist',
  spikefactory: null,
};
