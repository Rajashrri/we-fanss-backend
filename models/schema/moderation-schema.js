const mongoose = require("mongoose");
const { Schema } = mongoose;

const MODERATION_STATES = Object.freeze({
  PENDING: "PENDING",
  PUBLISHED: "PUBLISHED",
  REJECTED: "REJECTED",
});

const moderationFields = {
  moderationState: {
    type: String,
    enum: Object.values(MODERATION_STATES),
    default: MODERATION_STATES.PENDING,
    required: true,
    index: true,
  },

  // 👤 Who made the moderation decision (approve/reject)
  moderatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },

  moderatedAt: {
    type: Date,
    default: null,
  },

  moderationRemark: {
    type: String,
    trim: true,
    default: null,
  },
};

module.exports = {
  moderationFields,
  MODERATION_STATES,
};
