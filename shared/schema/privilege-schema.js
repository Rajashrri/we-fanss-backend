const { z } = require("zod");

/* ===============================
   OPERATIONS OBJECT
=============================== */
const operationsSchema = z.object({
  view: z.boolean().optional(),    // ✅ Added VIEW operation
  add: z.boolean().optional(),
  edit: z.boolean().optional(),
  delete: z.boolean().optional(),
  publish: z.boolean().optional(), // Only for celebrity resources
}).strict();


/* ===============================
   SINGLE PERMISSION
=============================== */
const permissionSchema = z.object({
  resource: z
    .string({ required_error: "Resource is required" })
    .min(1, "Resource is required")
    .trim(),

  operations: operationsSchema,
});


/* ===============================
   SET PRIVILEGES
=============================== */
const setPrivilegesSchema = z.object({
  body: z.object({
    permissions: z
      .array(permissionSchema)
      .min(1, "At least one permission is required"),

    description: z
      .string()
      .max(500, "Description cannot exceed 500 characters")
      .trim()
      .optional(),
  }),
});

module.exports = {
  setPrivilegesSchema,
};