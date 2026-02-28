"""
Meme TD Agent Client — Python SDK for the Meme TD AI Agent API.

Usage:
    from meme_td_client import MemeTDAgent

    agent = MemeTDAgent("ws://localhost:3001/ws/game")
    obs = agent.create_game(map_id="meadow", difficulty="medium", hero_id="satoshi")

    while not done:
        actions = agent.get_valid_actions()
        obs, reward, done, info = agent.step(pick_action(actions))

    agent.close()
"""

import json
import websocket


class MemeTDAgent:
    def __init__(self, url="ws://localhost:3001/ws/game"):
        self.url = url
        self.ws = websocket.create_connection(url)
        self.game_id = None
        self.total_reward = 0

    def create_game(self, map_id="meadow", difficulty="medium", hero_id="satoshi", challenge=None):
        """Create a new game and return the initial observation."""
        config = {"mapId": map_id, "difficulty": difficulty, "heroId": hero_id}
        if challenge:
            config["challenge"] = challenge

        self._send({"type": "create", "config": config})
        resp = self._recv()
        assert resp["type"] == "created", f"Unexpected response: {resp}"

        self.game_id = resp["gameId"]
        self.total_reward = 0
        return resp["observation"]

    def step(self, action, ticks_per_step=60):
        """
        Send an action and advance the simulation.

        Args:
            action: dict like {"type": "place_tower", "towerId": "dart", "x": 300, "y": 200}
            ticks_per_step: number of game ticks to simulate (default=60, ~1 second)

        Returns:
            (observation, reward, done, info) tuple
        """
        self._send({"type": "step", "action": action, "ticksPerStep": ticks_per_step})
        resp = self._recv()
        assert resp["type"] == "step_result", f"Unexpected response: {resp}"

        self.total_reward += resp["reward"]
        return resp["observation"], resp["reward"], resp["done"], resp["info"]

    def get_valid_actions(self):
        """Get all currently valid actions."""
        self._send({"type": "get_valid_actions"})
        resp = self._recv()
        assert resp["type"] == "valid_actions", f"Unexpected response: {resp}"
        return resp["actions"]

    def get_state(self):
        """Get the current game state observation."""
        self._send({"type": "get_state"})
        resp = self._recv()
        assert resp["type"] == "state", f"Unexpected response: {resp}"
        return resp["observation"]

    def reset(self):
        """Reset the current game and return the initial observation."""
        self._send({"type": "reset"})
        resp = self._recv()
        assert resp["type"] == "reset_result", f"Unexpected response: {resp}"
        self.total_reward = 0
        return resp["observation"]

    def close(self):
        """Close the WebSocket connection."""
        self.ws.close()

    def _send(self, msg):
        self.ws.send(json.dumps(msg))

    def _recv(self):
        raw = self.ws.recv()
        resp = json.loads(raw)
        if resp.get("type") == "error":
            raise RuntimeError(f"Server error: {resp['error']}")
        return resp

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.close()
