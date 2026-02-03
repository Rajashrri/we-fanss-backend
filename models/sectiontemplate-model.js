const { Schema, model } = require("mongoose");

const sectiontemplateSchema = new Schema(
  {
    title: { 
      type: String, 
      required: true,
      trim: true,
     minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    sections: [
      {
        type: Schema.Types.ObjectId,
        ref: "SectionMaster", 
      },
    ],
    slug: { 
      type: String,
      trim: true,
      lowercase: true
    },
    status: { 
      type: Number,
      enum: [0, 1],
      default: 1
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  { 
    timestamps: true 
  }
);

const SectionTemplate = model('SectionTemplate', sectiontemplateSchema);

module.exports = { SectionTemplate };