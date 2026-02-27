import { useState, useEffect, useRef, useCallback } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from '../game/config';
import eventBus from '../game/GameEventBus';

export default function useBloonsTD(mapId = 'meadow', difficulty = 'medium', options = {}) {
  const gameRef = useRef(null);
  const containerRef = useRef(null);
  const [lives, setLives] = useState(100);
  const [money, setMoney] = useState(650);
  const [wave, setWave] = useState(0);
  const [totalWaves, setTotalWaves] = useState(40);
  const [gameSpeed, setGameSpeed] = useState(1);
  const [gameOver, setGameOver] = useState(null);
  const [selectedTower, setSelectedTower] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [pitLoading, setPitLoading] = useState(false);
  const [pitTokenCount, setPitTokenCount] = useState(0);
  const [abilities, setAbilities] = useState([]);
  const [wavePreview, setWavePreview] = useState(null);
  const [heroLevel, setHeroLevel] = useState(0);
  const [heroXP, setHeroXP] = useState(0);
  const [activeSynergies, setActiveSynergies] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [bossHP, setBossHP] = useState(null);

  // Initialize Phaser game
  const initGame = useCallback((container) => {
    if (gameRef.current) return;
    containerRef.current = container;

    const config = createGameConfig(container, mapId, difficulty, options);
    gameRef.current = new Phaser.Game(config);
    setGameStarted(true);
  }, [mapId, difficulty, options]);

  // Subscribe to game events
  useEffect(() => {
    const unsubs = [
      eventBus.on('livesChanged', setLives),
      eventBus.on('moneyChanged', setMoney),
      eventBus.on('waveStarted', ({ wave: w, total }) => {
        setWave(w);
        setTotalWaves(total);
      }),
      eventBus.on('waveCompleted', ({ wave: w, total }) => {
        setWave(w);
        setTotalWaves(total);
      }),
      eventBus.on('waveInfo', ({ wave: w, total }) => {
        setWave(w);
        setTotalWaves(total);
      }),
      eventBus.on('speedChanged', setGameSpeed),
      eventBus.on('pauseChanged', setIsPaused),
      eventBus.on('gameOver', (data) => setGameOver(data)),
      eventBus.on('gameWon', (data) => setGameOver({ ...data, won: true })),
      eventBus.on('towerSelected', (tower) => {
        setSelectedTower({
          id: tower.towerId,
          x: tower.x,
          y: tower.y,
          stats: { ...tower.stats },
          upgradeLevels: { ...tower.upgradeLevels },
          sellValue: tower.getSellValue(),
          totalSpent: tower.totalSpent,
          targetingMode: tower.targetingMode || 'first',
          pops: tower.pops || 0,
          _ref: tower, // keep reference for actions
        });
        tower.showRange();
      }),
      eventBus.on('towerDeselected', () => setSelectedTower(null)),
      eventBus.on('towerUpgraded', () => {
        // Refresh selected tower data
      }),
      eventBus.on('abilitiesChanged', (abs) => setAbilities(abs)),
      eventBus.on('wavePreview', (data) => setWavePreview(data)),
      eventBus.on('pitLoadingStart', () => setPitLoading(true)),
      eventBus.on('pitLoadingEnd', ({ count }) => {
        setPitLoading(false);
        setPitTokenCount(count);
      }),
      eventBus.on('heroLevelUp', ({ level }) => setHeroLevel(level)),
      eventBus.on('synergiesChanged', (synergies) => setActiveSynergies(synergies)),
      eventBus.on('marketEvent', (evt) => setActiveEvent(evt)),
      eventBus.on('marketEventEnd', () => setActiveEvent(null)),
      eventBus.on('bossHP', (data) => setBossHP(data)),
    ];

    return () => unsubs.forEach(u => u());
  }, []);

  // Destroy game on unmount
  useEffect(() => {
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
      eventBus.removeAllListeners();
    };
  }, []);

  // Actions
  const startWave = useCallback(() => eventBus.emit('startWave'), []);
  const toggleSpeed = useCallback(() => eventBus.emit('toggleSpeed'), []);
  const togglePause = useCallback(() => eventBus.emit('togglePause'), []);
  const selectTowerToPlace = useCallback((towerId) => eventBus.emit('selectTowerToPlace', towerId), []);
  const cancelPlacement = useCallback(() => eventBus.emit('cancelPlacement'), []);
  const deselectTower = useCallback(() => eventBus.emit('deselectTower'), []);

  const sellSelectedTower = useCallback(() => {
    if (selectedTower?._ref) {
      eventBus.emit('sellTower', selectedTower._ref);
    }
  }, [selectedTower]);

  const upgradeSelectedTower = useCallback((path, tier) => {
    if (selectedTower?._ref) {
      eventBus.emit('upgradeTower', { tower: selectedTower._ref, path, tier });
    }
  }, [selectedTower]);

  const cycleTargeting = useCallback(() => {
    eventBus.emit('cycleTargeting');
  }, []);

  const activateAbility = useCallback((towerRef) => {
    eventBus.emit('activateAbility', towerRef);
  }, []);

  const mergeParagon = useCallback((towerId) => {
    eventBus.emit('mergeParagon', towerId);
  }, []);

  return {
    // Refs
    initGame,
    gameRef,
    // State
    lives,
    money,
    wave,
    totalWaves,
    gameSpeed,
    gameOver,
    selectedTower,
    isPaused,
    gameStarted,
    pitLoading,
    pitTokenCount,
    // Actions
    startWave,
    toggleSpeed,
    togglePause,
    selectTowerToPlace,
    cancelPlacement,
    deselectTower,
    sellSelectedTower,
    upgradeSelectedTower,
    cycleTargeting,
    abilities,
    activateAbility,
    wavePreview,
    heroLevel,
    heroXP,
    activeSynergies,
    activeEvent,
    bossHP,
    mergeParagon,
  };
}
