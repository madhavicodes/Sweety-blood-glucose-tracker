const { z } = require('zod');
const { SLOT_VALUES } = require('../constants/slots');
const { isRealDate } = require('../utils/dates');

// Custom preprocessor for value
const glucoseValueSchema = z.preprocess((val) => {
  if (val === undefined || val === null || val === '') return undefined;
  if (typeof val === 'string' && val.trim() === '') return undefined;
  return val;
}, z.custom((val) => val !== undefined, {
  message: 'Please enter a glucose value.'
})
.transform((val, ctx) => {
  const num = Number(val);
  if (isNaN(num) || (typeof val === 'string' && !/^-?\d+(\.\d+)?$/.test(val.trim()))) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Please enter a glucose value.'
    });
    return z.NEVER;
  }
  if (!Number.isInteger(num)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Value must be a whole number.'
    });
    return z.NEVER;
  }
  if (num < 40 || num > 600) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Value must be between 40 and 600 mg/dl.'
    });
    return z.NEVER;
  }
  return num;
}));

const readingBodySchema = z.object({
  date: z.preprocess((val) => (typeof val === 'string' ? val.trim() : val),
    z.string({ required_error: 'Date is required.' })
      .min(1, 'Date is required.')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.')
      .refine(isRealDate, 'Enter a valid date.')
  ),
  slot: z.enum(SLOT_VALUES, {
    errorMap: () => ({ message: 'Choose a valid time slot.' })
  }),
  value: glucoseValueSchema
});

const listReadingsQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.').refine(isRealDate, 'Enter a valid date.').optional(),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.').refine(isRealDate, 'Enter a valid date.').optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.').refine(isRealDate, 'Enter a valid date.').optional(),
  page: z.preprocess((val) => (val === undefined ? 1 : Number(val)), z.number().int().min(1).default(1)),
  limit: z.preprocess((val) => (val === undefined ? 20 : Number(val)), z.number().int().min(1).max(100).default(20))
});

module.exports = {
  readingBodySchema,
  listReadingsQuerySchema
};
