require("dotenv").config();

const express = require("express");
const router = express.Router();
const authControllers = require("../controllers/auth-controller");
const {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  forgotPasswordSchema,
  verifyResetOtpSchema,
  resetPasswordSchema,
  refreshTokenSchema,
} = require("../shared/schema/auth-schema");
const validate = require("../middlewares/validate.middleware");
const authenticate = require("../middlewares/auth-middleware");
const {checkPrivilege }= require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
// ==================== PUBLIC ROUTES ====================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with Google Authenticator setup
 * @access  Public (or Admin only)
 */
router.post(
  "/register",
  validate(registerSchema),
  authenticate,
  authControllers.registerUser
);

/**
 * @route   POST /api/auth/login
 * @desc    Step 1: Login with email + password, send OTP
 * @access  Public
 */
router.post(
  "/login",
  authControllers.loginUser
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Step 2: Verify Email OTP or Google Authenticator
 * @access  Public
 */
router.post(
  "/verify-otp",
  authControllers.verifyOtp
);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for login verification
 * @access  Public
 */
router.post(
  "/resend-otp",
  validate(resendOtpSchema),
  authControllers.resendOtp
);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Step 1: Send OTP for password reset
 * @access  Public
 */
router.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  authControllers.forgotPassword
);

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Step 2: Verify reset OTP (no password change yet)
 * @access  Public
 */
router.post(
  "/verify-reset-otp",
  validate(verifyResetOtpSchema),
  authControllers.verifyResetOtp
);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Step 3: Set new password after OTP verification
 * @access  Public
 */
router.post(
  "/reset-password",
  validate(resetPasswordSchema),
  authControllers.resetPassword
);

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Get new access token using refresh token
 * @access  Public
 */
router.post(
  "/refresh-token",
  validate(refreshTokenSchema),
  authControllers.getRefreshToken
);

// ==================== PRIVATE ROUTES (Authenticated Users) ====================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current authenticated user profile
 * @access  Private
 */
router.get(
  "/profile",
  authenticate,
  authControllers.getProfile
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user from current session
 * @access  Private
 */
router.post(
  "/logout",
  authenticate,
  authControllers.logoutUser
);

module.exports = router;