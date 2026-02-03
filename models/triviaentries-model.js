const { Schema, model } = require("mongoose");

// ✅ Trivia Entries Schema
const triviaentriesSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    // Category (linked from Trivia Types Master)
    category_id: { type: String, required: true },
    category_name: { type: String },

    // Optional fields
    media: { type: String },         // uploaded file (image/video)
    source_link: { type: String },   // external source link
  celebrityId: { type: String }, // movie title

    // System fields
    createdBy: { type: String },
    updatedBy: { type: String },
    createdAt: { type: String },
    url: { type: String },           // SEO-friendly slug
    status: { type: Number, default: 1 }, // active by default
  },
  { timestamps: true }
);

const Triviaentries = model("triviaentries", triviaentriesSchema);
module.exports = { Triviaentries };
