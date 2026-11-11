import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReadingForm from '../components/ReadingForm';

describe('ReadingForm Component (React Testing Library)', () => {
  it('shows "Please enter a glucose value." when empty', async () => {
    const handleSubmit = vi.fn();
    render(<ReadingForm onSubmit={handleSubmit} />);

    // Clear value input if any and submit
    const valueInput = screen.getByLabelText(/blood glucose value/i);
    fireEvent.change(valueInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /save reading/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Please enter a glucose value.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('rejects values below 40 (e.g. 39)', async () => {
    const handleSubmit = vi.fn();
    render(<ReadingForm onSubmit={handleSubmit} />);

    const valueInput = screen.getByLabelText(/blood glucose value/i);
    fireEvent.change(valueInput, { target: { value: '39' } });

    const submitBtn = screen.getByRole('button', { name: /save reading/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Value must be between 40 and 600 mg/dl.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('rejects values above 600 (e.g. 601)', async () => {
    const handleSubmit = vi.fn();
    render(<ReadingForm onSubmit={handleSubmit} />);

    const valueInput = screen.getByLabelText(/blood glucose value/i);
    fireEvent.change(valueInput, { target: { value: '601' } });

    const submitBtn = screen.getByRole('button', { name: /save reading/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Value must be between 40 and 600 mg/dl.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('rejects decimal numbers with "Value must be a whole number."', async () => {
    const handleSubmit = vi.fn();
    render(<ReadingForm onSubmit={handleSubmit} />);

    const valueInput = screen.getByLabelText(/blood glucose value/i);
    fireEvent.change(valueInput, { target: { value: '120.5' } });

    const submitBtn = screen.getByRole('button', { name: /save reading/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Value must be a whole number.')).toBeInTheDocument();
    expect(handleSubmit).not.toHaveBeenCalled();
  });

  it('displays a server error message when API rejects with conflict (e.g. duplicate slot)', async () => {
    const serverError = new Error('Request failed');
    serverError.response = {
      data: {
        error: {
          code: 'DUPLICATE_SLOT',
          message: 'You already have an After lunch reading for this date.'
        }
      }
    };

    const handleSubmit = vi.fn().mockRejectedValue(serverError);
    render(<ReadingForm onSubmit={handleSubmit} />);

    const valueInput = screen.getByLabelText(/blood glucose value/i);
    fireEvent.change(valueInput, { target: { value: '130' } });

    const submitBtn = screen.getByRole('button', { name: /save reading/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('You already have an After lunch reading for this date.')).toBeInTheDocument();
  });

  it('calls onSubmit with correct payload when input is valid', async () => {
    const handleSubmit = vi.fn().mockResolvedValue({});
    render(<ReadingForm onSubmit={handleSubmit} />);

    const valueInput = screen.getByLabelText(/blood glucose value/i);
    fireEvent.change(valueInput, { target: { value: '125' } });

    const submitBtn = screen.getByRole('button', { name: /save reading/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalledTimes(1);
    });

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        slot: 'MORNING_FASTING',
        value: 125
      })
    );
  });
});
