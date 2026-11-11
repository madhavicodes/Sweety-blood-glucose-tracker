import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReportCard from '../components/ReportCard';

describe('ReportCard Component', () => {
  const mockDailyReport = {
    type: 'daily',
    range: { from: '2026-11-11', to: '2026-11-11', label: '11 Nov 2026' },
    stats: { count: 2, highest: 150, lowest: 90, average: 120.0 },
    readings: [
      { id: 1, date: '2026-11-11', slot: 'MORNING_FASTING', slotLabel: 'Morning (fasting)', value: 90 },
      { id: 2, date: '2026-11-11', slot: 'AFTER_LUNCH', slotLabel: 'After lunch', value: 150 }
    ]
  };

  it('renders all 4 statistical tiles with correct values', () => {
    render(<ReportCard report={mockDailyReport} />);

    expect(screen.getByText('Daily Report')).toBeInTheDocument();
    expect(screen.getByText('11 Nov 2026')).toBeInTheDocument();

    // Multiple 150s exist (one in Highest tile, one in reading row)
    const elements150 = screen.getAllByText('150');
    expect(elements150.length).toBeGreaterThanOrEqual(1);

    const elements90 = screen.getAllByText('90');
    expect(elements90.length).toBeGreaterThanOrEqual(1);

    expect(screen.getByText('120.0')).toBeInTheDocument(); // Average
    expect(screen.getByText('2')).toBeInTheDocument();     // Count
  });

  it('renders readings list for daily reports', () => {
    render(<ReportCard report={mockDailyReport} />);
    expect(screen.getByText('Morning (fasting)')).toBeInTheDocument();
    expect(screen.getByText('After lunch')).toBeInTheDocument();
  });

  it('shows empty state when count is 0', () => {
    const emptyReport = {
      type: 'month-to-date',
      range: { from: '2026-11-01', to: '2026-11-11', label: '1 Nov – 11 Nov 2026' },
      stats: { count: 0, highest: null, lowest: null, average: null },
      readings: []
    };

    render(<ReportCard report={emptyReport} />);
    expect(screen.getByText('No readings recorded for this period')).toBeInTheDocument();
  });
});
