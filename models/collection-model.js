const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Userlogin",
    },

    name: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      unique: true,
    },

    celebrities: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Celebrity", // ✅ fixed
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "Collection",
  collectionSchema
);