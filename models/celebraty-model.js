const { Schema, model } = require("mongoose");
const {moderationFields} = require("../models/schema/moderation-schema")
const celebratySchema = new Schema(
  {
    identityProfile: {
      name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 200,
      },
      slug: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        index: true,
      },
      slugHistory: [
        {
          slug: {
            type: String,
            trim: true,
            lowercase: true,
          },
          changedAt: {
            type: Date,
            default: Date.now,
          },
          changedBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
          },
        },
      ],
      image: {
        type: String,
        trim: true,
      },
            categoryImage: { type: String, default: "" },

      gallery: [
        {
          type: String,
          trim: true,
        },
      ],
      shortinfo: {
        type: String,
        trim: true,
        minlength: 10,
        maxlength: 500,
      },
      biography: {
        type: String,
        trim: true,
      },
      status: {
        type: String,
        enum: ["Draft", "In Review", "Published", "Archived"],
        required: true,
        default: "Draft",
      },
    },

    personalDetails: {
      dob: {
        type: Date,
        required: true,
      },
      birthplace: {
        type: String,
        trim: true,
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other", "Prefer not to say"],
        required: true,
        trim: true,
      },
      nationality: {
        type: String,
        trim: true,
      },
      religion: {
        type: String,
        trim: true,
      },
    },

    lifeStatus: {
      isAlive: {
        type: Boolean,
        default: true,
        index: true,
      },
      dateOfDeath: {
        type: Date,
      },
      placeOfDeath: {
        type: String,
        trim: true,
      },
      causeOfDeath: {
        type: String,
        trim: true,
      },
    },

    familyRelationships: {
      father: {
        name: {
          type: String,
          trim: true,
        },
        showOnPublicProfile: {
          type: Boolean,
          default: false,
        },
      },
      mother: {
        name: {
          type: String,
          trim: true,
        },
        showOnPublicProfile: {
          type: Boolean,
          default: false,
        },
      },

      spouses: [
        {
          name: {
            type: String,
            trim: true,
          },
          profession: {
            type: String,
            trim: true,
          },
          showOnPublicProfile: {
            type: Boolean,
            default: false,
          },
        },
      ],
      children: [
        {
          name: {
            type: String,
            trim: true,
          },
          relation: {
            type: String,
            trim: true,
          },
          showOnPublicProfile: {
            type: Boolean,
            default: false,
          },
        },
      ],
      siblings: [
        {
          name: {
            type: String,
            trim: true,
          },
          relation: {
            type: String,
            trim: true,
          },
          showOnPublicProfile: {
            type: Boolean,
            default: false,
          },
        },
      ],
    },

    ...moderationFields,

    professionalIdentity: {
      sections: [
        {
          type: Schema.Types.ObjectId,
          ref: "SectionMaster",
        },
      ],
      professions: {
        type: [
          {
            type: Schema.Types.ObjectId,
            ref: "Profession",
          },
        ],
        required: true,
        validate: {
          validator: function (v) {
            return v && v.length > 0;
          },
          message: "At least one profession is required",
        },
      },
      primaryProfession: {
        type: Schema.Types.ObjectId,
        ref: "Profession",
      },
      languages: [
        {
          type: Schema.Types.ObjectId,
          ref: "Language",
        },
      ],
      primaryLanguage: {
        type: Schema.Types.ObjectId,
        ref: "Language",
      },
      careerStartYear: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear(),
      },
      careerEndYear: {
        type: Number,
        min: 1900,
        max: new Date().getFullYear() + 10,
      },
      isCareerOngoing: {
        type: Boolean,
        default: true,
      },
    },

    locationPresence: {
      currentCity: {
        type: String,
        trim: true,
      },
      knownForRegion: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    publicAttributes: {
      height: {
        type: String,
        trim: true,
      },
      signatureStyle: {
        type: String,
        trim: true,
        maxlength: 200,
      },
    },

    socialLinks: [
      {
        platform: {
          type: Schema.Types.ObjectId,
          ref: "SocialLink",
          required: true,
        },
        url: {
          type: String,
          trim: true,
          required: true,
        },
        label: {
          type: String,
          trim: true,
        },
      },
    ],

    seoMetadata: {
      tags: [
        {
          type: String,
          trim: true,
        },
      ],
      seoMetaTitle: {
        type: String,
        trim: true,
        maxlength: 60,
      },
      seoMetaDescription: {
        type: String,
        trim: true,
        maxlength: 160,
      },
      seoKeywords: [
        {
          type: String,
          trim: true,
        },
      ],
    },

    adminControls: {
      isFeatured: {
        type: Boolean,
        default: false,
      },
      verificationStatus: {
        type: String,
        enum: ["Not Claimed", "Claim Requested", "Verified"],
        default: "Not Claimed",
      },
      internalNotes: {
        type: String,
        trim: true,
      },
    },

    auditTrail: {
      createdBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      updatedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      approvedBy: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      publishedAt: {
        type: Date,
      },
    },

    rejectionReason: {
      type: String,
      trim: true,
    },

    status: {
      type: Number,
      enum: [0, 1],
      default: 1,
      index: true,
    },

    analyticsEngagement: {
      viewCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      followerCount: {
        type: Number,
        default: 0,
        min: 0,
      },
      popularityScore: {
        type: Number,
        default: 0,
        min: 0,
      },
      trendingScore: {
        type: Number,
        default: 0,
        min: 0,
      },
      searchBoostScore: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    profileQuality: {
      profileCompletionPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },
    },
  },
  {
    timestamps: true,
  },
);

celebratySchema.virtual("age").get(function () {
  if (!this.personalDetails?.dob) return null;

  const endDate =
    !this.lifeStatus?.isAlive && this.lifeStatus?.dateOfDeath
      ? new Date(this.lifeStatus.dateOfDeath)
      : new Date();

  const birthDate = new Date(this.personalDetails.dob);
  let age = endDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = endDate.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && endDate.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

celebratySchema.pre("save", async function (next) {
  if (this.isModified("identityProfile.slug") && !this.isNew) {
    try {
      const oldDoc = await this.constructor
        .findById(this._id)
        .select("identityProfile.slug");

      if (oldDoc && oldDoc.identityProfile.slug !== this.identityProfile.slug) {
        this.identityProfile.slugHistory.push({
          slug: oldDoc.identityProfile.slug,
          changedAt: new Date(),

          changedBy: this.auditTrail.updatedBy || null,
        });
      }
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

celebratySchema.pre("save", function (next) {
  if (this.lifeStatus && !this.lifeStatus.isAlive) {
    if (!this.personalDetails?.dob) {
      return next(
        new Error(
          "Date of birth is required when person is marked as deceased",
        ),
      );
    }

    if (!this.lifeStatus.dateOfDeath) {
      return next(
        new Error(
          "Date of death is required when person is marked as not alive",
        ),
      );
    }
    // Death date cannot be in the future
    if (this.lifeStatus.dateOfDeath > new Date()) {
      return next(new Error("Date of death cannot be in the future"));
    }
    // Death date should be after birth date
    if (
      this.personalDetails?.dob &&
      this.lifeStatus.dateOfDeath < this.personalDetails.dob
    ) {
      return next(new Error("Date of death cannot be before date of birth"));
    }
  }
  next();
});

celebratySchema.index({ "identityProfile.slug": 1 });
celebratySchema.index({ "identityProfile.status": 1 });
celebratySchema.index(
  { "identityProfile.slugHistory.slug": 1 },
  { sparse: true },
);
celebratySchema.index({ "adminControls.isFeatured": 1 });
celebratySchema.index({ "adminControls.verificationStatus": 1 });
celebratySchema.index({ "lifeStatus.isAlive": 1 });
celebratySchema.index({ createdAt: -1 });
celebratySchema.index({ "auditTrail.publishedAt": -1 });
celebratySchema.index({ "analyticsEngagement.popularityScore": -1 });
celebratySchema.index({ "analyticsEngagement.trendingScore": -1 });

celebratySchema.set("toJSON", { virtuals: true });
celebratySchema.set("toObject", { virtuals: true });

const Celebraty = model("Celebrity", celebratySchema);

module.exports = { Celebraty };
