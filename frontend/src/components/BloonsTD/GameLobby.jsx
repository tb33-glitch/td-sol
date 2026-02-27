import { useState, useEffect } from 'react';
import { MAPS } from '../../game/data/mapData';
import { DIFFICULTIES } from '../../game/data/waveData';
import { HEROES } from '../../game/data/heroData';
import { CHALLENGES } from '../../game/data/challengeData';
import { getPitHoldings } from '../../services/pitService';
import './BloonsTDGame.css';

export default function GameLobby({ onStartGame }) {
  const [selectedMap, setSelectedMap] = useState('meadow');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [selectedHero, setSelectedHero] = useState('satoshi');
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [lobbyTab, setLobbyTab] = useState('play'); // 'play' | 'challenges' | 'sandbox'
  const [pitStatus, setPitStatus] = useState({ loading: true, count: 0 });

  useEffect(() => {
    let cancelled = false;
    getPitHoldings().then((holdings) => {
      if (!cancelled) {
        setPitStatus({ loading: false, count: holdings.total });
      }
    }).catch(() => {
      if (!cancelled) setPitStatus({ loading: false, count: 0 });
    });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="td-lobby">
      <div className="td-lobby-panel">
        <h1 className="td-title">Meme TD</h1>
        <p className="td-subtitle">Tower Defense x Solana | Defend Your Portfolio</p>

        {pitStatus.count > 0 && (
          <div className={`td-pit-status ${pitStatus.loading ? '' : 'loaded'}`}>
            <span className="td-pit-dot" />
            {pitStatus.loading
              ? 'Raiding The Pit...'
              : `${pitStatus.count} dead tokens loaded from The Pit`
            }
          </div>
        )}

        <div className="td-map-select">
          <h3>Select Map</h3>
          <div className="td-map-grid">
            {Object.values(MAPS).map((map) => (
              <button
                key={map.id}
                className={`td-map-option ${selectedMap === map.id ? 'selected' : ''}`}
                onClick={() => setSelectedMap(map.id)}
              >
                <div
                  className="td-map-preview"
                  style={{
                    backgroundColor: '#' + map.backgroundColor.toString(16).padStart(6, '0'),
                  }}
                >
                  <MapPreview map={map} />
                </div>
                <div className="td-map-name">{map.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Hero Selection */}
        <div className="td-hero-select">
          <h3>Choose Your Hero</h3>
          <div className="td-hero-grid">
            {Object.values(HEROES).map((hero) => (
              <button
                key={hero.id}
                className={`td-hero-option ${selectedHero === hero.id ? 'selected' : ''}`}
                onClick={() => setSelectedHero(hero.id)}
              >
                <div
                  className="td-hero-portrait"
                  style={{ backgroundColor: '#' + hero.color.toString(16).padStart(6, '0') }}
                >
                  <span className="td-hero-initial">{hero.name[0]}</span>
                </div>
                <div className="td-hero-info">
                  <div className="td-hero-name">{hero.name}</div>
                  <div className="td-hero-theme">{hero.theme}</div>
                  <div className="td-hero-passive">{hero.passive.description}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="td-difficulty-select">
          <h3>Difficulty</h3>
          <div className="td-difficulty-grid">
            {Object.values(DIFFICULTIES).map((diff) => (
              <button
                key={diff.id}
                className={`td-difficulty-option ${selectedDifficulty === diff.id ? 'selected' : ''}`}
                onClick={() => setSelectedDifficulty(diff.id)}
              >
                <div className="td-difficulty-name">{diff.name}</div>
                <div className="td-difficulty-desc">{diff.description}</div>
                <div className="td-difficulty-stats">
                  {diff.lives} HP | ${diff.cash}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="td-mode-select">
          <button
            className="td-btn td-start-solo"
            onClick={() => onStartGame({
              map: selectedMap,
              mode: 'solo',
              difficulty: selectedDifficulty,
              heroId: selectedHero,
            })}
          >
            Solo Practice
          </button>
          <button
            className="td-btn td-sandbox-btn"
            onClick={() => onStartGame({
              map: selectedMap,
              mode: 'solo',
              difficulty: 'easy',
              heroId: selectedHero,
              sandbox: true,
            })}
          >
            Sandbox Mode
          </button>
          <button className="td-btn td-pvp-btn" disabled title="Coming in Phase 2">
            1v1 PvP Wager (Coming Soon)
          </button>
        </div>

        {/* Challenge Modes */}
        {typeof CHALLENGES !== 'undefined' && CHALLENGES && (
          <div className="td-challenge-select">
            <h3>Challenge Modes</h3>
            <div className="td-challenge-grid">
              {Object.values(CHALLENGES).map((ch) => (
                <button
                  key={ch.id}
                  className={`td-challenge-option ${selectedChallenge === ch.id ? 'selected' : ''}`}
                  onClick={() => setSelectedChallenge(selectedChallenge === ch.id ? null : ch.id)}
                >
                  <div className="td-challenge-name">{ch.name}</div>
                  <div className="td-challenge-desc">{ch.description}</div>
                  <div className="td-challenge-reward">{ch.rewardText}</div>
                </button>
              ))}
            </div>
            {selectedChallenge && (
              <button
                className="td-btn td-start-challenge"
                onClick={() => onStartGame({
                  map: selectedMap,
                  mode: 'solo',
                  difficulty: selectedDifficulty,
                  heroId: selectedHero,
                  challenge: selectedChallenge,
                })}
              >
                Start Challenge: {CHALLENGES[selectedChallenge]?.name}
              </button>
            )}
          </div>
        )}

        <div className="td-lobby-footer">
          <p>Space = Send Wave | Right-click = Cancel | ESC = Deselect</p>
          <p className="td-lobby-tagline">deploy memes. defeat FUD. earn SOL.</p>
        </div>
      </div>
    </div>
  );
}

function MapPreview({ map }) {
  const wp = map.waypoints;
  const pathColor = '#' + map.pathColor.toString(16).padStart(6, '0');
  const points = wp.map(([x, y]) => `${x * 100},${y * 100}`).join(' ');

  return (
    <svg viewBox="0 0 100 100" className="td-map-svg">
      <polyline
        points={points}
        fill="none"
        stroke={pathColor}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
