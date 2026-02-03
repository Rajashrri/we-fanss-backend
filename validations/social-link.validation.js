const { z } = require("zod");


const createSocialLinkSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string"
      })
      .trim()
      .min(1, "Name cannot be empty")
      .max(100, "Name must be less than 100 characters"),
    
  })
});

// ✅ Validation for UPDATE (PATCH /updateSocialLink/:id)
// Frontend sends: name only
const updateSocialLinkSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Social Link ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Social Link ID format")
  }),
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

// ✅ Validation for UPDATE STATUS (PATCH /update-statusSocialLink)
// Frontend sends: id, status
const updateStatusSchema = z.object({
  body: z.object({
    id: z
      .string({
        required_error: "Social Link ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Social Link ID format"),
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

// ✅ Validation for GET BY ID (GET /getSocialLinkById/:id)
const getSocialLinkByIdSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Social Link ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Social Link ID format")
  })
});

// ✅ Validation for DELETE (DELETE /deleteSocialLink/:id)
const deleteSocialLinkSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Social Link ID is required"
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Social Link ID format")
  })
});

// ✅ Validation for GET ALL (GET /getdataSocialLink)
// Optional query params for pagination/search
const getAllSocialLinksSchema = z.object({
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
  createSocialLinkSchema,
  updateSocialLinkSchema,
  updateStatusSchema,
  getSocialLinkByIdSchema,
  deleteSocialLinkSchema,
  getAllSocialLinksSchema
};