const { Schema, model } = require("mongoose");
const slugify = require("slugify");

const professionalMasterSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Profession name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
      index: true,
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    url: {
      type: String,
      trim: true,
      default: "",
    },

    imagePath: {  
      type: String,
      trim: true,
      default: "",
    },

    status: {
      type: Number,
      enum: {
        values: [0, 1],
        message: "Status must be either 0 (inactive) or 1 (active)",
      },
      default: 1,
      index: true,
    },

    sectiontemplate: [
      {
        type: Schema.Types.ObjectId,
        ref: "SectionTemplate",
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true, 
    versionKey: false,
  },
);


professionalMasterSchema.statics.generateSlug = function ({ name, slug }) {
  if (slug && slug.trim()) {
    return slugify(slug.trim(), { lower: true, strict: true });
  }

  if (name && name.trim()) {
    return slugify(name.trim(), { lower: true, strict: true });
  }

  return undefined;
};

// Indexes
professionalMasterSchema.index({ name: 1, status: 1 });
professionalMasterSchema.index({ slug: 1 }, { unique: true });

const Professionalmaster = model(
  "Profession",
  professionalMasterSchema,
);

module.exports = Professionalmaster;