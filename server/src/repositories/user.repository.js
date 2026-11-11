const db = require('../db/knex');

class UserRepository {
  /**
   * Create a new user
   * @param {{ name: string, email: string, password_hash: string }} data
   * @param {import('knex').Knex.Transaction} [trx]
   */
  async create(data, trx) {
    const query = (trx || db)('users').insert({
      name: data.name,
      email: data.email.toLowerCase().trim(),
      password_hash: data.password_hash
    }).returning(['id', 'name', 'email', 'created_at', 'updated_at']);

    const [user] = await query;
    return user;
  }

  /**
   * Find user by ID
   * @param {string|number} id
   * @param {import('knex').Knex.Transaction} [trx]
   */
  async findById(id, trx) {
    return (trx || db)('users')
      .where({ id })
      .first();
  }

  /**
   * Find user by case-insensitive email
   * @param {string} email
   * @param {import('knex').Knex.Transaction} [trx]
   */
  async findByEmail(email, trx) {
    return (trx || db)('users')
      .whereRaw('LOWER(email) = ?', [email.toLowerCase().trim()])
      .first();
  }
}

module.exports = new UserRepository();
