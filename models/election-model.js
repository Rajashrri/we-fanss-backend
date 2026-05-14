const { Schema, model } = require("mongoose");

const electionSchema = new Schema({
  election_year: { type: String, required: true }, // e.g., 2024
  type: { type: String, required: true }, // e.g., Lok Sabha, Vidhan Sabha
  state: { type: String },
  constituency: { type: String },
  party: { type: String },
  role: { type: String }, // Candidate, Campaign Lead, etc.
  result: { type: String }, // Won, Lost, Withdrawn, etc.
  vote_share: { type: String },
  votes: { type: String },
  opponent: { type: String },
  notes: { type: String },

  // 🔗 Reference Links
  reference: [
    {
      label: { type: String, trim: true },
      url: { type: String, trim: true },
    },
  ],

  // 🖼️ Media
  image: { type: String }, // filename (image/video)

  // 📊 Sorting & Status
  sort: { type: String },
  statusnew: { type: String},
  status: { type: String, default: "1" },

  // 🌐 Relations
  celebrityId: { type: String, required: true },

  // 👩‍💼 Audit Fields
  createdBy: { type: String },
  createdAt: { type: String },
  updatedAt: { type: String },

  // 🌍 SEO / Metadata
  url: { type: String },

  
} );

const Election = model("election", electionSchema);
module.exports = { Election };
