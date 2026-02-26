import './BloonsTDGame.css';

export default function GameOverScreen({ data, onRestart, onMenu }) {
  if (!data) return null;

  return (
    <div className="td-gameover-overlay">
      <div className="td-gameover-panel">
        <h2 className={data.won ? 'td-victory' : 'td-defeat'}>
          {data.won ? 'PORTFOLIO SAVED' : 'LIQUIDATED'}
        </h2>
        <p className="td-gameover-subtitle">
          {data.won ? 'The FUD has been defeated. Your bags are safe.' : 'The bears got through. Your portfolio is rekt.'}
        </p>

        <div className="td-gameover-stats">
          <div className="td-gameover-stat">
            <span>Waves Survived</span>
            <span>{data.wave} / {data.totalWaves}</span>
          </div>
          <div className="td-gameover-stat">
            <span>FUD Destroyed</span>
            <span>{data.totalPops}</span>
          </div>
          <div className="td-gameover-stat">
            <span>Memes Deployed</span>
            <span>{data.towersPlaced}</span>
          </div>
        </div>

        <div className="td-gameover-actions">
          <button className="td-btn td-restart-btn" onClick={onRestart}>
            Ape In Again
          </button>
          <button className="td-btn" onClick={onMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}
