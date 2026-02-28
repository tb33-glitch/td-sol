export default function gameRoutes(fastify, gameManager) {
  // Create a new game
  fastify.post('/api/game/create', async (request, reply) => {
    const { mapId, difficulty, heroId, challenge } = request.body || {};

    try {
      const result = gameManager.createGame({ mapId, difficulty, heroId, challenge });
      return result;
    } catch (err) {
      reply.code(400);
      return { error: err.message };
    }
  });

  // Get game state
  fastify.get('/api/game/:id/state', async (request, reply) => {
    const game = gameManager.getGame(request.params.id);
    if (!game) {
      reply.code(404);
      return { error: 'Game not found' };
    }
    return game.getObservation();
  });

  // Step: apply action and advance simulation
  fastify.post('/api/game/:id/step', async (request, reply) => {
    const game = gameManager.getGame(request.params.id);
    if (!game) {
      reply.code(404);
      return { error: 'Game not found' };
    }

    const { action, ticksPerStep } = request.body || {};
    if (!action) {
      reply.code(400);
      return { error: 'Missing action' };
    }

    try {
      return game.step(action, ticksPerStep);
    } catch (err) {
      reply.code(400);
      return { error: err.message };
    }
  });

  // Reset game
  fastify.post('/api/game/:id/reset', async (request, reply) => {
    const game = gameManager.getGame(request.params.id);
    if (!game) {
      reply.code(404);
      return { error: 'Game not found' };
    }

    const observation = game.reset();
    return { observation };
  });

  // Get valid actions
  fastify.get('/api/game/:id/valid-actions', async (request, reply) => {
    const game = gameManager.getGame(request.params.id);
    if (!game) {
      reply.code(404);
      return { error: 'Game not found' };
    }

    return { actions: game.getValidActions() };
  });

  // Destroy game
  fastify.delete('/api/game/:id', async (request, reply) => {
    const deleted = gameManager.destroyGame(request.params.id);
    if (!deleted) {
      reply.code(404);
      return { error: 'Game not found' };
    }
    return { success: true };
  });

  // List active games
  fastify.get('/api/games', async () => {
    return { count: gameManager.size };
  });
}
