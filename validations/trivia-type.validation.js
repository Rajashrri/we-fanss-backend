const { z } = require("zod");


const createTriviaTypeSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string"
      })
      .trim()
      .min(1, "Name cannot be empty")
      .max(100, "Name must be less than 100 characters")
  })
});


const updateTriviaTypeSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Trivia Type ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Trivia Type ID format")
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name cannot be empty")
      .max(100, "Name must be less than 100 characters")
      .optional(),
    status: z
      .number({
        invalid_type_error: "Status must be a number"
      })
      .int()
      .refine((val) => val === 0 || val === 1, {
        message: "Status must be 0 (inactive) or 1 (active)"
      })
      .optional()
  })
  .refine((data) => data.name !== undefined || data.status !== undefined, {
    message: "At least one field (name or status) must be provided"
  })
});


const updateStatusSchema = z.object({
  body: z.object({
    id: z
      .string({
        required_error: "Trivia Type ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Trivia Type ID format"),
    status: z
      .number({
        required_error: "Status is required",
        invalid_type_error: "Status must be a number"
      })
      .int()
      .refine((val) => val === 0 || val === 1, {
        message: "Status must be 0 (inactive) or 1 (active)"
      })
  })
});


const getTriviaTypeByIdSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Trivia Type ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Trivia Type ID format")
  })
});


const deleteTriviaTypeSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Trivia Type ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Trivia Type ID format")
  })
});


const getAllTriviaTypesSchema = z.object({
  query: z.object({
    page: z
      .string()
      .regex(/^\d+$/, "Page must be a positive number")
      .transform(Number)
      .optional(),
    limit: z
      .string()
      .regex(/^\d+$/, "Limit must be a positive number")
      .transform(Number)
      .optional(),
    search: z
      .string()
      .trim()
      .optional()
  }).optional()
});

module.exports = {
  createTriviaTypeSchema,
  updateTriviaTypeSchema,
  updateStatusSchema,
  getTriviaTypeByIdSchema,
  deleteTriviaTypeSchema,
  getAllTriviaTypesSchema
};