const { Schema, model } = require("mongoose");
const positionsSchema = new Schema({
  // 🎭 Relation to celebrity
  celebrityId: { type: String, required: true },

  // 🏛️ Basic Info
  title: { type: String, required: true }, // e.g., Minister of Education
  department: { type: String }, // e.g., Ministry of Education
  level: { type: String},

  // 📅 Duration
  from_date: { type: String }, // e.g., 2021-05-15
  to_date: { type: String },
  current: { type: String }, // Yes / No

  // 🌍 Political / Regional Info
  state: { type: String },
  constituency: { type: String },
  party: { type: String },
  reporting: { type: String }, // Reporting to / Under

  // 🏆 Work Summary
  work: { type: String },

  // 🔗 Reference Links
  reference: [
    {
      label: { type: String, trim: true },
      url: { type: String, trim: true },
    },
  ],

  // 🖼️ Media (image/video filename)
  image: { type: String },

  // 📊 Sorting & Status
  sort: { type: String },
  statusnew: { type: String },
  status: { type: String, default: "1" },

  // 👩‍💼 Audit Fields
  createdBy: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },

  // 🌐 SEO / Metadata
  url: { type: String },
});
const Positions = model("positions", positionsSchema);
module.exports = { Positions };
