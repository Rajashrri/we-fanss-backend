// controllers/authController.js
const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const speakeasy = require("speakeasy");
const QRCode = require("qrcode");
const crypto = require("crypto");
const User = require("../models/user-model");
const { sendWelcomeEmail, sendOTPEmail, sendPasswordResetEmail, sendLoginOTPEmail } = require("../config/email.config");
const { logLoginHistory } = require("../utils/loginHistoryLogger");
const RoleModel = require("../models/role-model");





/**
 * Helper: Generate 6-digit OTP
 */
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Helper: Basic XSS sanitization
 */
const sanitizeInput = (input) => {
  if (typeof input !== "string") return input;
  return input.trim().replace(/<[^>]*>/g, "");
};

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user with Google Authenticator setup
 * @access  Public (or Admin only)
 */
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      throw createHttpError(400, "Name, email, and password are required");
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    // Password validation
    if (password.length < 6) {
      throw createHttpError(400, "Password must be at least 6 characters long");
    }

    // Check if user already exists
    const userExist = await User.findOne({ email: sanitizedEmail });
    if (userExist) {
      throw createHttpError(400, "This email is already registered");
    }

    const userRole = role || "USER";

    // Check if static OTP mode is enabled
    const useStaticOTP = process.env.ENABLE_STATIC_OTP_PROD === 'true';
    
    let secret, qrCodeDataURL;

    if (useStaticOTP) {
      // Use a dummy secret for static OTP mode
      secret = {
        base32: 'STATIC_SECRET_KEY_PLACEHOLDER',
        otpauth_url: 'otpauth://totp/WeFanss:static'
      };
      qrCodeDataURL = null;
    } else {
      // Generate Google Authenticator secret normally
      secret = speakeasy.generateSecret({
        name: `WeFanss (${sanitizedEmail})`,
        issuer: "WeFanss",
      });

      qrCodeDataURL = await QRCode.toDataURL(secret.otpauth_url);
    }

    const userCreated = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password,
      role: userRole,
      totpSecret: secret.base32,
      totpQrCode: qrCodeDataURL,
      totpEnabled: true,
      isVerified: true,
    });

    // Send welcome email (email service will handle static OTP check internally)
    try {
      await sendWelcomeEmail(
        sanitizedEmail, 
        sanitizedName, 
        password, 
        secret.base32
      );
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError);
      // Don't throw error, user is created successfully
    }

    res.status(201).json({
      success: true,
      message: useStaticOTP 
        ? "Account created successfully. Check console for credentials." 
        : "Account created successfully. Login credentials and authenticator setup sent to email.",
      user: {
        id: userCreated._id,
        name: userCreated.name,
        email: userCreated.email,
        role: userCreated.role,
      },
      ...(useStaticOTP && { 
        devInfo: "Email sending bypassed - ENABLE_STATIC_OTP_PROD is true",
        credentials: {
          email: sanitizedEmail,
          password: password,
          totpSecret: secret.base32
        }
      })
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/login
 * @desc    Step 1: Login with email + password, send OTP
 * @access  Public
 */
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createHttpError(400, "Please provide both email and password");
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    const user = await User.findOne({ email: sanitizedEmail }).select("+password");

    if (!user) {
      await logLoginHistory({
        userEmail: sanitizedEmail,
        loginSuccess: false,
        loginMethod: "PASSWORD",
        loginFlow: "PASSWORD",
        failureReason: "INVALID_EMAIL",
        activity: `Failed login attempt for ${sanitizedEmail} - Invalid email`,
        req,
      });

      throw createHttpError(401, "Invalid email or password");
    }

    if (!user.isActive) {
      await logLoginHistory({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        loginSuccess: false,
        loginMethod: "PASSWORD",
        loginFlow: "PASSWORD",
        failureReason: "ACCOUNT_DEACTIVATED",
        activity: `Failed login attempt for ${user.email} - Account deactivated`,
        req,
      });

      throw createHttpError(403, "Your account has been deactivated. Please contact support.");
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await logLoginHistory({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        loginSuccess: false,
        loginMethod: "PASSWORD",
        loginFlow: "PASSWORD",
        failureReason: "INVALID_PASSWORD",
        activity: `Failed login attempt for ${user.email} - Invalid password`,
        req,
      });

      throw createHttpError(401, "Invalid email or password");
    }

    // Check if static OTP mode is enabled
    const useStaticOTP = process.env.ENABLE_STATIC_OTP_PROD === 'true';
    
    // Generate OTP
    const otp = useStaticOTP 
      ? (process.env.STATIC_OTP || '999999')
      : Math.floor(100000 + Math.random() * 900000).toString();

      console.log(otp)
    
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    user.emailOtp = {
      code: otp,
      expiresAt: otpExpiry,
      attempts: 0,
    };

    await user.save();

    // Send OTP via email (email service internally checks static mode)
    try {
      await sendLoginOTPEmail(user.email, user.name, otp, 10);
    } catch (emailError) {
      console.error("Failed to send login OTP email:", emailError);
      // Don't block login if email fails
    }

    // Same response for both modes
    return res.status(200).json({
      success: true,
      message: "Password verified. OTP has been sent to your email.",
      email: user.email,
    });
  } catch (error) {
    next(error);
  }
};



/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP for login verification
 * @access  Public
 */
const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createHttpError(400, "Email is required");
    }

    // Sanitize input
    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists, a new verification code has been sent.",
      });
    }

    if (!user.isActive) {
      throw createHttpError(403, "Your account has been deactivated.");
    }

    // Rate limiting
    const now = Date.now();
    if (user.emailOtp && user.emailOtp.expiresAt) {
      const otpCreatedAt = user.emailOtp.expiresAt.getTime() - 10 * 60 * 1000;
      const timeSinceOtp = now - otpCreatedAt;
      
      if (timeSinceOtp < 60 * 1000) {
        const waitSeconds = Math.ceil((60 * 1000 - timeSinceOtp) / 1000);
        throw createHttpError(429, `Please wait ${waitSeconds} seconds before requesting a new code.`);
      }
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiresAt = new Date(now + 10 * 60 * 1000);

    user.emailOtp = {
      code: otp,
      expiresAt: otpExpiresAt,
      attempts: 0,
    };
    await user.save();

    // Send OTP email
    try {
      await sendOTPEmail(user.email, user.name, otp, 10);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      throw createHttpError(500, "Failed to send verification code. Please try again.");
    }

    res.status(200).json({
      success: true,
      message: "A new verification code has been sent to your email.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Step 2: Verify Email OTP or Google Authenticator
 * @access  Public
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw createHttpError(400, "Please provide both email and verification code");
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedOtp = sanitizeInput(otp);

    const user = await User.findOne({ email: sanitizedEmail }).populate("role");


   

    if (!user) {
      throw createHttpError(404, "User account not found");
    }

    // Check if static OTP mode is enabled (for dev/testing)
    const useStaticOTP = process.env.ENABLE_STATIC_OTP_PROD === 'true';
    const staticOTP = process.env.STATIC_OTP || '999999';
    
    let isValid = false;
    let otpMethod = '';
    let loginFlow = '';

    console.log(`[DEBUG] ENABLE_STATIC_OTP_PROD env: "${process.env.ENABLE_STATIC_OTP_PROD}"`);
    console.log(`[DEBUG] STATIC_OTP env: "${process.env.STATIC_OTP}"`);
    console.log(`[DEBUG] useStaticOTP boolean: ${useStaticOTP}`);
    console.log(`[DEBUG] Entered OTP: "${sanitizedOtp}"`);

    // ✅ PRIORITY 1: Static OTP Mode (if enabled in env, ALWAYS use this)
    if (useStaticOTP) {
      isValid = sanitizedOtp === staticOTP;
      otpMethod = 'STATIC_OTP';
      loginFlow = 'PASSWORD + STATIC_OTP';
      
      console.log(`[STATIC OTP MODE] Comparing "${sanitizedOtp}" === "${staticOTP}"`);
      console.log(`[STATIC OTP MODE] Result: ${isValid}`);
      
      if (!isValid) {
        console.log(`[STATIC OTP MODE] ❌ Verification failed`);
      }
    } 
    // ✅ PRIORITY 2: Production mode (only if static OTP is NOT enabled)
    else {
      // Check if user has Google Authenticator (TOTP) set up
      if (user.totpSecret && user.totpEnabled) {
        // Verify with Google Authenticator
        isValid = speakeasy.totp.verify({
          secret: user.totpSecret,
          encoding: 'base32',
          token: sanitizedOtp,
          window: 2
        });
        otpMethod = 'TOTP';
        loginFlow = 'PASSWORD + TOTP';
      } 
      // Otherwise use Email OTP
      else if (user.emailOtp && user.emailOtp.code) {
        // Check if email OTP has expired
        if (user.emailOtp.expiresAt && new Date() > user.emailOtp.expiresAt) {
          throw createHttpError(400, "Verification code has expired. Please request a new one");
        }
        
        // Check max attempts
        if (user.emailOtp.attempts >= 5) {
          throw createHttpError(400, "Maximum OTP attempts exceeded. Please request a new code");
        }
        
        // Verify email OTP
        isValid = sanitizedOtp === user.emailOtp.code;
        otpMethod = 'EMAIL_OTP';
        loginFlow = 'PASSWORD + EMAIL_OTP';
        
        // Increment attempts if wrong
        if (!isValid) {
          user.emailOtp.attempts += 1;
          await user.save();
        }
      } 
      // No 2FA method available
      else {
        throw createHttpError(400, "Two-factor authentication is not set up for this account");
      }
    }

    // If OTP verification failed
    if (!isValid) {
      await logLoginHistory({
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        userRole: user.role,
        loginSuccess: false,
        loginMethod: "PASSWORD",
        otpMethod: otpMethod,
        loginFlow: loginFlow,
        failureReason: "INVALID_OTP",
        activity: `Failed login for ${user.email} - Invalid ${otpMethod}`,
        req,
      });

      throw createHttpError(401, "Invalid verification code");
    }

    // ✅ OTP VERIFIED - Clean up email OTP if it was used
    if (otpMethod === 'EMAIL_OTP' || otpMethod === 'STATIC_OTP') {
      user.emailOtp = undefined;
    }
    
    user.lastLogin = new Date();

    const accessToken = user.generateToken();
    const refreshToken = user.generateRefreshToken();

    user.cleanExpiredTokens();
    await user.save();

    await logLoginHistory({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      userRole: user?.role?._id,
      roleName: user?.role?.name,
      loginSuccess: true,
      loginMethod: "PASSWORD",
      otpMethod: otpMethod,
      loginFlow: loginFlow,
      activity: `Successful login for ${user.email} via ${otpMethod}`,
      req,
    });

    const role = RoleModel.findById(user.role);

    res.status(200).json({
      success: true,
      message: "Login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        userRole: user?.role?._id,
      roleName: user?.role?.name,
        profilePic: user.profilePic,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user from current device
 * @access  Private
 */
const logoutUser = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.headers["x-refresh-token"];
    const userId = req.userId;

    if (refreshToken) {
      const user = await User.findById(userId);
      if (user) {
        user.refreshTokens = user.refreshTokens.filter((rt) => rt.token !== refreshToken);
        await user.save();
      }
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Get new access token using refresh token
 * @access  Public
 */
const getRefreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;

    if (!refreshToken) {
      throw createHttpError(400, "Refresh token is required");
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET_KEY || process.env.JWT_SECRET_KEY
    );

    const user = await User.findById(decoded.userId);
    if (!user) {
      throw createHttpError(404, "User not found");
    }

    if (!user.isActive) {
      throw createHttpError(403, "Your account has been deactivated");
    }

    const tokenExists = user.refreshTokens.some(
      (rt) => rt.token === refreshToken && rt.expiresAt > new Date()
    );

    if (!tokenExists) {
      throw createHttpError(401, "Invalid or expired session. Please log in again.");
    }

    user.cleanExpiredTokens();

    const newAccessToken = user.generateToken();
    user.lastLogin = new Date();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Token refreshed successfully",
      accessToken: newAccessToken,
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return next(createHttpError(401, "Invalid session token. Please log in again."));
    }
    if (error.name === "TokenExpiredError") {
      return next(createHttpError(401, "Session expired. Please log in again."));
    }
    next(error);
  }
};

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP for password reset
 * @access  Public
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw createHttpError(400, "Please provide your email address");
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    const user = await User.findOne({ email: sanitizedEmail });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset code has been sent.",
      });
    }

    if (!user.isActive) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, a password reset code has been sent.",
      });
    }

    // Rate limiting
    const now = Date.now();
    if (user.passwordResetOtp && user.passwordResetOtp.expiresAt) {
      const otpCreatedAt = user.passwordResetOtp.expiresAt.getTime() - 15 * 60 * 1000;
      const timeSinceOtp = now - otpCreatedAt;
      
      if (timeSinceOtp < 60 * 1000) {
        const waitSeconds = Math.ceil((60 * 1000 - timeSinceOtp) / 1000);
        throw createHttpError(429, `Please wait ${waitSeconds} seconds before requesting another reset code.`);
      }
    }

    // Generate reset OTP
    const resetOtp = generateOTP();

    user.passwordResetOtp = {
      code: resetOtp,
      expiresAt: new Date(now + 15 * 60 * 1000),
      attempts: 0,
    };
    await user.save();

    // Send reset OTP email
    try {
      await sendOTPEmail(user.email, user.name, resetOtp, 15, "Password Reset");
    } catch (emailError) {
      console.error("Failed to send reset OTP email:", emailError);
      throw createHttpError(500, "Failed to send password reset code. Please try again.");
    }

    res.status(200).json({
      success: true,
      message: "A 6-digit password reset code has been sent to your email address.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/verify-reset-otp
 * @desc    Step 2: Verify reset OTP only (no password change)
 * @access  Public
 */
const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      throw createHttpError(400, "Email and verification code are required");
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();
    const sanitizedOtp = sanitizeInput(otp);

    const user = await User.findOne({ email: sanitizedEmail }).select("+totpSecret");

    if (!user) {
      throw createHttpError(404, "User account not found");
    }

    let isValid = false;
    let verificationMethod = null;

    // Check Email OTP
    if (user.passwordResetOtp && user.passwordResetOtp.code) {
      if (new Date() > user.passwordResetOtp.expiresAt) {
        user.passwordResetOtp = undefined;
        await user.save();
        throw createHttpError(400, "Reset code has expired. Please request a new one.");
      }

      if (user.passwordResetOtp.attempts >= 5) {
        user.passwordResetOtp = undefined;
        await user.save();
        throw createHttpError(429, "Maximum verification attempts reached. Please request a new reset code.");
      }

      if (user.passwordResetOtp.code === sanitizedOtp) {
        isValid = true;
        verificationMethod = "EMAIL_OTP";
        // Mark as verified but don't clear OTP yet
        user.passwordResetOtp.verified = true;
      } else {
        user.passwordResetOtp.attempts = (user.passwordResetOtp.attempts || 0) + 1;
        await user.save();

        if (user.passwordResetOtp.attempts >= 5) {
          user.passwordResetOtp = undefined;
          await user.save();
          throw createHttpError(429, "Maximum verification attempts reached. Please request a new reset code.");
        }

        const remainingAttempts = 5 - user.passwordResetOtp.attempts;
        throw createHttpError(401, `Invalid reset code. ${remainingAttempts} attempt${remainingAttempts > 1 ? 's' : ''} remaining.`);
      }
    }

    // Check TOTP as alternative
    if (!isValid && user.totpSecret && user.totpEnabled) {
      const totpValid = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: "base32",
        token: sanitizedOtp,
        window: 2,
      });

      if (totpValid) {
        isValid = true;
        verificationMethod = "TOTP";
        // Mark as verified
        if (!user.passwordResetOtp) {
          user.passwordResetOtp = {};
        }
        user.passwordResetOtp.verified = true;
        user.passwordResetOtp.expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      }
    }

    if (!isValid) {
      throw createHttpError(401, "Invalid verification code. Please check and try again.");
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Verification successful. You can now reset your password.",
      verified: true,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/auth/reset-password
 * @desc    Step 3: Reset password after OTP verification
 * @access  Public
 */
const resetPassword = async (req, res, next) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      throw createHttpError(400, "Email and new password are required");
    }

    if (newPassword.length < 6) {
      throw createHttpError(400, "Password must be at least 6 characters long");
    }

    const sanitizedEmail = sanitizeInput(email).toLowerCase();

    const user = await User.findOne({ email: sanitizedEmail }).select("+passwordResetOtp");;

    if (!user) {
      throw createHttpError(404, "User account not found");

    
    }

    console.log(
  "verified value:",
  user.passwordResetOtp?.verified,
  "type:",
  typeof user.passwordResetOtp?.verified
);

    // Check if OTP was verified
   if (!user.passwordResetOtp || user.passwordResetOtp.verified !== true) {
  throw createHttpError(403, "Please verify your reset code first");
}


    // Check if verification hasn't expired
    if (new Date() > user.passwordResetOtp.expiresAt) {
      user.passwordResetOtp = undefined;
      await user.save();
      throw createHttpError(400, "Verification expired. Please request a new reset code.");
    }

    // Reset password
    user.password = newPassword;
    user.refreshTokens = [];
    user.passwordResetOtp = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successfully. Please log in with your new password.",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).populate("role");

    console.log(user)

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role._id,
        roleName:user.role.name,
        isActive: user.isActive,
        isVerified: user.isVerified,
        totpEnabled: user.totpEnabled,
        lastLogin: user.lastLogin,
        lastLoginIp: user.lastLoginIp,
        lastLoginDevice: user.lastLoginDevice,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  logoutUser,
  getRefreshToken,
  forgotPassword,
  verifyResetOtp,
  getProfile,
  resetPassword,  
};