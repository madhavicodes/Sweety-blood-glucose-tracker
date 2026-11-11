const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRES_IN } = require('../config/env');

/**
 * Sign JWT token with sub: userId
 * @param {string|number} userId
 * @returns {string}
 */
function signToken(userId) {
  return jwt.sign(
    { sub: String(userId) },
    JWT_SECRET,
    { algorithm: 'HS256', expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * Verify and decode JWT token
 * @param {string} token
 * @returns {object}
 */
function verifyToken(token) {
  return jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
}

module.exports = {
  signToken,
  verifyToken
};

