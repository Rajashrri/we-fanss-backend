const { z } = require("zod");


const createGenreMasterSchema = z.object({
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


const updateGenreMasterSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Genre ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Genre ID format")
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Name cannot be empty")
      .max(100, "Name must be less than 100 characters")
      .optional()
  })
  .refine((data) => data.name !== undefined, {
    message: "Name must be provided"
  })
});


const updateStatusGenreMasterSchema = z.object({
  body: z.object({
    id: z
      .string({
        required_error: "Genre ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Genre ID format"),
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


const getGenreMasterByIdSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Genre ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Genre ID format")
  })
});


const deleteGenreMasterSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Genre ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Genre ID format")
  })
});


const getAllGenreMasterSchema = z.object({
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
  createGenreMasterSchema,
  updateGenreMasterSchema,
  updateStatusGenreMasterSchema,
  getGenreMasterByIdSchema,
  deleteGenreMasterSchema,
  getAllGenreMasterSchema
};