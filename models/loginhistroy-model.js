// models/LoginHistory.js
const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    // User Info
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    userEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    userRole: {
      type: String,
      required: true,
      index: true,
    },

    // Login Details
    loginSuccess: {
      type: Boolean,
      default: false,
      index: true,
    },
    
    // Primary login method
    loginMethod: {
      type: String,
      enum: ["PASSWORD", "GOOGLE", "OAUTH"],
      default: "PASSWORD",
    },
    
    // OTP verification (if applicable)
    otpMethod: {
      type: String,
      enum: ["EMAIL_OTP", "TOTP", "NONE"],
      default: "NONE",
    },
    
    // Full login flow description
    loginFlow: {
      type: String,
      trim: true,
      // Examples: "PASSWORD + EMAIL_OTP", "PASSWORD + TOTP", "GOOGLE", "PASSWORD"
    },
    
    failureReason: {
      type: String,
      trim: true,
    },

    // Activity Description (human-readable)
    activity: {
      type: String,
      required: true,
      trim: true,
    },

    // Device & Browser Info (consistent with ActivityLog)
    ipAddress: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    device: {
      type: String,
      trim: true,
    },
    os: {
      type: String,
      trim: true,
    },
    browser: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },

    // Location Info
    location: {
      country: { type: String },
      city: { type: String },
      region: { type: String },
      timezone: { type: String },
    },

    // Status (similar to ActivityLog)
    status: {
      type: String,
      enum: ["SUCCESS", "FAILED"],
      default: "SUCCESS",
      index: true,
    },

    // Soft delete / Archive support
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// Compound Indexes for better query performance
loginHistorySchema.index({ userId: 1, createdAt: -1 });
loginHistorySchema.index({ loginSuccess: 1, createdAt: -1 });
loginHistorySchema.index({ status: 1, createdAt: -1 });
loginHistorySchema.index({ userRole: 1, createdAt: -1 });
loginHistorySchema.index({ ipAddress: 1, createdAt: -1 });
loginHistorySchema.index({ isArchived: 1, createdAt: -1 });
loginHistorySchema.index({ loginMethod: 1, otpMethod: 1 });

// TTL Index - Auto-delete login history after 6 months (180 days)
// Only applies to non-archived logs
loginHistorySchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 180, // 6 months
    partialFilterExpression: { isArchived: false },
  }
);

const LoginHistory = mongoose.model("LoginHistory", loginHistorySchema);

module.exports = LoginHistory;