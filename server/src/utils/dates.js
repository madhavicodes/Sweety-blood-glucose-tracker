const { APP_TIMEZONE } = require('../config/env');

/**
 * Returns today's date as 'YYYY-MM-DD' in the given or configured timezone
 * @param {string} [timeZone=APP_TIMEZONE]
 * @returns {string}
 */
function getTodayString(timeZone = APP_TIMEZONE) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

/**
 * Checks if a YYYY-MM-DD string represents a real calendar date
 * (e.g. 2026-02-31 is false)
 * @param {string} dateStr
 * @returns {boolean}
 */
function isRealDate(dateStr) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
  const [yStr, mStr, dStr] = dateStr.split('-');
  const year = parseInt(yStr, 10);
  const month = parseInt(mStr, 10);
  const day = parseInt(dStr, 10);

  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;

  // Check using Date.UTC
  const utcDate = new Date(Date.UTC(year, month - 1, day));
  return (
    utcDate.getUTCFullYear() === year &&
    utcDate.getUTCMonth() === month - 1 &&
    utcDate.getUTCDate() === day
  );
}

/**
 * Format Date to YYYY-MM-DD
 * @param {number} year
 * @param {number} monthIndex 0-indexed
 * @param {number} day
 * @returns {string}
 */
function toDateStr(year, monthIndex, day) {
  const y = String(year);
  const m = String(monthIndex + 1).padStart(2, '0');
  const d = String(day).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Daily range: { from: d, to: d }
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {{ from: string, to: string }}
 */
function getDailyRange(dateStr) {
  return { from: dateStr, to: dateStr };
}

/**
 * Month-to-date range: { from: firstOfMonth, to: dateStr }
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {{ from: string, to: string }}
 */
function getMonthToDateRange(dateStr) {
  const [yStr, mStr] = dateStr.split('-');
  const year = parseInt(yStr, 10);
  const monthIndex = parseInt(mStr, 10) - 1;

  const from = toDateStr(year, monthIndex, 1);
  return { from, to: dateStr };
}

/**
 * Previous month range: { from: firstOfPrevMonth, to: lastOfPrevMonth }
 * Handles leap years and year rollover (Jan -> Dec prev year)
 * @param {string} dateStr - 'YYYY-MM-DD'
 * @returns {{ from: string, to: string }}
 */
function getPreviousMonthRange(dateStr) {
  const [yStr, mStr] = dateStr.split('-');
  const year = parseInt(yStr, 10);
  const monthIndex = parseInt(mStr, 10) - 1; // 0-indexed

  // Prev month in UTC
  const prevMonthDate = new Date(Date.UTC(year, monthIndex - 1, 1));
  const prevYear = prevMonthDate.getUTCFullYear();
  const prevMonth = prevMonthDate.getUTCMonth(); // 0-indexed

  // Last day of prev month: Date.UTC(year, monthIndex, 0).getUTCDate()
  const lastDay = new Date(Date.UTC(prevYear, prevMonth + 1, 0)).getUTCDate();

  return {
    from: toDateStr(prevYear, prevMonth, 1),
    to: toDateStr(prevYear, prevMonth, lastDay)
  };
}

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Formats date label e.g.:
 * - '15 Oct 2026'
 * - '1 Oct – 15 Oct 2026'
 * - '1 Dec 2025 – 15 Jan 2026' (crossing years)
 * @param {string} fromStr
 * @param {string} toStr
 * @returns {string}
 */
function formatDateLabel(fromStr, toStr) {
  const [fromY, fromM, fromD] = fromStr.split('-').map(Number);
  const [toY, toM, toD] = toStr.split('-').map(Number);

  if (fromStr === toStr) {
    return `${fromD} ${MONTH_NAMES[fromM - 1]} ${fromY}`;
  }

  if (fromY === toY) {
    return `${fromD} ${MONTH_NAMES[fromM - 1]} – ${toD} ${MONTH_NAMES[toM - 1]} ${toY}`;
  }

  return `${fromD} ${MONTH_NAMES[fromM - 1]} ${fromY} – ${toD} ${MONTH_NAMES[toM - 1]} ${toY}`;
}

module.exports = {
  getTodayString,
  isRealDate,
  getDailyRange,
  getMonthToDateRange,
  getPreviousMonthRange,
  formatDateLabel
};

