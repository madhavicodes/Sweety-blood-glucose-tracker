class AppError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code identifier (e.g. VALIDATION_ERROR, DUPLICATE_SLOT)
   * @param {string} message - Human readable error message
   * @param {Record<string, string>|null} [fields=null] - Optional field-specific error details
   */
  constructor(statusCode, code, message, fields = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.message = message;
    this.fields = fields;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;

