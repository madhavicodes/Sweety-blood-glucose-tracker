const bcrypt = require('bcryptjs');
const userRepo = require('../repositories/user.repository');
const { signToken } = require('../utils/jwt');
const AppError = require('../utils/AppError');
const { BCRYPT_ROUNDS } = require('../config/env');

// Pre-computed bcrypt hash of "dummy-password" used to prevent timing leaks
const DUMMY_HASH = '$2a$12$e80y6jM8.tWf/B3YFqE9quQf2.gKsqdNuWmsS/eP2B.6J7bI1Gjgy';

class AuthService {
  /**
   * Register a new user
   */
  async register({ name, email, password }) {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already registered
    const existing = await userRepo.findByEmail(normalizedEmail);
    if (existing) {
      throw new AppError(409, 'EMAIL_EXISTS', 'Email is already registered.');
    }

    const password_hash = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await userRepo.create({
      name: name.trim(),
      email: normalizedEmail,
      password_hash
    });

    const token = signToken(user.id);

    return {
      user: {
        id: typeof user.id === 'string' ? Number(user.id) : user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      },
      token
    };
  }

  /**
   * Login user with email & password
   * Timing leak mitigation: always runs bcrypt.compare
   */
  async login({ email, password }) {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await userRepo.findByEmail(normalizedEmail);

    if (!user) {
      // Run dummy compare to match timing of password verification
      await bcrypt.compare(password, DUMMY_HASH);
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      throw new AppError(401, 'INVALID_CREDENTIALS', 'Invalid email or password.');
    }

    const token = signToken(user.id);

    return {
      user: {
        id: typeof user.id === 'string' ? Number(user.id) : user.id,
        name: user.name,
        email: user.email,
        createdAt: user.created_at
      },
      token
    };
  }
}

module.exports = new AuthService();

