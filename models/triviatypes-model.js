const { Schema, model } = require("mongoose");
const slugify = require("slugify");

const triviaTypesSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    status: {
      type: Number,
      enum:[0,1],
      default:1
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  },
);

triviaTypesSchema.statics.generateSlug = function ({ name, slug }) {
  if (name && name.trim()) {
    return slugify(name.trim(), { lower: true, strict: true });
  }
  if (slug && slug.trim()) {
    return slugify(slug.trim(), { lower: true, strict: true });
  }

  return undefined;
};

const TriviaTypes = model("triviaTypes", triviaTypesSchema);

module.exports = { TriviaTypes };
