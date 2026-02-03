const { z } = require("zod");

/* ===============================
   REGISTER
=============================== */
const registerSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters")
      .trim(),

    email: z
      .string()
      .email("Invalid email format")
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be less than 50 characters"),

    role: z.string().optional().default("USER"),
  }),
});


/* ===============================
   LOGIN
=============================== */
const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .trim()
      .toLowerCase(),

    password: z
      .string()
      .min(1, "Password is required"),
  }),
});


/* ===============================
   VERIFY OTP (LOGIN)
=============================== */
const verifyOtpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .trim()
      .toLowerCase(),

    otp: z
      .string()
      .min(6, "Code must be at least 6 characters")
      .max(8, "Code must be less than 8 characters")
      .trim(),
  }),
});


/* ===============================
   RESEND OTP
=============================== */
const resendOtpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .trim()
      .toLowerCase(),
  }),
});


/* ===============================
   FORGOT PASSWORD (SEND OTP)
=============================== */
const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .trim()
      .toLowerCase(),
  }),
});


/* ===============================
   VERIFY RESET OTP
=============================== */
const verifyResetOtpSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .trim()
      .toLowerCase(),

    otp: z
      .string()
      .min(6, "Code must be at least 6 characters")
      .max(8, "Code must be less than 8 characters")
      .trim(),
  }),
});


/* ===============================
   RESET PASSWORD
=============================== */
const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email format")
      .trim()
      .toLowerCase(),

    newPassword: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .max(50, "Password must be less than 50 characters"),
  }),
});


/* ===============================
   REFRESH TOKEN
=============================== */
const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(), // Often comes from cookies
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  refreshTokenSchema,
};
