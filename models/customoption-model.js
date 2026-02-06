// models/client-model.js
const { Schema, model } = require("mongoose");

const customoptionchema = new Schema(
  {
    title: { 
      type: String, 
      required: [true, 'Title is required'], 
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    slug: { 
      type: String, 
      trim: true,
      lowercase: true,
      match: [/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens']
    },
    description: { 
      type: String, 
      trim: true,
    },
    status: { 
      type: Number, 
      enum: {
        values: [0, 1],
        message: 'Status must be either 0 or 1'
      },
      default: 1 
    },
    createdBy: { 
      type: Schema.Types.ObjectId, 
      ref: 'User',
      required: [true, 'Creator is required']
    },
    media: {
      path: {
        type: String,
        trim: true
      },
      type: {
        type: String,
        enum: {
          values: ["image", "video"],
          message: 'Media type must be either image or video'
        }
      }
    },
    celebrity: { 
      type: Schema.Types.ObjectId, 
      ref: 'Celebrity'
    }
  },
  { timestamps: true }
);

module.exports = model('customoption', customoptionchema);