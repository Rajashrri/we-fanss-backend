const { Schema, model } = require("mongoose");
const slugify = require("slugify")

const languageSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Language name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },

    code: {
      type: String,
      required: [true, 'Language code is required'],
      trim: true,
      uppercase: true, 
      minlength: [2, 'Code must be at least 2 characters'],
      maxlength: [10, 'Code cannot exceed 10 characters'],
      unique: true, 
      index: true 
    },

    slug: {
      type: String,
      trim: true,
      default: null
    },

    status: {
      type: Number, 
      enum: [0, 1], 
      default: 1,
      index: true 
    },

    createdBy: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: [true, 'Creator is required']
    }
  },
  {
    timestamps: true 
  }
);


languageSchema.statics.generateSlug = function ({ name, slug }) {
  if (slug && slug.trim()) {
    return slugify(slug.trim(), { lower: true, strict: true });
  }
  if (name && name.trim()) {
    return slugify(name.trim(), { lower: true, strict: true });
  }

  return undefined;
};

languageSchema.index({ name: 1 });

const Language = model('Language', languageSchema);

module.exports = { Language };