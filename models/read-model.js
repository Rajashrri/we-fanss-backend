// models/watch-model.js
const { Schema, model, models } = require("mongoose");
const { moderationFields } = require("./schema/moderation-schema");

const readSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
    },

    // Thumbnail Image
    thumbnail: {
      type: String,
      default: "",
    },

    // Video Platform
    videoType: {
      type: String,
      enum: ["YT", "Vimeo", "Twitch"],
      required: true,
    },

    // Video URL
    link: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: Number,
      default: 1,
      enum: [0, 1],
    },

    celebrity: {
      type: Schema.Types.ObjectId,
      ref: "Celebrity",
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    ...moderationFields,
  },
  {
    timestamps: true,
  }
);

// ✅ Prevent OverwriteModelError
module.exports = models.Read || model("Read", readSchema);