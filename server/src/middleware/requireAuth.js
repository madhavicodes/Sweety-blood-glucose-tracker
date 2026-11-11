const { verifyToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const userRepo = require('../repositories/user.repository');

/**
 * Require valid JWT Bearer token and attach req.user
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token required.');
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError(401, 'UNAUTHORIZED', 'Authentication token required.');
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (jwtErr) {
      throw new AppError(401, 'UNAUTHORIZED', 'Invalid or expired token.');
    }

    const userId = decoded.sub;
    const user = await userRepo.findById(userId);
    if (!user) {
      throw new AppError(401, 'UNAUTHORIZED', 'User account not found.');
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.created_at
    };

    next();
  } catch (error) {
    next(error);
  }
}

module.exports = requireAuth;
