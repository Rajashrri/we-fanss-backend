const mongoose = require('mongoose');

const referenceSchema = new mongoose.Schema(
  {
    celebrity: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Celebrity',
      required: [true, 'Celebrity is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'],
    },
    url: {
      type: String,
      required: [true, 'URL is required'],
      trim: true,
      match: [/^https?:\/\/.+\..+/, 'Please enter a valid URL'],
    },
    type: {
      type: String,
      enum: ['News', 'Wiki', 'Interview', 'Gov Link', 'Other'],
      default: 'News',
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


referenceSchema.index({ celebrity: 1, url: 1 }, { unique: true });


referenceSchema.index({ celebrity: 1, slug: 1 }, { unique: true });


referenceSchema.index({ celebrity: 1, status: 1 });
referenceSchema.index({ title: 1 });
referenceSchema.index({ type: 1 });

const Reference = mongoose.model('Reference', referenceSchema);

module.exports = Reference;