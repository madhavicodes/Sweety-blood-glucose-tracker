const { ZodError } = require('zod');
const AppError = require('../utils/AppError');

/**
 * Global centralized error handler
 */
function errorHandler(err, req, res, next) {
  // If response already committed, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // 1. AppError thrown by services/middlewares
  if (err instanceof AppError) {
    const responsePayload = {
      error: {
        code: err.code,
        message: err.message
      }
    };
    if (err.fields && Object.keys(err.fields).length > 0) {
      responsePayload.error.fields = err.fields;
    }
    return res.status(err.statusCode).json(responsePayload);
  }

  // 2. Zod validation errors
  if (err instanceof ZodError) {
    const fields = {};
    let firstMessage = 'Validation failed.';

    for (const issue of err.issues) {
      const fieldPath = issue.path.join('.');
      if (fieldPath && !fields[fieldPath]) {
        fields[fieldPath] = issue.message;
      }
      if (firstMessage === 'Validation failed.') {
        firstMessage = issue.message;
      }
    }

    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: firstMessage,
        fields
      }
    });
  }

  // 3. PostgreSQL Unique Constraint Violation (23505)
  if (err.code === '23505') {
    if (err.constraint === 'users_email_lower_uidx' || (err.detail && err.detail.includes('email'))) {
      return res.status(409).json({
        error: {
          code: 'EMAIL_EXISTS',
          message: 'Email is already registered.'
        }
      });
    }

    if (err.constraint === 'readings_user_date_slot_uq' || (err.detail && err.detail.includes('slot'))) {
      return res.status(409).json({
        error: {
          code: 'DUPLICATE_SLOT',
          message: 'A reading already exists for this slot on the selected date.'
        }
      });
    }

    return res.status(409).json({
      error: {
        code: 'CONFLICT',
        message: 'A record with these details already exists.'
      }
    });
  }

  // 4. PostgreSQL Check Constraint Violation (23514)
  if (err.code === '23514') {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Value must be between 40 and 600 mg/dl.',
        fields: { value: 'Value must be between 40 and 600 mg/dl.' }
      }
    });
  }

  // 5. JWT Authentication errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Invalid or expired token.'
      }
    });
  }

  // 6. JSON body parsing error
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      error: {
        code: 'INVALID_JSON',
        message: 'Invalid JSON payload received.'
      }
    });
  }

  // 7. Generic 500 Internal Server Error (never leak stack trace to client)
  console.error('[UNHANDLED_ERROR]', err);
  return res.status(500).json({
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred. Please try again later.'
    }
  });
}

module.exports = errorHandler;
