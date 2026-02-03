const { Schema, model } = require("mongoose");

const GenreMasterSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Genre name is required"],
      trim: true,
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      unique: true,
      index: true,
    },

    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
      index: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
  },
  {
    timestamps: true,
  }
);

const GenreMaster = model("genremmaster", GenreMasterSchema);

module.exports = { GenreMaster };