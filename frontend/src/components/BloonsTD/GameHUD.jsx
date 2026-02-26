import './BloonsTDGame.css';

export default function GameHUD({
  lives,
  money,
  wave,
  totalWaves,
  gameSpeed,
  isPaused,
  startWave,
  toggleSpeed,
  togglePause,
}) {
  return (
    <div className="td-hud">
      <div className="td-hud-left">
        <div className="td-stat td-lives">
          <span className="td-stat-icon">&#9829;</span>
          <span className="td-stat-value">{lives}</span>
        </div>
        <div className="td-stat td-money">
          <span className="td-stat-icon">$</span>
          <span className="td-stat-value">{money}</span>
        </div>
      </div>

      <div className="td-hud-center">
        <div className="td-wave-info">
          Wave {wave} / {totalWaves}
        </div>
      </div>

      <div className="td-hud-right">
        <button
          className="td-btn td-speed-btn"
          onClick={toggleSpeed}
          title="Toggle speed"
        >
          {gameSpeed}x
        </button>
        <button
          className="td-btn td-pause-btn"
          onClick={togglePause}
          title={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? 'PLAY' : 'PAUSE'}
        </button>
        <button
          className="td-btn td-start-btn"
          onClick={startWave}
          title="Start next wave (Space)"
        >
          SEND IT
        </button>
      </div>
    </div>
  );
}
