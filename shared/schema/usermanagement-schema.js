const { z } = require("zod");

/* ===============================
   GET ALL USERS (WITH FILTERS)
=============================== */
const getUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(10),
    search: z.string().trim().optional(),
  }).default({}),
});


/* ===============================
   GET SINGLE USER BY ID
=============================== */
const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
});


/* ===============================
   UPDATE USER ROLE
=============================== */
const updateUserRoleSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
  body: z.object({
    role: z
      .string({ required_error: "Role is required" })
      .min(1, "Role is required")
      .trim(),
  }),
});


/* ===============================
   UPDATE USER STATUS
=============================== */
const updateUserStatusSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
  body: z.object({
    isActive: z.boolean({
      required_error: "isActive is required",
      invalid_type_error: "isActive must be a boolean",
    }),
  }),
});


/* ===============================
   DELETE USER
=============================== */
const deleteUserSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
});


/* ===============================
   TOGGLE TOTP
=============================== */
const toggleTotpSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
  body: z.object({
    totpEnabled: z.boolean({
      required_error: "totpEnabled is required",
      invalid_type_error: "totpEnabled must be a boolean",
    }),
  }),
});


/* ===============================
   GET USER QR CODE
=============================== */
const getUserQrCodeSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID"),
  }),
});


module.exports = {
  getUsersSchema,
  getUserByIdSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  deleteUserSchema,
  toggleTotpSchema,
  getUserQrCodeSchema,
};
