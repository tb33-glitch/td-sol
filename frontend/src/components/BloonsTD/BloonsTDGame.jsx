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
      onRestart={() => window.location.reload()}
      onMenu={handleBackToMenu}
    />
  );
}

function GameView({ mapId, onRestart, onMenu }) {
  const {
    initGame,
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
  } = useBloonsTD(mapId);

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
        />
      </div>

      <TowerShop
        money={money}
        selectTowerToPlace={selectTowerToPlace}
        selectedTower={selectedTower}
        sellSelectedTower={sellSelectedTower}
        upgradeSelectedTower={upgradeSelectedTower}
        deselectTower={deselectTower}
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
