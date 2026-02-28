export default function gameWsRoutes(fastify, gameManager) {
  fastify.get('/ws/game', { websocket: true }, (socket) => {
    let currentGameId = null;

    socket.on('message', (raw) => {
      let msg;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        socket.send(JSON.stringify({ type: 'error', error: 'Invalid JSON' }));
        return;
      }

      try {
        switch (msg.type) {
          case 'create': {
            const config = msg.config || {};
            const result = gameManager.createGame(config);
            currentGameId = result.gameId;
            socket.send(JSON.stringify({
              type: 'created',
              gameId: result.gameId,
              observation: result.observation,
            }));
            break;
          }

          case 'step': {
            const game = currentGameId ? gameManager.getGame(currentGameId) : null;
            if (!game) {
              socket.send(JSON.stringify({ type: 'error', error: 'No active game' }));
              return;
            }
            const result = game.step(msg.action, msg.ticksPerStep);
            socket.send(JSON.stringify({
              type: 'step_result',
              ...result,
            }));
            break;
          }

          case 'reset': {
            const game = currentGameId ? gameManager.getGame(currentGameId) : null;
            if (!game) {
              socket.send(JSON.stringify({ type: 'error', error: 'No active game' }));
              return;
            }
            const observation = game.reset();
            socket.send(JSON.stringify({
              type: 'reset_result',
              observation,
            }));
            break;
          }

          case 'get_state': {
            const game = currentGameId ? gameManager.getGame(currentGameId) : null;
            if (!game) {
              socket.send(JSON.stringify({ type: 'error', error: 'No active game' }));
              return;
            }
            socket.send(JSON.stringify({
              type: 'state',
              observation: game.getObservation(),
            }));
            break;
          }

          case 'get_valid_actions': {
            const game = currentGameId ? gameManager.getGame(currentGameId) : null;
            if (!game) {
              socket.send(JSON.stringify({ type: 'error', error: 'No active game' }));
              return;
            }
            socket.send(JSON.stringify({
              type: 'valid_actions',
              actions: game.getValidActions(),
            }));
            break;
          }

          default:
            socket.send(JSON.stringify({ type: 'error', error: `Unknown message type: ${msg.type}` }));
        }
      } catch (err) {
        socket.send(JSON.stringify({ type: 'error', error: err.message }));
      }
    });

    socket.on('close', () => {
      // Optionally clean up game on disconnect
      // For now, let the inactivity timeout handle it
    });
  });
}
