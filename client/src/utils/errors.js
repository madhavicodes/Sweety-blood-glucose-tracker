/**
 * Extract human-readable error message from backend API response
 */
export function getErrorMessage(error, fallback = 'An unexpected error occurred. Please try again.') {
  if (!error) return fallback;

  // Server formatted error { error: { code, message, fields } }
  if (error.response?.data?.error?.message) {
    return error.response.data.error.message;
  }

  // Network/connection errors
  if (error.code === 'ERR_NETWORK' || error.message?.includes('Network Error')) {
    return 'Unable to reach the server. Please check your connection.';
  }

  return error.message || fallback;
}

/**
 * Extract field-specific errors if available
 */
export function getFieldErrors(error) {
  return error?.response?.data?.error?.fields || {};
}
