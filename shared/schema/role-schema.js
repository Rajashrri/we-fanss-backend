const { z } = require("zod");

/* ===============================
   CREATE ROLE
=============================== */
const createRoleSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Role name is required",
        invalid_type_error: "Role name must be a string",
      })
      .min(2, "Role name must be at least 2 characters")
      .max(50, "Role name cannot exceed 50 characters")
      .trim()
      .refine(val => val.length > 0, "Role name cannot be empty"),

    description: z
      .string()
      .max(200, "Description cannot exceed 200 characters")
      .trim()
      .optional(),
  }),
});


/* ===============================
   UPDATE ROLE
=============================== */
const updateRoleSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Role name must be at least 2 characters")
      .max(50, "Role name cannot exceed 50 characters")
      .trim()
      .optional(),

    description: z
      .string()
      .max(200, "Description cannot exceed 200 characters")
      .trim()
      .optional(),
  }).refine(
    data => data.name !== undefined || data.description !== undefined,
    {
      message: "At least one field (name or description) must be provided",
    }
  ),
});


/* ===============================
   UPDATE ROLE STATUS
=============================== */
const updateRoleStatusSchema = z.object({
  body: z.object({
    status: z
      .number({
        required_error: "Status is required",
        invalid_type_error: "Status must be a a number",
      })
      .refine(val => val === 0 || val === 1, "Status must be either 0 or 1"),
  }),
});


/* ===============================
   MONGODB PARAM ID VALIDATION
=============================== */
const mongoIdSchema = z.object({
  params: z.object({
    id: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format"),
  }),
});


module.exports = {
  createRoleSchema,
  updateRoleSchema,
  updateRoleStatusSchema,
  mongoIdSchema,
};
