const reportRepo = require('../repositories/report.repository');
const readingRepo = require('../repositories/reading.repository');
const AppError = require('../utils/AppError');
const {
  getTodayString,
  getDailyRange,
  getMonthToDateRange,
  getPreviousMonthRange,
  formatDateLabel
} = require('../utils/dates');

class ReportService {
  /**
   * Validate and resolve the report target date (defaults to today, rejects future dates)
   * @param {string} [inputDate]
   * @returns {string}
   */
  resolveDate(inputDate) {
    const today = getTodayString();
    const date = inputDate || today;

    if (date > today) {
      throw new AppError(400, 'INVALID_DATE', 'Date cannot be in the future.');
    }

    return date;
  }

  /**
   * Daily Report: Stats and slot readings for a single calendar day
   */
  async getDailyReport(userId, inputDate) {
    const date = this.resolveDate(inputDate);
    const range = getDailyRange(date);

    const stats = await reportRepo.getStats(userId, range.from, range.to);
    const readings = await readingRepo.findByDate(userId, date);

    return {
      type: 'daily',
      range: {
        from: range.from,
        to: range.to,
        label: formatDateLabel(range.from, range.to)
      },
      stats,
      readings
    };
  }

  /**
   * Month-to-Date Report: 1st of month to selected date
   */
  async getMonthToDateReport(userId, inputDate) {
    const date = this.resolveDate(inputDate);
    const range = getMonthToDateRange(date);

    const stats = await reportRepo.getStats(userId, range.from, range.to);

    return {
      type: 'month-to-date',
      range: {
        from: range.from,
        to: range.to,
        label: formatDateLabel(range.from, range.to)
      },
      stats,
      readings: []
    };
  }

  /**
   * Monthly Report: Full previous calendar month
   */
  async getMonthlyReport(userId, inputDate) {
    const date = this.resolveDate(inputDate);
    const range = getPreviousMonthRange(date);

    const stats = await reportRepo.getStats(userId, range.from, range.to);

    return {
      type: 'monthly',
      range: {
        from: range.from,
        to: range.to,
        label: formatDateLabel(range.from, range.to)
      },
      stats,
      readings: []
    };
  }
}

module.exports = new ReportService();

