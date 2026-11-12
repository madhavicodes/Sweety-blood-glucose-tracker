import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ReadingRow from '../components/ReadingRow';

describe('ReadingRow Component', () => {
  const mockReading = {
    id: 1,
    date: '2026-11-11',
    slot: 'MORNING_FASTING',
    slotLabel: 'Morning (fasting)',
    value: 95
  };

  it('renders slot label and glucose value with mg/dl unit', () => {
    render(<ReadingRow reading={mockReading} />);
    expect(screen.getByText('Morning (fasting)')).toBeInTheDocument();
    expect(screen.getByText('95')).toBeInTheDocument();
  });

  it('displays "In Range" badge for normal fasting glucose (70-180)', () => {
    render(<ReadingRow reading={mockReading} />);
    expect(screen.getByText('In Range')).toBeInTheDocument();
  });

  it('displays "Low" or "High" badge for amber range (e.g. 60 or 200)', () => {
    const lowReading = { ...mockReading, value: 60 };
    const { rerender } = render(<ReadingRow reading={lowReading} />);
    expect(screen.getByText('Low')).toBeInTheDocument();

    const highReading = { ...mockReading, value: 200 };
    rerender(<ReadingRow reading={highReading} />);
    expect(screen.getByText('High')).toBeInTheDocument();
  });

  it('displays "Very Low" or "Very High" for critical values (<54 or >250)', () => {
    const criticalLow = { ...mockReading, value: 45 };
    const { rerender } = render(<ReadingRow reading={criticalLow} />);
    expect(screen.getByText('Very Low')).toBeInTheDocument();

    const criticalHigh = { ...mockReading, value: 300 };
    rerender(<ReadingRow reading={criticalHigh} />);
    expect(screen.getByText('Very High')).toBeInTheDocument();
  });

  it('calls onEdit when Edit button is clicked', () => {
    const handleEdit = vi.fn();
    render(<ReadingRow reading={mockReading} onEdit={handleEdit} />);

    const editBtn = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editBtn);

    expect(handleEdit).toHaveBeenCalledWith(mockReading);
  });

  it('calls onDelete when Delete button is confirmed', () => {
    const handleDelete = vi.fn();
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<ReadingRow reading={mockReading} onDelete={handleDelete} />);

    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();
    expect(handleDelete).toHaveBeenCalledWith(mockReading.id);

    window.confirm.mockRestore();
  });
});

