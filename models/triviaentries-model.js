const { Schema, model } = require("mongoose");
const { moderationFields } = require("./schema/moderation-schema");

// ✅ Trivia Entries Schema
const triviaEntriesSchema = new Schema(
  {
    title: { 
      type: String, 
      required: [true, "Title is required"],
      trim: true
    },
    
    slug: { 
      type: String, 
      unique: true,
      lowercase: true,
      trim: true
    },
    
    description: { 
      type: String, 
      required: [true, "Description is required"],
      trim: true
    },

    // Category (linked from Trivia Types Master)
    categoryId: { 
      type: Schema.Types.ObjectId,
      ref: "triviaTypes", // or whatever your category model name is
      required: [true, "Category is required"]
    },
    
    categoryName: { 
      type: String,
      trim: true
    },

    // Optional fields
    media: { 
      type: String,
      trim: true
    },
    
    sourceLink: { 
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          if (!v) return true; // optional field
          return /^https?:\/\/.+/.test(v);
        },
        message: "Please provide a valid URL"
      }
    },
    
    celebrity: { 
      type: Schema.Types.ObjectId,
      ref: "Celebrity"
    },

    // Status
    status: { 
      type: Number, 
      default: 1,
      enum: [0, 1] // 0 = inactive, 1 = active
    },

    // System fields
    createdBy: { 
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    
    updatedBy: { 
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    // ✅ Moderation fields
    ...moderationFields
  },
  { 
    timestamps: true 
  }
);

// ✅ Index for faster queries
triviaEntriesSchema.index({ slug: 1 });
triviaEntriesSchema.index({ categoryId: 1 });
triviaEntriesSchema.index({ celebrityId: 1 });
triviaEntriesSchema.index({ status: 1 });
triviaEntriesSchema.index({ moderationState: 1 });

const TriviaEntries = model("TriviaEntries", triviaEntriesSchema);

module.exports = TriviaEntries;