const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const pinoHttp = require('pino-http');
const pino = require('pino');

const { CLIENT_ORIGIN, NODE_ENV } = require('./config/env');
const db = require('./db/knex');
const authRoutes = require('./routes/auth.routes');
const readingsRoutes = require('./routes/readings.routes');
const reportsRoutes = require('./routes/reports.routes');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security headers
app.use(helmet());

// CORS configuration restricted to frontend client origin
app.use(cors({
  origin: CLIENT_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Body parser with strict size limit
app.use(express.json({ limit: '10kb' }));

// Structured logging (skip in test mode to avoid test clutter)
if (NODE_ENV !== 'test') {
  app.use(pinoHttp({
    logger: pino({ level: 'info' })
  }));
}

// Health check endpoint (runs SELECT 1)
app.get('/health', async (req, res) => {
  try {
    await db.raw('SELECT 1');
    res.status(200).json({ status: 'ok', db: 'up' });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'down', message: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/readings', readingsRoutes);
app.use('/api/reports', reportsRoutes);

// 404 Handler
app.use(notFound);

// Centralized Error Handler
app.use(errorHandler);

module.exports = app;
