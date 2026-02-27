import { useState, useCallback } from 'react';
import useBloonsTD from '../../hooks/useBloonsTD';
import PhaserContainer from './PhaserContainer';
import GameHUD from './GameHUD';
import TowerShop from './TowerShop';
import GameOverScreen from './GameOverScreen';
import GameLobby from './GameLobby';
import './BloonsTDGame.css';

export default function BloonsTDGame() {
  const [screen, setScreen] = useState('lobby'); // 'lobby' | 'game'
  const [gameConfig, setGameConfig] = useState(null);

  const handleStartGame = useCallback((config) => {
    setGameConfig(config);
    setScreen('game');
  }, []);

  const handleBackToMenu = useCallback(() => {
    setScreen('lobby');
    setGameConfig(null);
    // Force remount by changing key
    window.location.reload();
  }, []);

  if (screen === 'lobby') {
    return <GameLobby onStartGame={handleStartGame} />;
  }

  return (
    <GameView
      mapId={gameConfig?.map || 'meadow'}
      difficulty={gameConfig?.difficulty || 'medium'}
      options={{
        heroId: gameConfig?.heroId,
        challenge: gameConfig?.challenge,
        sandbox: gameConfig?.sandbox,
      }}
      onRestart={() => window.location.reload()}
      onMenu={handleBackToMenu}
    />
  );
}

function GameView({ mapId, difficulty, options = {}, onRestart, onMenu }) {
  const {
    initGame,
    gameRef,
    lives,
    money,
    wave,
    totalWaves,
    gameSpeed,
    gameOver,
    selectedTower,
    isPaused,
    startWave,
    toggleSpeed,
    togglePause,
    selectTowerToPlace,
    deselectTower,
    sellSelectedTower,
    upgradeSelectedTower,
    cycleTargeting,
    abilities,
    activateAbility,
    wavePreview,
    heroLevel,
    activeSynergies,
    activeEvent,
    bossHP,
  } = useBloonsTD(mapId, difficulty, options);

  return (
    <div className="td-game-container">
      <div className="td-canvas-area">
        <PhaserContainer initGame={initGame} />

        <GameHUD
          lives={lives}
          money={money}
          wave={wave}
          totalWaves={totalWaves}
          gameSpeed={gameSpeed}
          isPaused={isPaused}
          startWave={startWave}
          toggleSpeed={toggleSpeed}
          togglePause={togglePause}
          abilities={abilities}
          activateAbility={activateAbility}
          wavePreview={wavePreview}
          heroLevel={heroLevel}
          activeEvent={activeEvent}
          bossHP={bossHP}
        />
      </div>

      <TowerShop
        money={money}
        selectTowerToPlace={selectTowerToPlace}
        selectedTower={selectedTower}
        sellSelectedTower={sellSelectedTower}
        upgradeSelectedTower={upgradeSelectedTower}
        deselectTower={deselectTower}
        cycleTargeting={cycleTargeting}
        gameRef={gameRef}
        activeSynergies={activeSynergies}
      />

      {gameOver && (
        <GameOverScreen
          data={gameOver}
          onRestart={onRestart}
          onMenu={onMenu}
        />
      )}
    </div>
  );
}
