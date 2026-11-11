const dotenv = require('dotenv');
const path = require('path');

// Load .env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = parseInt(process.env.PORT, 10) || 5000;
const DATABASE_URL = process.env.DATABASE_URL || 'postgres://sweety:sweety@localhost:5432/sweety';
const DATABASE_URL_TEST = process.env.DATABASE_URL_TEST || 'postgres://sweety:sweety@localhost:5432/sweety_test';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  // Fail fast at startup if secret is missing or too short (< 32 characters)
  throw new Error('JWT_SECRET environment variable is missing or less than 32 characters.');
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';
const BCRYPT_ROUNDS = NODE_ENV === 'test' ? 4 : (parseInt(process.env.BCRYPT_ROUNDS, 10) || 12);
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const APP_TIMEZONE = process.env.APP_TIMEZONE || 'Asia/Kolkata';

module.exports = {
  NODE_ENV,
  PORT,
  DATABASE_URL,
  DATABASE_URL_TEST,
  JWT_SECRET,
  JWT_EXPIRES_IN,
  BCRYPT_ROUNDS,
  CLIENT_ORIGIN,
  APP_TIMEZONE
};
