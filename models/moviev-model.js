const { Schema, model } = require("mongoose");
const { moderationFields } = require("./schema/moderation-schema");

const movieSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Movie title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
      index: true,
    },

    slug: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },

    releaseYear: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\d{4}$/.test(v);
        },
        message: "Release year must be a 4-digit year (e.g., 2024)",
      },
    },

    releaseDate: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\d{4}-\d{2}-\d{2}$/.test(v);
        },
        message: "Release date must be in YYYY-MM-DD format",
      },
    },

    role: {
      type: String,
      trim: true,
      maxlength: [100, "Role cannot exceed 100 characters"],
    },

    genre: [
      {
        type: Schema.Types.ObjectId,
        ref: "genremmaster",
      },
    ],

    roleType: {
      type: String,
      trim: true,
      enum: {
        values: ["Lead", "Supporting", "Cameo", "Special Appearance", "Voice", ""],
        message: "{VALUE} is not a valid role type",
      },
    },

    sort: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\d+$/.test(v);
        },
        message: "Sort order must be a number",
      },
    },

    awards: {
      type: String,
      trim: true,
      maxlength: [500, "Awards cannot exceed 500 characters"],
    },

    celebrity: {
      type: Schema.Types.ObjectId,
      ref: "Celebrity",
      required: [true, "Celebrity ID is required"],
      index: true,
    },

    languages: [
      {
        type: Schema.Types.ObjectId,
        ref: "Language",
      },
    ],

    director: {
      type: String,
      trim: true,
      maxlength: [200, "Director name cannot exceed 200 characters"],
    },

    producer: {
      type: String,
      trim: true,
      maxlength: [200, "Producer name cannot exceed 200 characters"],
    },

    cast: {
      type: String,
      trim: true,
      maxlength: [500, "Cast cannot exceed 500 characters"],
    },

    notes: {
      type: String,
      trim: true,
      maxlength: [2000, "Notes cannot exceed 2000 characters"],
    },

    rating: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || (/^\d+(\.\d{1,2})?$/.test(v) && parseFloat(v) >= 0 && parseFloat(v) <= 10);
        },
        message: "Rating must be a number between 0 and 10",
      },
    },

    platformRating: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) {
          return !v || (/^\d+(\.\d{1,2})?$/.test(v) && parseFloat(v) >= 0 && parseFloat(v) <= 10);
        },
        message: "Platform rating must be a number between 0 and 10",
      },
    },

    image: {
      type: String,
      trim: true,
      maxlength: [500, "Image path cannot exceed 500 characters"],
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
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

    ...moderationFields,

    watchLinks: [
      {
        platform: {
          type: String,
          trim: true,
          required: [true, "Platform name is required for watch links"],
          minlength: [2, "Platform name must be at least 2 characters"],
          maxlength: [100, "Platform name cannot exceed 100 characters"],
        },
        url: {
          type: String,
          trim: true,
          required: [true, "URL is required for watch links"],
          maxlength: [500, "URL cannot exceed 500 characters"],
          validate: {
            validator: function(v) {
              return /^https?:\/\/.+/.test(v);
            },
            message: "URL must be a valid HTTP or HTTPS link",
          },
        },
        type: {
          type: String,
          trim: true,
          enum: {
            values: ["OTT", "Trailer", "Song", "Clip", ""],
            message: "{VALUE} is not a valid link type",
          },
        },
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Indexes for better query performance
movieSchema.index({ celebrity: 1, status: 1 });
movieSchema.index({ slug: 1 });
movieSchema.index({ releaseYear: -1 });
movieSchema.index({ moderationState: 1 });

const Movie = model("movie", movieSchema);
module.exports = { Movie };