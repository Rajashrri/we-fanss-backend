// validations/profession.validation.js

const { z } = require('zod');

// ✅ Create Profession Validation
const createProfessionSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Profession name is required',
        invalid_type_error: 'Name must be a string'
      })
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim(),

    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .max(100, 'Slug cannot exceed 100 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
      .trim()
      .optional(),
    image: z
      .string()
      .trim()
      .optional()
      .nullable(), 

    sectionTemplates: z
      .array(
        z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid section template ID')
      )
      .optional()
      .default([]) 
  })
});

const updateProfessionSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Profession ID is required'
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid profession ID format')
  }),

  body: z.object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(100, 'Name cannot exceed 100 characters')
      .trim()
      .optional(),

    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .max(100, 'Slug cannot exceed 100 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
      .trim()
      .optional(),

    imagePath: z
      .string()
      .trim()
      .optional()
      .nullable(), // ✅ Changed from 'image' to 'imagePath'

    status: z
      .number({
        invalid_type_error: 'Status must be a number'
      })
      .int('Status must be an integer')
      .refine(val => val === 0 || val === 1, 'Status must be either 0 (inactive) or 1 (active)')
      .optional(), // ✅ Fixed to use number (0 or 1) instead of string enum

    sectionTemplates: z
      .array(
        z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid section template ID')
      )
      .optional()
  })
});


const getProfessionSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Profession ID is required'
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid profession ID format')
  })
});


const deleteProfessionSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: 'Profession ID is required'
      })
      .regex(/^[0-9a-fA-F]{24}$/, 'Invalid profession ID format')
  })
});


const getAllProfessionsSchema = z.object({
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
  createProfessionSchema,
  updateProfessionSchema,
  getProfessionSchema,
  deleteProfessionSchema,
  getAllProfessionsSchema
};