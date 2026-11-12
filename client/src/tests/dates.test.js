import { describe, it, expect } from 'vitest';
import { getTodayString, formatDisplayDate } from '../utils/dates';

describe('Frontend Date Utilities', () => {
  it('returns valid YYYY-MM-DD for getTodayString()', () => {
    const today = getTodayString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formats YYYY-MM-DD into human-readable date format', () => {
    expect(formatDisplayDate('2026-10-15')).toBe('15 Oct 2026');
    expect(formatDisplayDate('2026-01-01')).toBe('1 Jan 2026');
    expect(formatDisplayDate('2026-12-31')).toBe('31 Dec 2026');
  });

  it('safely handles empty or malformed input', () => {
    expect(formatDisplayDate('')).toBe('');
    expect(formatDisplayDate(null)).toBe('');
    expect(formatDisplayDate('invalid')).toBe('invalid');
  });
});

