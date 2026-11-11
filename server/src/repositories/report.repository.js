const db = require('../db/knex');

class ReportRepository {
  /**
   * Get aggregate statistics for user readings within a date range
   * @param {string|number} userId
   * @param {string} from - 'YYYY-MM-DD'
   * @param {string} to - 'YYYY-MM-DD'
   * @param {import('knex').Knex.Transaction} [trx]
   */
  async getStats(userId, from, to, trx) {
    const rawSql = `
      SELECT COUNT(*)::int AS count,
             MAX(value_mgdl) AS highest,
             MIN(value_mgdl) AS lowest,
             ROUND(AVG(value_mgdl)::numeric, 1) AS average
      FROM readings
      WHERE user_id = ? AND reading_date BETWEEN ? AND ?
    `;

    const result = await (trx || db).raw(rawSql, [userId, from, to]);
    const row = result.rows ? result.rows[0] : (Array.isArray(result) ? result[0] : result);

    const count = row && row.count !== undefined && row.count !== null ? parseInt(row.count, 10) : 0;

    return {
      count,
      highest: count > 0 && row.highest !== null ? Number(row.highest) : null,
      lowest: count > 0 && row.lowest !== null ? Number(row.lowest) : null,
      average: count > 0 && row.average !== null ? Number(row.average) : null
    };
  }
}

module.exports = new ReportRepository();

