const { newDb } = require('pg-mem');
const knex = require('knex');
const knexConfig = require('../knexfile');
const path = require('path');
const net = require('net');

let testKnex;
let isMemoryDb = false;

function checkPort(host, port, timeout = 500) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isConnected = false;

    socket.setTimeout(timeout);
    socket.once('connect', () => {
      isConnected = true;
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.connect(port, host);
  });
}

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'sweety-super-secret-jwt-token-key-2026-secure!';
  process.env.BCRYPT_ROUNDS = '4';

  const testConfig = knexConfig.test;
  const dbUrl = testConfig.connection;
  let hasRealPostgres = false;

  try {
    const parsedUrl = new URL(typeof dbUrl === 'string' ? dbUrl : 'postgres://localhost:5432');
    const host = parsedUrl.hostname || 'localhost';
    const port = parseInt(parsedUrl.port, 10) || 5432;
    hasRealPostgres = await checkPort(host, port, 400);
  } catch (e) {
    hasRealPostgres = false;
  }

  if (hasRealPostgres) {
    try {
      const realDb = knex(testConfig);
      await realDb.raw('SELECT 1');
      isMemoryDb = false;
      testKnex = realDb;
      global.__TEST_KNEX__ = testKnex;
      await testKnex.migrate.latest({
        directory: path.resolve(__dirname, '../migrations')
      });
    } catch (err) {
      hasRealPostgres = false;
    }
  }

  if (!hasRealPostgres) {
    // High-performance in-memory PostgreSQL emulator
    isMemoryDb = true;
    const memDb = newDb({
      autoCreateForeignKeyIndices: true
    });

    memDb.public.registerFunction({
      name: 'lower',
      args: [memDb.public.getType('text')],
      returns: memDb.public.getType('text'),
      implementation: (str) => (str ? str.toLowerCase() : str)
    });

    // Register PostgreSQL round(numeric, integer) function for pg-mem
    memDb.public.registerFunction({
      name: 'round',
      args: [memDb.public.getType('float'), memDb.public.getType('int')],
      returns: memDb.public.getType('float'),
      implementation: (val, decimals) => {
        if (val === null || val === undefined) return null;
        const factor = Math.pow(10, decimals || 0);
        return Math.round(Number(val) * factor) / factor;
      }
    });

    testKnex = memDb.adapters.createKnex();
    global.__TEST_KNEX__ = testKnex;

    await testKnex.migrate.latest({
      directory: path.resolve(__dirname, '../migrations')
    });
  }
});

beforeEach(async () => {
  if (testKnex) {
    // Truncate tables between tests for clean test isolation
    await testKnex('readings').del();
    await testKnex('users').del();
  }
});

afterAll(async () => {
  if (testKnex && !isMemoryDb) {
    await testKnex.destroy();
  }
  delete global.__TEST_KNEX__;
});
