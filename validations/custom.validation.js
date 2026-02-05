// validations/customoption-validation.js
const { z } = require("zod");

// CREATE validation (POST) - addcustomoption
const createCustomOptionSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Title is required",
        invalid_type_error: "Title must be a string"
      })
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(200, "Title cannot exceed 200 characters"),
    
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),
    
    celebrity: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid celebrity ID format")
      .optional()
  })
});

// UPDATE validation (PUT/PATCH) - updatecustomoption
const updateCustomOptionSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(2, "Title must be at least 2 characters")
      .max(200, "Title cannot exceed 200 characters")
      .optional(),
    
    description: z
      .string()
      .trim()
      .max(1000, "Description cannot exceed 1000 characters")
      .optional(),
    
    status: z
      .number()
      .int()
      .refine((val) => val === 0 || val === 1, {
        message: "Status must be either 0 or 1"
      })
      .optional(),
    
    celebrity: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid celebrity ID format")
      .optional()
  }),
  
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
  })
});

// UPDATE STATUS validation - updateStatus
const updateStatusSchema = z.object({
  body: z.object({
    status: z
      .number({
        required_error: "Status is required",
        invalid_type_error: "Status must be a number"
      })
      .int()
      .refine((val) => val === 0 || val === 1, {
        message: "Status must be either 0 or 1"
      }),
    
    id: z
      .string({
        required_error: "ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
  })
});

// GET DATA by celebrity - getdata
const getDataSchema = z.object({
  params: z.object({
    celebrity: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid celebrity ID format")
  })
});

// DELETE validation - deletecustomoption
const deleteCustomOptionSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
  })
});

// GET BY ID validation - getcustomoptionByid
const getCustomOptionByIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format")
  })
});

module.exports = {
  createCustomOptionSchema,
  updateCustomOptionSchema,
  updateStatusSchema,
  getDataSchema,
  deleteCustomOptionSchema,
  getCustomOptionByIdSchema,
};