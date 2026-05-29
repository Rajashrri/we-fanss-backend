const mongoose = require("mongoose");

const recentViewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Userlogin",
    },

    celebrityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Celebraty",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "RecentView",
  recentViewSchema
);