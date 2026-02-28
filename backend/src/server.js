import Fastify from 'fastify';
import cors from '@fastify/cors';
import websocket from '@fastify/websocket';
import GameManager from './game/GameManager.js';
import gameRoutes from './routes/game.js';
import gameWsRoutes from './routes/gameWs.js';

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const fastify = Fastify({ logger: true });

// Plugins
await fastify.register(cors, { origin: true });
await fastify.register(websocket);

// Game manager
const gameManager = new GameManager();
gameManager.startCleanupInterval();

// Routes
gameRoutes(fastify, gameManager);
gameWsRoutes(fastify, gameManager);

// Health check
fastify.get('/health', async () => ({ status: 'ok', games: gameManager.size }));

// Start
try {
  await fastify.listen({ port: PORT, host: HOST });
  console.log(`Meme TD Agent API running on http://${HOST}:${PORT}`);
  console.log(`WebSocket endpoint: ws://${HOST}:${PORT}/ws/game`);
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}

// Graceful shutdown
const shutdown = async () => {
  gameManager.stopCleanupInterval();
  await fastify.close();
  process.exit(0);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
