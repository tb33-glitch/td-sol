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

        {data.challenge && data.won && (
          <div className="td-challenge-badge">
            Challenge Complete: {data.challenge}
          </div>
        )}

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
            <span>Punks Deployed</span>
            <span>{data.towersPlaced}</span>
          </div>
        </div>

        {data.popStats && data.popStats.length > 0 && (
          <div className="td-gameover-tokens">
            <div className="td-gameover-tokens-title">Tokens Destroyed</div>
            <div className="td-gameover-token-list">
              {data.popStats.slice(0, 10).map((token) => (
                <div key={token.address} className="td-gameover-token-row">
                  <span className="td-token-name" title={token.address}>
                    {token.symbol || token.name}
                  </span>
                  <span className="td-token-pops">x{token.pops}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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
