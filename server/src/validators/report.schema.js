const { z } = require('zod');
const { isRealDate } = require('../utils/dates');

const reportQuerySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date.').refine(isRealDate, 'Enter a valid date.').optional()
});

module.exports = {
  reportQuerySchema
};
