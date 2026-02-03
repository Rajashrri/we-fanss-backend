const mongoose = require('mongoose');

// Related Personality Schema
const relatedPersonalitySchema = new mongoose.Schema(
  {
    celebrity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Celebrity',
      required: [true, 'Celebrity is required'],
    },

    relatedCelebrity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Celebrity',
      required: [true, 'Related celebrity is required'],
    },

    relationshipType: {
      type: String,
      required: [true, 'Relationship type is required'],
      enum: ['Mentor', 'Co-star', 'Rival', 'Family', 'Politically', 'Other'],
      trim: true,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'related-personalities',
    },

    notes: {
      type: String,
      trim: true,
    },

    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Created by is required'],
    },
  },
  { timestamps: true }
);

// 🔒 Prevent self-relationship
relatedPersonalitySchema.pre('save', function (next) {
  if (this.celebrity.equals(this.relatedCelebrity)) {
    return next(new Error('Celebrity cannot be related to themselves'));
  }
  next();
});

// ✅ UPDATED: Allow multiple relationship types between same celebrities
// 🔑 Compound unique index including relationship type
relatedPersonalitySchema.index(
  { celebrity: 1, relatedCelebrity: 1, relationshipType: 1 },
  { unique: true }
);

// ⚡ Extra indexes for faster queries
relatedPersonalitySchema.index({ celebrity: 1 });
relatedPersonalitySchema.index({ relatedCelebrity: 1 });
relatedPersonalitySchema.index({ celebrity: 1, relationshipType: 1 });
relatedPersonalitySchema.index({ relatedCelebrity: 1, relationshipType: 1 });

// Export model
const RelatedPersonality = mongoose.model('RelatedPersonality', relatedPersonalitySchema);
module.exports = RelatedPersonality;