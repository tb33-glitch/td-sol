#!/usr/bin/env python3
"""
Random Agent — plays Meme TD by picking random valid actions.
Demonstrates the full API loop.

Usage:
    # Start the server first: cd backend && npm start
    python3 random_agent.py
"""

import random
import sys
from meme_td_client import MemeTDAgent

URL = sys.argv[1] if len(sys.argv) > 1 else "ws://localhost:3001/ws/game"


def main():
    with MemeTDAgent(URL) as agent:
        obs = agent.create_game(map_id="meadow", difficulty="medium", hero_id="satoshi")
        print(f"Game created: {agent.game_id}")
        print(f"Starting money: {obs['game']['money']}, lives: {obs['game']['lives']}")

        step_count = 0
        done = False

        while not done:
            actions = agent.get_valid_actions()

            # Prefer meaningful actions over noop
            non_noop = [a for a in actions if a["type"] != "noop"]
            if non_noop:
                action = random.choice(non_noop)
            else:
                action = {"type": "noop"}

            obs, reward, done, info = agent.step(action)
            step_count += 1

            # Log progress every 10 steps
            if step_count % 10 == 0:
                game = obs["game"]
                print(
                    f"Step {step_count}: wave {game['wave']}/{game['totalWaves']}, "
                    f"lives={game['lives']}, money={game['money']}, "
                    f"bloons={obs['bloonCount']}, towers={len(obs['towers'])}, "
                    f"reward={reward:.0f}"
                )

            # Safety: stop after too many steps
            if step_count >= 10000:
                print("Reached step limit")
                break

        game = obs["game"]
        print(f"\n--- Game Over ---")
        print(f"Result: {'WON' if game['gameWon'] else 'LOST'}")
        print(f"Wave reached: {game['wave']}/{game['totalWaves']}")
        print(f"Lives remaining: {game['lives']}")
        print(f"Total steps: {step_count}")
        print(f"Total reward: {agent.total_reward:.0f}")


if __name__ == "__main__":
    main()
