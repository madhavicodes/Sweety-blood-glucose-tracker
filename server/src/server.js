const app = require('./app');
const { PORT, NODE_ENV } = require('./config/env');
const db = require('./db/knex');

async function startServer() {
  try {
    // Verify database connectivity
    await db.raw('SELECT 1');
    console.log('[Database] Connected successfully.');

    const server = app.listen(PORT, () => {
      console.log(`[Sweety API] Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`[Sweety API] Healthcheck available at http://localhost:${PORT}/health`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Sweety API] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        try {
          await db.destroy();
          console.log('[Database] Connections closed.');
          process.exit(0);
        } catch (err) {
          console.error('[Sweety API] Error during shutdown:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Sweety API] Failed to connect to database at startup:', err.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = { startServer };
