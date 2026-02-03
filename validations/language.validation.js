// validations/language.validation.js

const { z } = require('zod');


const createLanguageSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Language name is required',
        invalid_type_error: 'Name must be a string'
      })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),

    code: z
  .string({
    required_error: 'Language code is required',
    invalid_type_error: 'Code must be a string'
  })
  .trim()
  .min(2, 'Code must be at least 2 characters')
  .max(10, 'Code cannot exceed 10 characters')
  .regex(/^[A-Za-z]{2,10}$/, 'Code must contain letters only')
  .transform(val => val.toUpperCase()) // �

  })
});


const updateLanguageSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Language ID is required'
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid language ID format')
  }),

  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim()
      .optional(),

    code: z
      .string()
      .min(2, 'Code must be at least 2 characters')
      .max(10, 'Code cannot exceed 10 characters')
      .regex(/^[A-Z]{2,10}$/, 'Code must be uppercase letters only (e.g., EN, HI, ES)')
      .trim()
      .optional(),


    status: z
      .number({
        invalid_type_error: 'Status must be a number'
      })
      .int('Status must be an integer')
      .refine(val => val === 0 || val === 1, 'Status must be either 0 (inactive) or 1 (active)')
      .optional()
  })
});


const getLanguageSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Language ID is required'
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid language ID format')
  })
});


const deleteLanguageSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Language ID is required'
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid language ID format')
  })
});


const getAllLanguagesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .refine(val => val > 0, 'Page must be greater than 0')
      .optional()
      .default('1'),

    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
      .optional()
      .default('10'),

    status: z
      .string()
      .regex(/^[01]$/, 'Status must be 0 or 1')
      .transform(Number)
      .optional(),

    search: z
      .string()
      .trim()
      .optional()
  })
});

module.exports = {
  createLanguageSchema,
  updateLanguageSchema,
  getLanguageSchema,
  deleteLanguageSchema,
  getAllLanguagesSchema
};