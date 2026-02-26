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

  // Bonk (Shiba)
  shibaOrange: '#d4842a',
  shibaLight: '#e8a84c',
  shibaDark: '#a86420',
  batBrown: '#6b4226',
  batLight: '#8b6240',

  // Pepe
  pepeGreen: '#3a8a3a',
  pepeLight: '#5ab85a',
  pepeDark: '#2a6a2a',
  pepeLips: '#cc3333',

  // Wojak
  wojakSkin: '#f5deb3',
  wojakLight: '#fff0d0',
  wojakDark: '#c8a882',
  wojakTear: '#4488cc',
  wojakHair: '#444444',

  // Yield Farm
  printerGrey: '#888888',
  printerDark: '#555555',
  printerLight: '#aaaaaa',
  moneyGreen: '#44aa44',
  moneyLight: '#66dd66',

  // Laser Eyes BTC
  btcOrange: '#f7931a',
  btcDark: '#c77a15',
  btcLight: '#ffaa33',
  laserRed: '#ff0000',
  laserPink: '#ff4466',

  // Doge Wizard
  dogeYellow: '#d4aa3a',
  dogeLight: '#e8c85a',
  dogeDark: '#a88820',
  wizardPurple: '#7733cc',
  wizardLight: '#9955ee',
  starYellow: '#ffdd00',

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
};

// ========== PIXEL ART DEFINITIONS ==========
// Each is a function that draws on a 32x32 canvas context

function drawBonk(ctx) {
  // Shiba dog with baseball bat
  // Body
  fillRect(ctx, 10, 14, 12, 12, P.shibaOrange);
  fillRect(ctx, 11, 15, 10, 10, P.shibaLight);

  // Head
  fillRect(ctx, 10, 6, 12, 10, P.shibaOrange);
  fillRect(ctx, 11, 7, 10, 8, P.shibaLight);

  // Ears (triangles)
  fillRect(ctx, 8, 2, 4, 5, P.shibaOrange);
  fillRect(ctx, 9, 3, 2, 3, P.shibaLight);
  fillRect(ctx, 20, 2, 4, 5, P.shibaOrange);
  fillRect(ctx, 21, 3, 2, 3, P.shibaLight);

  // Eyes
  fillRect(ctx, 13, 9, 2, 2, P.black);
  fillRect(ctx, 18, 9, 2, 2, P.black);

  // Nose
  fillRect(ctx, 15, 12, 2, 2, P.black);

  // Mouth (smile)
  fillRect(ctx, 14, 14, 4, 1, P.shibaDark);

  // Bat
  fillRect(ctx, 24, 4, 3, 14, P.batBrown);
  fillRect(ctx, 25, 5, 1, 12, P.batLight);
  fillRect(ctx, 23, 2, 5, 3, P.batBrown);
  fillRect(ctx, 24, 3, 3, 1, P.batLight);

  // Legs
  fillRect(ctx, 11, 26, 3, 4, P.shibaDark);
  fillRect(ctx, 18, 26, 3, 4, P.shibaDark);

  // Feet
  fillRect(ctx, 10, 29, 5, 2, P.shibaDark);
  fillRect(ctx, 17, 29, 5, 2, P.shibaDark);
}

function drawPepe(ctx) {
  // Rare Pepe frog
  // Body
  fillRect(ctx, 8, 12, 16, 14, P.pepeGreen);
  fillRect(ctx, 9, 13, 14, 12, P.pepeLight);

  // Head
  fillRect(ctx, 6, 4, 20, 12, P.pepeGreen);
  fillRect(ctx, 7, 5, 18, 10, P.pepeLight);

  // Big eyes (bulging)
  fillRect(ctx, 8, 2, 7, 6, P.white);
  fillRect(ctx, 17, 2, 7, 6, P.white);
  fillRect(ctx, 11, 4, 3, 3, P.black);
  fillRect(ctx, 20, 4, 3, 3, P.black);

  // Mouth
  fillRect(ctx, 10, 12, 12, 3, P.pepeDark);
  fillRect(ctx, 11, 12, 10, 1, P.pepeLips);

  // Smug smile curve
  fillRect(ctx, 9, 11, 1, 1, P.pepeDark);
  fillRect(ctx, 22, 11, 1, 1, P.pepeDark);

  // Arms
  fillRect(ctx, 4, 16, 4, 6, P.pepeGreen);
  fillRect(ctx, 24, 16, 4, 6, P.pepeGreen);

  // Legs
  fillRect(ctx, 10, 26, 4, 4, P.pepeDark);
  fillRect(ctx, 18, 26, 4, 4, P.pepeDark);
  fillRect(ctx, 9, 29, 6, 2, P.pepeDark);
  fillRect(ctx, 17, 29, 6, 2, P.pepeDark);
}

function drawWojak(ctx) {
  // Crying Wojak
  // Head
  fillRect(ctx, 8, 4, 16, 18, P.wojakSkin);
  fillRect(ctx, 9, 5, 14, 16, P.wojakLight);

  // Hair (messy)
  fillRect(ctx, 7, 2, 18, 4, P.wojakHair);
  fillRect(ctx, 6, 4, 3, 2, P.wojakHair);
  fillRect(ctx, 23, 4, 3, 2, P.wojakHair);
  fillRect(ctx, 9, 1, 4, 2, P.wojakHair);
  fillRect(ctx, 18, 1, 5, 2, P.wojakHair);

  // Sad eyes
  fillRect(ctx, 11, 9, 4, 3, P.white);
  fillRect(ctx, 19, 9, 4, 3, P.white);
  fillRect(ctx, 12, 10, 2, 2, P.black);
  fillRect(ctx, 20, 10, 2, 2, P.black);

  // Eyebrows (worried, angled up toward center)
  fillRect(ctx, 10, 7, 5, 1, P.wojakHair);
  fillRect(ctx, 19, 7, 5, 1, P.wojakHair);
  fillRect(ctx, 11, 8, 2, 1, P.wojakHair);
  fillRect(ctx, 21, 8, 2, 1, P.wojakHair);

  // Tears
  fillRect(ctx, 11, 12, 2, 8, P.wojakTear);
  fillRect(ctx, 21, 12, 2, 8, P.wojakTear);
  fillRect(ctx, 10, 14, 1, 4, P.wojakTear);
  fillRect(ctx, 23, 14, 1, 4, P.wojakTear);

  // Frown
  fillRect(ctx, 13, 17, 6, 1, P.wojakDark);
  fillRect(ctx, 12, 16, 1, 1, P.wojakDark);
  fillRect(ctx, 19, 16, 1, 1, P.wojakDark);

  // Body
  fillRect(ctx, 10, 22, 12, 8, P.wojakSkin);
  fillRect(ctx, 11, 23, 10, 6, P.wojakLight);

  // Dripping tears on body
  fillRect(ctx, 12, 22, 1, 3, P.wojakTear);
  fillRect(ctx, 20, 22, 1, 3, P.wojakTear);
}

function drawYieldFarm(ctx) {
  // Money Printer Go Brrr
  // Printer body
  fillRect(ctx, 4, 10, 24, 14, P.printerGrey);
  fillRect(ctx, 5, 11, 22, 12, P.printerLight);
  fillRect(ctx, 4, 10, 24, 2, P.printerDark);

  // Screen/display
  fillRect(ctx, 7, 13, 8, 5, P.black);
  fillRect(ctx, 8, 14, 6, 3, P.moneyGreen);

  // "GO BRRR" text area
  fillRect(ctx, 8, 14, 1, 1, P.moneyLight);
  fillRect(ctx, 10, 14, 1, 1, P.moneyLight);
  fillRect(ctx, 12, 14, 1, 1, P.moneyLight);

  // Money coming out
  fillRect(ctx, 18, 8, 10, 6, P.moneyGreen);
  fillRect(ctx, 19, 9, 8, 4, P.moneyLight);
  fillRect(ctx, 20, 10, 2, 2, P.moneyGreen);

  // Dollar sign on money
  fillRect(ctx, 22, 9, 1, 4, P.moneyGreen);
  fillRect(ctx, 21, 10, 3, 1, P.moneyGreen);

  // Second bill
  fillRect(ctx, 20, 5, 8, 5, P.moneyGreen);
  fillRect(ctx, 21, 6, 6, 3, P.moneyLight);

  // Paper tray
  fillRect(ctx, 4, 24, 24, 3, P.printerDark);
  fillRect(ctx, 5, 25, 22, 1, P.printerGrey);

  // Base
  fillRect(ctx, 6, 27, 20, 3, P.printerDark);

  // Buttons
  fillRect(ctx, 17, 14, 2, 2, P.candleRed);
  fillRect(ctx, 17, 18, 2, 2, P.moneyGreen);
}

function drawLaserEyes(ctx) {
  // Bitcoin logo with laser eyes
  // Coin body
  fillCirclePixel(ctx, 16, 14, 11, P.btcOrange);
  fillCirclePixel(ctx, 16, 14, 9, P.btcLight);
  fillCirclePixel(ctx, 16, 14, 8, P.btcOrange);

  // B symbol
  fillRect(ctx, 13, 8, 2, 12, P.btcDark);
  fillRect(ctx, 15, 8, 4, 2, P.btcDark);
  fillRect(ctx, 15, 13, 4, 2, P.btcDark);
  fillRect(ctx, 15, 18, 4, 2, P.btcDark);
  fillRect(ctx, 19, 10, 2, 3, P.btcDark);
  fillRect(ctx, 19, 15, 2, 3, P.btcDark);

  // Vertical bars through B
  fillRect(ctx, 14, 6, 2, 2, P.btcDark);
  fillRect(ctx, 17, 6, 2, 2, P.btcDark);
  fillRect(ctx, 14, 20, 2, 2, P.btcDark);
  fillRect(ctx, 17, 20, 2, 2, P.btcDark);

  // Laser eyes
  fillRect(ctx, 0, 12, 12, 2, P.laserRed);
  fillRect(ctx, 1, 11, 8, 1, P.laserPink);
  fillRect(ctx, 1, 14, 8, 1, P.laserPink);

  fillRect(ctx, 20, 12, 12, 2, P.laserRed);
  fillRect(ctx, 23, 11, 8, 1, P.laserPink);
  fillRect(ctx, 23, 14, 8, 1, P.laserPink);

  // Eye glints
  fillRect(ctx, 11, 11, 2, 4, P.white);
  fillRect(ctx, 19, 11, 2, 4, P.white);
}

function drawDogeWizard(ctx) {
  // Doge in wizard hat
  // Wizard hat
  fillRect(ctx, 12, 0, 8, 2, P.wizardPurple);
  fillRect(ctx, 10, 2, 12, 2, P.wizardPurple);
  fillRect(ctx, 8, 4, 16, 2, P.wizardPurple);
  fillRect(ctx, 6, 6, 20, 2, P.wizardLight);

  // Star on hat
  fillRect(ctx, 15, 2, 2, 2, P.starYellow);
  fillRect(ctx, 14, 3, 4, 1, P.starYellow);

  // Doge face
  fillRect(ctx, 9, 8, 14, 12, P.dogeYellow);
  fillRect(ctx, 10, 9, 12, 10, P.dogeLight);

  // Snout
  fillRect(ctx, 12, 14, 8, 4, P.dogeYellow);
  fillRect(ctx, 13, 15, 6, 2, P.dogeLight);

  // Eyes
  fillRect(ctx, 11, 11, 3, 2, P.black);
  fillRect(ctx, 18, 11, 3, 2, P.black);
  fillRect(ctx, 12, 11, 1, 1, P.white);
  fillRect(ctx, 19, 11, 1, 1, P.white);

  // Nose
  fillRect(ctx, 15, 14, 2, 2, P.black);

  // Body (robe)
  fillRect(ctx, 8, 20, 16, 10, P.wizardPurple);
  fillRect(ctx, 9, 21, 14, 8, P.wizardLight);

  // Stars on robe
  fillRect(ctx, 11, 23, 2, 2, P.starYellow);
  fillRect(ctx, 19, 25, 2, 2, P.starYellow);

  // Wand
  fillRect(ctx, 24, 14, 2, 12, P.batBrown);
  fillRect(ctx, 23, 12, 4, 3, P.starYellow);
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

  // Enemies
  createTexture(scene, 'enemy_candle', drawRedCandle);
  createTexture(scene, 'enemy_fud', drawFudTweet);
  createTexture(scene, 'enemy_bear', drawBear);
  createTexture(scene, 'enemy_suit', drawSecSuit);
  createTexture(scene, 'enemy_rug', drawRugPull);
  createTexture(scene, 'enemy_whale', drawWhaleWallet);
  createTexture(scene, 'enemy_darkpool', drawDarkPool);
  createTexture(scene, 'enemy_bearmarket', drawBearMarket);

  // Projectiles (smaller: 12x12)
  createTexture(scene, 'proj_bonk', drawBonkProjectile, 12);
  createTexture(scene, 'proj_pepe', drawPepeProjectile, 12);
  createTexture(scene, 'proj_tear', drawWojakTear, 12);
  createTexture(scene, 'proj_laser', drawLaserBeam, 12);
  createTexture(scene, 'proj_magic', drawMagicBolt, 12);
  createTexture(scene, 'proj_sniper', drawSniperBullet, 12);
}

// Mapping from tower/bloon IDs to texture keys
export const TOWER_TEXTURES = {
  dart: 'tower_bonk',
  bomb: 'tower_pepe',
  ice: 'tower_wojak',
  banana: 'tower_yield',
  sniper: 'tower_laser',
  wizard: 'tower_doge',
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
};

export const PROJECTILE_TEXTURES = {
  dart: 'proj_bonk',
  bomb: 'proj_pepe',
  ice: 'proj_tear',
  banana: null,
  sniper: 'proj_sniper',
  wizard: 'proj_magic',
};
