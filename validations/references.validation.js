const { z } = require('zod');

const getAllReferencesSchema = z.object({
  params: z.object({
    celebrityId: z
      .string({
        required_error: 'Celebrity ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid celebrity ID format'),
  }),
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .refine((val) => val >= 1, 'Page must be at least 1')
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine((val) => val >= 1 && val <= 100, 'Limit must be between 1 and 100')
      .optional(),
    status: z
      .string()
      .regex(/^[01]$/, 'Status must be 0 or 1')
      .transform(Number)
      .optional(),
  }),
});

const createReferenceSchema = z.object({
  body: z.object({
    celebrity: z
      .string({
        required_error: 'Celebrity ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid celebrity ID format'),
    title: z
      .string({
        required_error: 'Title is required',
      })
      .trim()
      .min(1, 'Title cannot be empty'),
    url: z
      .string({
        required_error: 'URL is required',
      })
      .trim()
      .url('Invalid URL format'),
    type: z
      .enum(['News', 'Wiki', 'Interview', 'Gov Link', 'Other'])
      .optional(),
    status: z
      .number()
      .int()
      .refine((val) => val === 0 || val === 1, 'Status must be 0 or 1')
      .optional(),
  }),
});

const updateReferenceSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Reference ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid reference ID format'),
  }),
  body: z.object({
    celebrity: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid celebrity ID format')
      .optional(),
    title: z
      .string()
      .trim()
      .min(1, 'Title cannot be empty')
      .optional(),
    url: z
      .string()
      .trim()
      .url('Invalid URL format')
      .optional(),
    type: z
      .enum(['News', 'Wiki', 'Interview', 'Gov Link', 'Other'])
      .optional(),
    status: z
      .number()
      .int()
      .refine((val) => val === 0 || val === 1, 'Status must be 0 or 1')
      .optional(),
  }),
});

const updateReferenceStatusSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Reference ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid reference ID format'),
  }),
  body: z.object({
    status: z
      .number({
        required_error: 'Status is required',
      })
      .int()
      .refine((val) => val === 0 || val === 1, 'Status must be 0 or 1'),
  }),
});

module.exports = {
  getAllReferencesSchema,
  createReferenceSchema,
  updateReferenceSchema,
  updateReferenceStatusSchema,
};