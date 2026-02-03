const { Schema, model } = require("mongoose");

const SectionMasterSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    slug: {
      type: String,
      required: [true, "Slug is required"],
      trim: true,
      unique: true,
      index: true,
    },

    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
      index: true,
    },

    layout: {
      type: String,
      trim: true,
    },

    isRepeater: {
      type: Boolean,
      default: false,
    },

    fieldsConfig: [
      {
        title: {
          type: String,
          required: [true, "Field title is required"],
          trim: true,
        },
        type: {
          type: String,
          required: [true, "Field type is required"],
          trim: true,
        },
        placeholder: {
          type: String,
          trim: true,
          default: null,
        },
        isRequired: {
          type: Boolean,
          default: false,
        },
        options: [
          {
            label: {
              type: String,
              trim: true,
            },
            value: {
              type: String,
              trim: true,
            },
          },
        ],
      },
    ],

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
  },
  {
    timestamps: true,
  },
);

module.exports = model("SectionMaster", SectionMasterSchema);
