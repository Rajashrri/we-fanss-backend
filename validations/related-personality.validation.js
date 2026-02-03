const { z } = require('zod');

// Create RelatedPersonality Validation
const createRelatedPersonalitySchema = z.object({
  body: z.object({
    celebrity: z
      .string({
        required_error: 'Celebrity is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid celebrity ID format'),
    relatedCelebrity: z
      .string({
        required_error: 'Related celebrity is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid related celebrity ID format'),
    relationshipType: z.enum(
      ['Mentor', 'Co-star', 'Rival', 'Family', 'Politically', 'Other'],
      {
        required_error: 'Relationship type is required',
      }
    ),
    notes: z
      .string()
      .trim()
      .optional(),
    status: z
      .number()
      .int()
      .refine((val) => val === 0 || val === 1, {
        message: 'Status must be 0 or 1',
      })
      .optional(),
  }),
});

// Get All Related Personalities Validation
const getAllRelatedPersonalitiesSchema = z.object({
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
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? parseInt(val, 10) : 10)),
    status: z
      .string()
      .optional()
      .transform((val) => (val !== undefined ? parseInt(val, 10) : undefined))
      .refine((val) => val === undefined || val === 0 || val === 1, {
        message: 'Status must be 0 or 1',
      }),
  }),
});

// Update RelatedPersonality Validation
const updateRelatedPersonalitySchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Related personality ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid related personality ID format'),
  }),
  body: z.object({
    celebrity: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid celebrity ID format')
      .optional(),
    relatedCelebrity: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid related celebrity ID format')
      .optional(),
    relationshipType: z
      .enum(['Mentor', 'Co-star', 'Rival', 'Family', 'Politically', 'Other'])
      .optional(),
    notes: z
      .string()
      .trim()
      .optional(),
    status: z
      .number()
      .int()
      .refine((val) => val === 0 || val === 1, {
        message: 'Status must be 0 or 1',
      })
      .optional(),
  }),
});

// Update Status Validation
const updateRelatedPersonalityStatusSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Related personality ID is required',
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid related personality ID format'),
  }),
  body: z.object({
    status: z
      .number({
        required_error: 'Status is required',
      })
      .int()
      .refine((val) => val === 0 || val === 1, {
        message: 'Status must be 0 or 1',
      }),
  }),
});

module.exports = {
  createRelatedPersonalitySchema,
  getAllRelatedPersonalitiesSchema,
  updateRelatedPersonalitySchema,
  updateRelatedPersonalityStatusSchema,
};