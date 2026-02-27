import { useRef, useEffect } from 'react';
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
  abilities,
  activateAbility,
  freeplay,
  wavePreview,
  heroLevel,
  activeEvent,
  bossHP,
}) {
  const moneyRef = useRef(null);
  const livesRef = useRef(null);
  const prevMoney = useRef(money);
  const prevLives = useRef(lives);

  // Flash money on change
  useEffect(() => {
    if (money !== prevMoney.current && moneyRef.current) {
      moneyRef.current.classList.remove('td-money-pulse');
      void moneyRef.current.offsetWidth;
      moneyRef.current.classList.add('td-money-pulse');
    }
    prevMoney.current = money;
  }, [money]);

  // Shake lives on loss
  useEffect(() => {
    if (lives < prevLives.current && livesRef.current) {
      livesRef.current.classList.remove('td-lives-shake');
      void livesRef.current.offsetWidth;
      livesRef.current.classList.add('td-lives-shake');
    }
    prevLives.current = lives;
  }, [lives]);

  return (
    <div className="td-hud">
      <div className="td-hud-left">
        <div className="td-stat td-lives" ref={livesRef}>
          <span className="td-stat-icon">&#9829;</span>
          <span className="td-stat-value">{lives}</span>
        </div>
        <div className="td-stat td-money" ref={moneyRef}>
          <span className="td-stat-icon">$</span>
          <span className="td-stat-value">{money}</span>
        </div>
      </div>

      <div className="td-hud-center">
        <div className="td-wave-info">
          Wave {wave} / {totalWaves}{freeplay ? '+' : ''}
        </div>
        {wavePreview && wavePreview.types && (
          <div className="td-wave-preview">
            Next: {wavePreview.types.map((t, i) => (
              <span key={i} className="td-wave-preview-type">{t}</span>
            ))}
          </div>
        )}
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

      {heroLevel > 0 && (
        <div className="td-hero-level-bar">
          <span className="td-hero-level-text">Hero Lv{heroLevel}</span>
        </div>
      )}

      {activeEvent && (
        <div className="td-event-banner">
          <div className="td-event-name">{activeEvent.name}</div>
          <div className="td-event-desc">{activeEvent.description}</div>
          <div className="td-event-duration">{activeEvent.wavesRemaining} waves remaining</div>
        </div>
      )}

      {bossHP && (
        <div className="td-boss-hp-bar">
          <div className="td-boss-name">{bossHP.name}</div>
          <div className="td-boss-hp-track">
            <div
              className="td-boss-hp-fill"
              style={{ width: `${(bossHP.current / bossHP.max) * 100}%` }}
            />
          </div>
          <div className="td-boss-hp-text">{bossHP.current} / {bossHP.max}</div>
        </div>
      )}

      {abilities && abilities.length > 0 && (
        <div className="td-ability-bar">
          {abilities.map((ab, i) => {
            const pct = ab.cooldown > 0 ? (ab.remaining / ab.cooldown) * 100 : 0;
            return (
              <button
                key={i}
                className={`td-ability-btn ${ab.ready ? 'ready' : 'cooling'}`}
                onClick={() => ab.ready && activateAbility(ab._towerRef)}
                disabled={!ab.ready}
                title={`${ab.name} (${ab.ready ? 'READY' : Math.ceil(ab.remaining / 1000) + 's'})`}
              >
                <div className="td-ability-name">{ab.name}</div>
                {!ab.ready && (
                  <div className="td-ability-cooldown" style={{ width: `${pct}%` }} />
                )}
                {!ab.ready && (
                  <div className="td-ability-timer">{Math.ceil(ab.remaining / 1000)}s</div>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
