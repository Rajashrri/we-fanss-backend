const { z } = require("zod");



const optionSchema = z.object({
  label: z
    .string({
      invalid_type_error: "Label must be a string",
    })
    .trim()
    .optional(),
  value: z
    .string({
      invalid_type_error: "Value must be a string",
    })
    .trim()
    .optional(),
});


const fieldsConfigSchema = z.object({
  title: z
    .string({
      required_error: "Field title is required",
      invalid_type_error: "Title must be a string",
    })
    .trim()
    .min(1, "Title cannot be empty"),
  type: z
    .string({
      required_error: "Field type is required",
      invalid_type_error: "Type must be a string",
    })
    .trim()
    .min(1, "Type cannot be empty"),
  placeholder: z
    .string({
      invalid_type_error: "Placeholder must be a string",
    })
    .trim()
    .optional(),
  isRequired: z
    .boolean({
      invalid_type_error: "isRequired must be a boolean",
    })
    .optional(),
  options: z.array(optionSchema).optional(),
});



const createSectionMasterSchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: "Name is required",
        invalid_type_error: "Name must be a string",
      })
      .trim()
      .min(1, "Name cannot be empty")
      .max(100, "Name must be less than 100 characters"),
    slug: z
      .string({
        invalid_type_error: "Slug must be a string",
      })
      .trim()
      .optional(),
    layout: z
      .string({
        invalid_type_error: "Layout must be a string",
      })
      .trim()
      .optional(),
    isRepeater: z
      .boolean({
        invalid_type_error: "isRepeater must be a boolean",
      })
      .optional(),
    fieldsConfig: z
      .array(fieldsConfigSchema)
      .min(1, "At least one field config is required"),
  }),
});


const updateSectionMasterSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Section Master ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Section Master ID format"),
  }),
  body: z
    .object({
      name: z
        .string()
        .trim()
        .min(1, "Name cannot be empty")
        .max(100, "Name must be less than 100 characters")
        .optional(),
      slug: z
        .string({
          invalid_type_error: "Slug must be a string",
        })
        .trim()
        .optional(),
      layout: z
        .string({
          invalid_type_error: "Layout must be a string",
        })
        .trim()
        .optional(),
      isRepeater: z
        .boolean({
          invalid_type_error: "isRepeater must be a boolean",
        })
        .optional(),
      fieldsConfig: z.array(fieldsConfigSchema).optional(),
    })
    .refine(
      (data) =>
        data.name !== undefined ||
        data.slug !== undefined ||
        data.layout !== undefined ||
        data.isRepeater !== undefined ||
        data.fieldsConfig !== undefined,
      {
        message: "At least one field must be provided",
      }
    ),
});



const updateStatusSectionMasterSchema = z.object({
  body: z.object({
    id: z
      .string({
        required_error: "Section Master ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Section Master ID format"),
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



const getSectionMasterByIdSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Section Master ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Section Master ID format"),
  }),
});



const deleteSectionMasterSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Section Master ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Section Master ID format"),
  }),
});



const getAllSectionMasterSchema = z.object({
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
  createSectionMasterSchema,
  updateSectionMasterSchema,
  updateStatusSectionMasterSchema,
  getSectionMasterByIdSchema,
  deleteSectionMasterSchema,
  getAllSectionMasterSchema,
};