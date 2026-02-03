const { Schema, model } = require("mongoose");

const movievSchema = new Schema({
  // 🎬 Basic Movie Info
  title: { type: String, required: true }, // movie title
  release_year: { type: String },
  release_date: { type: String },
  role: { type: String }, // actor’s character name
  // 🧑‍🎭 Role Details
  genre: [
  {
    type: Schema.Types.ObjectId,
    ref: "genremmaster", // apne genre model ka exact naam likhna
  }
],

  role_type: {
    type: String,
  },
  sort: { type: String },
  statusnew: { type: String },
  awards: { type: String },

  // 🌐 Relations
  celebrityId: { type: String }, // movie title

  // 🌍 Metadata
  languages: [{ type: String }],
  director: { type: String },
  producer: { type: String },
  cast: { type: String },

  // 📝 Description / Notes
  notes: { type: String },

  // ⭐ Ratings
  rating: { type: String },
  platform_rating: { type: String },

  // 🖼️ Media
  image: { type: String },

  // 🧩 Admin Info
  createdBy: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },

  // 🔗 SEO / Status
  url: { type: String },
  status: { type: String, default: "1" },
  watchLinks: [
    {
      platform: { type: String, trim: true },
      url: { type: String, trim: true },
      type: { type: String, trim: true },
    },
  ],
});

const Moviev = model("moviev", movievSchema);
module.exports = { Moviev };
