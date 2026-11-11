const { z } = require('zod');

const registerSchema = z.object({
  name: z.string({ required_error: 'Name is required.' })
    .trim()
    .min(2, 'Name must be between 2 and 100 characters.')
    .max(100, 'Name must be between 2 and 100 characters.'),
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Enter a valid email address.')
    .max(255, 'Email cannot exceed 255 characters.'),
  password: z.string({ required_error: 'Password is required.' })
    .min(8, 'Password must be at least 8 characters long.')
    .max(72, 'Password cannot exceed 72 characters.')
    .refine((val) => /[A-Za-z]/.test(val) && /[0-9]/.test(val), {
      message: 'Password must contain at least one letter and one number.'
    })
});

const loginSchema = z.object({
  email: z.string({ required_error: 'Email is required.' })
    .trim()
    .toLowerCase()
    .email('Enter a valid email address.'),
  password: z.string({ required_error: 'Password is required.' })
    .min(1, 'Password is required.')
});

module.exports = {
  registerSchema,
  loginSchema
};
