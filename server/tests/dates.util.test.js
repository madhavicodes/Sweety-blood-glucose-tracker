const {
  getDailyRange,
  getMonthToDateRange,
  getPreviousMonthRange,
  isRealDate,
  formatDateLabel
} = require('../src/utils/dates');

describe('Date Utilities (utils/dates.js)', () => {
  describe('getDailyRange', () => {
    it('returns { from: d, to: d } for a given date', () => {
      const range = getDailyRange('2026-10-15');
      expect(range).toEqual({ from: '2026-10-15', to: '2026-10-15' });
    });
  });

  describe('getMonthToDateRange', () => {
    it('returns from first of month to selected date', () => {
      const range = getMonthToDateRange('2026-10-15');
      expect(range).toEqual({ from: '2026-10-01', to: '2026-10-15' });
    });
  });

  describe('getPreviousMonthRange', () => {
    it('handles standard months (15 Oct 2026 -> 1 Sep - 30 Sep 2026)', () => {
      const range = getPreviousMonthRange('2026-10-15');
      expect(range).toEqual({ from: '2026-09-01', to: '2026-09-30' });
    });

    it('handles non-leap February (10 Mar 2026 -> 1 Feb - 28 Feb 2026)', () => {
      const range = getPreviousMonthRange('2026-03-10');
      expect(range).toEqual({ from: '2026-02-01', to: '2026-02-28' });
    });

    it('handles leap year February (10 Mar 2024 -> 1 Feb - 29 Feb 2024)', () => {
      const range = getPreviousMonthRange('2024-03-10');
      expect(range).toEqual({ from: '2024-02-01', to: '2024-02-29' });
    });

    it('handles January year rollover (5 Jan 2026 -> 1 Dec - 31 Dec 2025)', () => {
      const range = getPreviousMonthRange('2026-01-05');
      expect(range).toEqual({ from: '2025-12-01', to: '2025-12-31' });
    });
  });

  describe('isRealDate', () => {
    it('validates genuine calendar dates', () => {
      expect(isRealDate('2026-10-15')).toBe(true);
      expect(isRealDate('2024-02-29')).toBe(true);
    });

    it('rejects invalid dates and invalid leap days', () => {
      expect(isRealDate('2026-02-29')).toBe(false);
      expect(isRealDate('2026-04-31')).toBe(false);
      expect(isRealDate('2026-13-01')).toBe(false);
      expect(isRealDate('not-a-date')).toBe(false);
    });
  });

  describe('formatDateLabel', () => {
    it('formats single day', () => {
      expect(formatDateLabel('2026-10-15', '2026-10-15')).toBe('15 Oct 2026');
    });

    it('formats range within same year', () => {
      expect(formatDateLabel('2026-10-01', '2026-10-15')).toBe('1 Oct – 15 Oct 2026');
    });

    it('formats range crossing year boundary', () => {
      expect(formatDateLabel('2025-12-01', '2026-01-15')).toBe('1 Dec 2025 – 15 Jan 2026');
    });
  });
});
