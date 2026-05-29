const mongoose = require("mongoose");

const followSchema = new mongoose.Schema(
  {
    celebrityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Celebrity",
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Follow", followSchema);