const { Schema, model } = require("mongoose");

const socialLinkSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      trim: true
    },
    slug: { 
      type: String,
      unique: true,
      index: true
    },
    status: { 
      type: Number,
      enum: [0, 1],
      default: 1
    },
    createdBy: { 
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { 
    timestamps: true 
  }
);

const SocialLink = model('SocialLink', socialLinkSchema);

module.exports = { SocialLink };