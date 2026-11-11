const db = require('../db/knex');
const readingRepo = require('../repositories/reading.repository');
const AppError = require('../utils/AppError');
const { getTodayString } = require('../utils/dates');
const { SLOT_LABELS } = require('../constants/slots');

class ReadingService {
  /**
   * Helper to format duplicate slot message
   */
  getDuplicateSlotMessage(slot) {
    const label = SLOT_LABELS[slot] || slot;
    const article = /^[aeiou]/i.test(label) ? 'an' : 'a';
    return `You already have ${article} ${label} reading for this date.`;
  }

  /**
   * Create a new reading with transaction & row lock
   */
  async createReading(userId, { date, slot, value }) {
    const today = getTodayString();

    // Check 4: Date not in future
    if (date > today) {
      throw new AppError(400, 'INVALID_DATE', 'Date cannot be in the future.');
    }

    return db.transaction(async (trx) => {
      // Serialize operations per user to prevent concurrent race conditions
      await trx('users').where({ id: userId }).forUpdate().first();

      // Check 5: Max 4 readings per day
      const count = await readingRepo.countForDate(trx, userId, date);
      if (count >= 4) {
        throw new AppError(409, 'MAX_READINGS', 'You can add only 4 readings per day.');
      }

      // Check 6: Duplicate slot on the same date
      const dup = await readingRepo.findBySlot(trx, userId, date, slot);
      if (dup) {
        throw new AppError(409, 'DUPLICATE_SLOT', this.getDuplicateSlotMessage(slot));
      }

      return readingRepo.insert(trx, { userId, date, slot, value });
    });
  }

  /**
   * Update an existing reading with transaction & row lock
   */
  async updateReading(userId, id, { date, slot, value }) {
    const today = getTodayString();

    // Check 4: Date not in future
    if (date > today) {
      throw new AppError(400, 'INVALID_DATE', 'Date cannot be in the future.');
    }

    return db.transaction(async (trx) => {
      // Serialize per user
      await trx('users').where({ id: userId }).forUpdate().first();

      // Check existence & ownership (respond 404 if not found or not yours)
      const existing = await readingRepo.findById(userId, id, trx);
      if (!existing) {
        throw new AppError(404, 'NOT_FOUND', 'Reading not found.');
      }

      // Check 5: Max 4 per day (excluding this reading)
      const count = await readingRepo.countForDate(trx, userId, date, id);
      if (count >= 4) {
        throw new AppError(409, 'MAX_READINGS', 'You can add only 4 readings per day.');
      }

      // Check 6: Duplicate slot on the date (excluding this reading)
      const dup = await readingRepo.findBySlot(trx, userId, date, slot, id);
      if (dup) {
        throw new AppError(409, 'DUPLICATE_SLOT', this.getDuplicateSlotMessage(slot));
      }

      return readingRepo.update(trx, id, userId, { date, slot, value });
    });
  }

  /**
   * Get single reading by ID scoped to user
   */
  async getReadingById(userId, id) {
    const reading = await readingRepo.findById(userId, id);
    if (!reading) {
      throw new AppError(404, 'NOT_FOUND', 'Reading not found.');
    }
    return reading;
  }

  /**
   * Get readings for date or range
   */
  async getReadings(userId, query) {
    if (query.date) {
      return readingRepo.findByDate(userId, query.date);
    }

    return readingRepo.findRange(userId, {
      from: query.from,
      to: query.to,
      page: query.page,
      limit: query.limit
    });
  }

  /**
   * Delete a reading by ID scoped to user
   */
  async deleteReading(userId, id) {
    const deleted = await readingRepo.delete(userId, id);
    if (!deleted) {
      throw new AppError(404, 'NOT_FOUND', 'Reading not found.');
    }
    return true;
  }
}

module.exports = new ReadingService();
