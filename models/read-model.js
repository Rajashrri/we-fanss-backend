const mongoose = require("mongoose");

const {
  Schema,
  model,
  models,
} = mongoose;

const {
  moderationFields,
} = require("./schema/moderation-schema");

const readSchema = new Schema(
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

    shortIntro: {
      type: String,
      default: "",
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
  models.Read ||
  model("Read", readSchema);