const mongoose = require("mongoose");

const {
  Schema,
  model,
  models,
} = mongoose;

const {
  moderationFields,
} = require("./schema/moderation-schema");

const listenSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },

    slug: {
      type: String,
      required: true,
    },

    thumbnail: {
      type: String,
      default: "",
    },

    videoLink: {
      type: String,
      enum: [
        "YT Music",
        "Spotify",
        "iTunes",
      ],
      default: "",
    },

    noOfHours: {
      type: Number,
      default: 0,
    },

    link: {
      type: String,
      default: "",
    },

    celebrity: {
      type: Schema.Types.ObjectId,
      ref: "Celebrity",
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    status: {
      type: Number,
      default: 1,
    },

    ...moderationFields,
  },
  {
    timestamps: true,
  }
);

module.exports =
  models.Listen ||
  model("Listen", listenSchema);