import './BloonsTDGame.css';

export default function GameOverScreen({ data, onRestart, onMenu }) {
  if (!data) return null;

  return (
    <div className="td-gameover-overlay">
      <div className="td-gameover-panel">
        <h2 className={data.won ? 'td-victory' : 'td-defeat'}>
          {data.won ? 'VICTORY!' : 'DEFEAT'}
        </h2>

        <div className="td-gameover-stats">
          <div className="td-gameover-stat">
            <span>Waves Survived</span>
            <span>{data.wave} / {data.totalWaves}</span>
          </div>
          <div className="td-gameover-stat">
            <span>Total Pops</span>
            <span>{data.totalPops}</span>
          </div>
          <div className="td-gameover-stat">
            <span>Towers Placed</span>
            <span>{data.towersPlaced}</span>
          </div>
        </div>

        <div className="td-gameover-actions">
          <button className="td-btn td-restart-btn" onClick={onRestart}>
            Play Again
          </button>
          <button className="td-btn" onClick={onMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
