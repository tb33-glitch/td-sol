# Meme TD Agent SDK

Play Meme TD programmatically via the AI Agent API. Build bots, train RL agents, or benchmark strategies.

## Quick Start

```bash
# 1. Start the server
cd backend && npm start

# 2. Install Python dependency
pip install websocket-client

# 3. Run the random agent
python3 agent-sdk/random_agent.py
```

## Python Client

```python
from meme_td_client import MemeTDAgent

with MemeTDAgent("ws://localhost:3001/ws/game") as agent:
    obs = agent.create_game(map_id="meadow", difficulty="medium", hero_id="satoshi")

    done = False
    while not done:
        actions = agent.get_valid_actions()
        action = pick_action(actions)  # your logic here
        obs, reward, done, info = agent.step(action)

    print(f"Final score: {agent.total_reward}")
```

## REST API

If you prefer HTTP over WebSocket:

```bash
# Create game
curl -X POST http://localhost:3001/api/game/create \
  -H 'Content-Type: application/json' \
  -d '{"mapId":"meadow","difficulty":"medium","heroId":"satoshi"}'

# Get state
curl http://localhost:3001/api/game/{id}/state

# Step
curl -X POST http://localhost:3001/api/game/{id}/step \
  -H 'Content-Type: application/json' \
  -d '{"action":{"type":"start_wave"}}'

# Valid actions
curl http://localhost:3001/api/game/{id}/valid-actions

# Reset
curl -X POST http://localhost:3001/api/game/{id}/reset

# Delete
curl -X DELETE http://localhost:3001/api/game/{id}
```

## Observation Format

```json
{
  "game": { "wave": 5, "totalWaves": 60, "lives": 150, "money": 1200, "gameTime": 45000, "gameOver": false, "gameWon": false },
  "towers": [
    { "id": 0, "type": "dart", "x": 300, "y": 200, "upgrades": [2,0,0], "pops": 47, "targeting": "first", "range": 120, "damage": 2 }
  ],
  "bloons": [
    { "id": 0, "type": "green", "hp": 1, "maxHp": 1, "progress": 0.35, "speed": 1.5, "camo": false, "moab": false, "stunned": false, "slowed": false, "x": 180, "y": 420 }
  ],
  "bloonCount": 12,
  "projectileCount": 3,
  "hero": { "type": "satoshi", "level": 3, "xp": 75, "placed": true, "x": 135, "y": 90 },
  "synergies": ["pumpAndDump"],
  "marketEvent": { "name": "Bull Run", "description": "All bloons +30% speed", "wavesRemaining": 2 },
  "waveActive": true,
  "spawning": false,
  "wavePreview": ["green", "blue"]
}
```

## Action Types

| Action | Fields | Description |
|--------|--------|-------------|
| `noop` | — | Do nothing, just simulate |
| `start_wave` | — | Start the next wave |
| `place_tower` | `towerId`, `x`, `y` | Place a tower |
| `place_hero` | `x`, `y` | Place the hero (once per game) |
| `upgrade_tower` | `towerIndex`, `path`, `tier` | Upgrade a tower |
| `sell_tower` | `towerIndex` | Sell a tower |
| `change_targeting` | `towerIndex`, `mode` | Set targeting (first/last/strong/close) |

## Tower Types

| ID | Name | Cost | Type |
|----|------|------|------|
| `dart` | Bat Punk | 200 | Sharp damage |
| `bomb` | Boom Punk | 500 | Explosive splash |
| `ice` | Emo Punk | 350 | Slow aura |
| `banana` | Suit Punk | 800 | Income generator |
| `sniper` | Laser Punk | 400 | Infinite range |
| `wizard` | Wizard Punk | 450 | Magic, camo detect |
| `mev` | MEV Punk | 500 | Homing, camo detect |
| `flipper` | Flipper Punk | 300 | Boomerang |
| `alchemist` | DeFi Punk | 600 | Buffer |
| `spikefactory` | Gas Fee Punk | 800 | Path traps |

## Reward Signal

| Event | Reward |
|-------|--------|
| Bloon pop | +1 (per pop in chain) |
| Wave completed | +100 |
| Life lost | -10 |
| Game won | +1000 |
| Game over | -1000 |

## Configuration

| Map | ID |
|-----|----|
| DEX Floor | `meadow` |
| Mempool | `desert` |
| Blockchain | `river` |

| Difficulty | ID | Lives | Cash |
|------------|----|-------|------|
| Paper Hands | `easy` | 200 | 850 |
| Diamond Hands | `medium` | 150 | 650 |
| Degen Mode | `hard` | 100 | 500 |
| Rug Pull | `impoppable` | 1 | 400 |

| Hero | ID |
|------|----|
| Satoshi | `satoshi` |
| Degen Ape | `degen` |
| Whale | `whale` |
| Rug Survivor | `rugged` |
