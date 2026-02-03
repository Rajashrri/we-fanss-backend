const { z } = require("zod");


const createSectionTemplateSchema = z.object({
  body: z.object({
    title: z
      .string({
        required_error: "Title is required",
        invalid_type_error: "Title must be a string",
      })
      .trim()
      .min(3, "Title must be at least 3 characters")
      .max(200, "Title must be less than 200 characters"),
    sections: z
      .array(
        z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid section ID format"),
        {
          required_error: "Sections are required",
          invalid_type_error: "Sections must be an array",
        }
      )
      .min(1, "At least one section is required"),
    slug: z
      .string({
        invalid_type_error: "Slug must be a string",
      })
      .trim()
      .optional(),
    status: z
      .number({
        invalid_type_error: "Status must be a number",
      })
      .int()
      .refine((val) => val === 0 || val === 1, {
        message: "Status must be 0 (inactive) or 1 (active)",
      })
      .optional(),
  }),
});


const updateSectionTemplateSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Section Template ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Section Template ID format"),
  }),
  body: z
    .object({
      title: z
        .string({
          invalid_type_error: "Title must be a string",
        })
        .trim()
        .min(3, "Title must be at least 3 characters")
        .max(200, "Title must be less than 200 characters")
        .optional(),
      sections: z
        .array(
          z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid section ID format")
        )
        .min(1, "At least one section is required")
        .optional(),
      slug: z
        .string({
          invalid_type_error: "Slug must be a string",
        })
        .trim()
        .optional(),
      status: z
        .number({
          invalid_type_error: "Status must be a number",
        })
        .int()
        .refine((val) => val === 0 || val === 1, {
          message: "Status must be 0 (inactive) or 1 (active)",
        })
        .optional(),
    })
    .refine(
      (data) =>
        data.title !== undefined ||
        data.sections !== undefined ||
        data.slug !== undefined ||
        data.status !== undefined,
      {
        message: "At least one field must be provided",
      }
    ),
});


const updateStatusSectionTemplateSchema = z.object({
  body: z.object({
    id: z
      .string({
        required_error: "Section Template ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Section Template ID format"),
    status: z
      .number({
        required_error: "Status is required",
        invalid_type_error: "Status must be a number",
      })
      .int()
      .refine((val) => val === 0 || val === 1, {
        message: "Status must be 0 (inactive) or 1 (active)",
      }),
  }),
});


const getSectionTemplateByIdSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Section Template ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Section Template ID format"),
  }),
});


const deleteSectionTemplateSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Section Template ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Section Template ID format"),
  }),
});


const getAllSectionTemplateSchema = z.object({
  query: z
    .object({
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
      search: z.string().trim().optional(),
    })
    .optional(),
});

module.exports = {
  createSectionTemplateSchema,
  updateSectionTemplateSchema,
  updateStatusSectionTemplateSchema,
  getSectionTemplateByIdSchema,
  deleteSectionTemplateSchema,
  getAllSectionTemplateSchema,
};