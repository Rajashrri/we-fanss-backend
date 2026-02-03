// models/ActivityLog.js
const mongoose = require("mongoose");
const {
  ACTIVITY_ACTIONS,
  ACTIVITY_RESOURCES,
  ACTIVITY_STATUS,
} = require("../constants/activityLogConstants");

const activityLogSchema = new mongoose.Schema(
  {
    // User who performed the action
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Role of user who performed action
    performedByRole: {
      type: String,
      required: true,
      index: true,
    },

    // Action type
    action: {
      type: String,
      required: true,
      enum: Object.values(ACTIVITY_ACTIONS),
      index: true,
    },

    // Resource/Module
    resource: {
      type: String,
      required: true,
      enum: Object.values(ACTIVITY_RESOURCES),
      index: true,
    },

    // Detailed target item
    item: {
      type: {
        type: String,
        required: true,
      },
      id: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
      },
      name: {
        type: String,
        trim: true,
      },
    },

    // Human-readable activity description
    activity: {
      type: String,
      required: true,
      trim: true,
    },

    // Status of the action
    status: {
      type: String,
      enum: Object.values(ACTIVITY_STATUS),
      default: ACTIVITY_STATUS.SUCCESS,
      index: true,
    },

    // Device & Browser Info
    ipAddress: {
      type: String,
      trim: true,
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

// Compound Indexes for faster queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ resource: 1, action: 1 });
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ userId: 1, resource: 1, createdAt: -1 });
activityLogSchema.index({ performedByRole: 1, createdAt: -1 });
activityLogSchema.index({ "item.id": 1 });
activityLogSchema.index({ isArchived: 1, createdAt: -1 });
activityLogSchema.index({ status: 1, createdAt: -1 });

// TTL Index - Auto-delete logs after 6 months (180 days)
// Only applies to non-archived logs
activityLogSchema.index(
  { createdAt: 1 },
  {
    expireAfterSeconds: 60 * 60 * 24 * 180, // 6 months
    partialFilterExpression: { isArchived: false },
  }
);

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);

module.exports = ActivityLog;