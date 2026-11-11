const db = require('../db/knex');
const { SLOT_LABELS } = require('../constants/slots');

/**
 * Format DB row to API JSON representation
 * reading_date -> date, value_mgdl -> value, + slotLabel
 */
function formatReading(row) {
  if (!row) return null;

  // Format reading_date if it comes back as Date object
  let dateStr = row.reading_date;
  if (row.reading_date instanceof Date) {
    const y = row.reading_date.getFullYear();
    const m = String(row.reading_date.getMonth() + 1).padStart(2, '0');
    const d = String(row.reading_date.getDate()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
  } else if (typeof row.reading_date === 'string') {
    dateStr = row.reading_date.substring(0, 10);
  }

  return {
    id: typeof row.id === 'string' ? Number(row.id) : row.id,
    date: dateStr,
    slot: row.slot,
    slotLabel: SLOT_LABELS[row.slot] || row.slot,
    value: Number(row.value_mgdl),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

class ReadingRepository {
  /**
   * Count readings for a specific user and date (optionally excluding an ID during update)
   */
  async countForDate(trx, userId, date, excludeId = null) {
    const q = (trx || db)('readings')
      .where({ user_id: userId, reading_date: date });

    if (excludeId) {
      q.whereNot({ id: excludeId });
    }

    const result = await q.count('* as count').first();
    return parseInt(result.count, 10);
  }

  /**
   * Find reading by slot for a specific user and date (optionally excluding an ID)
   */
  async findBySlot(trx, userId, date, slot, excludeId = null) {
    const q = (trx || db)('readings')
      .where({ user_id: userId, reading_date: date, slot });

    if (excludeId) {
      q.whereNot({ id: excludeId });
    }

    const row = await q.first();
    return formatReading(row);
  }

  /**
   * Insert reading
   */
  async insert(trx, { userId, date, slot, value }) {
    const [row] = await (trx || db)('readings')
      .insert({
        user_id: userId,
        reading_date: date,
        slot,
        value_mgdl: value
      })
      .returning('*');

    return formatReading(row);
  }

  /**
   * Update reading by ID
   */
  async update(trx, id, userId, { date, slot, value }) {
    const [row] = await (trx || db)('readings')
      .where({ id, user_id: userId })
      .update({
        reading_date: date,
        slot,
        value_mgdl: value,
        updated_at: (trx || db).fn.now()
      })
      .returning('*');

    return formatReading(row);
  }

  /**
   * Find single reading by ID scoped to user
   */
  async findById(userId, id, trx) {
    const row = await (trx || db)('readings')
      .where({ id, user_id: userId })
      .first();

    return formatReading(row);
  }

  /**
   * Find readings for a specific date, ordered by slot
   */
  async findByDate(userId, date, trx) {
    const rows = await (trx || db)('readings')
      .where({ user_id: userId, reading_date: date })
      .orderByRaw(`
        CASE slot
          WHEN 'MORNING_FASTING' THEN 1
          WHEN 'AFTER_BREAKFAST' THEN 2
          WHEN 'AFTER_LUNCH' THEN 3
          WHEN 'AFTER_DINNER' THEN 4
          ELSE 5
        END ASC
      `);

    return rows.map(formatReading);
  }

  /**
   * Find readings within a date range with pagination
   */
  async findRange(userId, { from, to, page = 1, limit = 20 }, trx) {
    const baseQuery = (trx || db)('readings').where({ user_id: userId });

    if (from) {
      baseQuery.where('reading_date', '>=', from);
    }
    if (to) {
      baseQuery.where('reading_date', '<=', to);
    }

    // Get total count
    const totalResult = await baseQuery.clone().count('* as count').first();
    const total = parseInt(totalResult.count, 10);
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;

    const rows = await baseQuery
      .clone()
      .orderBy('reading_date', 'desc')
      .orderByRaw(`
        CASE slot
          WHEN 'MORNING_FASTING' THEN 1
          WHEN 'AFTER_BREAKFAST' THEN 2
          WHEN 'AFTER_LUNCH' THEN 3
          WHEN 'AFTER_DINNER' THEN 4
          ELSE 5
        END ASC
      `)
      .limit(limit)
      .offset(offset);

    return {
      data: rows.map(formatReading),
      page,
      limit,
      total,
      totalPages
    };
  }

  /**
   * Delete a reading by ID scoped to user
   */
  async delete(userId, id, trx) {
    const count = await (trx || db)('readings')
      .where({ id, user_id: userId })
      .del();

    return count > 0;
  }
}

module.exports = new ReadingRepository();
