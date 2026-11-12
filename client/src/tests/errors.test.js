import { describe, it, expect } from 'vitest';
import { getErrorMessage, getFieldErrors } from '../utils/errors';

describe('Frontend Error Utilities', () => {
  it('extracts backend error message', () => {
    const error = {
      response: {
        data: {
          error: {
            code: 'DUPLICATE_SLOT',
            message: 'You already have an After lunch reading for this date.'
          }
        }
      }
    };
    expect(getErrorMessage(error)).toBe('You already have an After lunch reading for this date.');
  });

  it('handles network error messages gracefully', () => {
    const error = { code: 'ERR_NETWORK', message: 'Network Error' };
    expect(getErrorMessage(error)).toBe('Unable to reach the server. Please check your connection.');
  });

  it('falls back to default message when error object is empty', () => {
    expect(getErrorMessage(null, 'Custom fallback')).toBe('Custom fallback');
  });

  it('extracts field errors when present', () => {
    const error = {
      response: {
        data: {
          error: {
            fields: { value: 'Value must be between 40 and 600 mg/dl.' }
          }
        }
      }
    };
    expect(getFieldErrors(error)).toEqual({ value: 'Value must be between 40 and 600 mg/dl.' });
  });
});

