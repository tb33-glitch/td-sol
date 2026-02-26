import { useState } from 'react';
import { MAPS } from '../../game/data/mapData';
import './BloonsTDGame.css';

export default function GameLobby({ onStartGame }) {
  const [selectedMap, setSelectedMap] = useState('meadow');

  return (
    <div className="td-lobby">
      <div className="td-lobby-panel">
        <h1 className="td-title">Meme TD</h1>
        <p className="td-subtitle">Tower Defense x Solana | Defend Your Portfolio</p>

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

        <div className="td-mode-select">
          <button
            className="td-btn td-start-solo"
            onClick={() => onStartGame({ map: selectedMap, mode: 'solo' })}
          >
            Solo Practice
          </button>
          <button className="td-btn td-pvp-btn" disabled title="Coming in Phase 2">
            1v1 PvP Wager (Coming Soon)
          </button>
        </div>

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
