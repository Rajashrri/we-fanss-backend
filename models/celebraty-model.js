const { Schema, model } = require("mongoose");

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
      },
      birthplace: {
        type: String,
        trim: true,
      },
      gender: {
        type: String,
        enum: ["Male", "Female", "Other", "Prefer not to say"],
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
      spouse: {
        name: {
          type: String,
          trim: true,
        },
        showOnPublicProfile: {
          type: Boolean,
          default: false,
        },
      },
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

    // ========================================
    // 💼 D) PROFESSIONAL IDENTITY
    // ========================================
    professionalIdentity: {
      sections: [
        {
          type: Schema.Types.ObjectId,
          ref: "SectionMaster",
        },
      ],
      professions: [
        {
          type: Schema.Types.ObjectId,
          ref: "Profession",
          required: true,
        },
      ],
      primaryProfession: {
        type: Schema.Types.ObjectId,
        ref: "Profession",
        required: true,
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

    // ========================================
    // 📍 E) LOCATION & PUBLIC PRESENCE
    // ========================================
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

    // ========================================
    // ✨ F) PHYSICAL & PUBLIC ATTRIBUTES
    // ========================================
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

    // ========================================
    // 🌐 G) OFFICIAL LINKS & SOCIAL MEDIA
    // ========================================
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
          // For "Other" platform custom links
          type: String,
          trim: true,
        },
      },
    ],

    // ========================================
    // 🔍 H) EXTRA METADATA / TAGS (SEO)
    // ========================================
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

    // ========================================
    // 🟡 I) ADMIN-ONLY FIELDS
    // ========================================
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

    // ========================================
    // 🔒 J) SYSTEM FIELDS - AUDIT TRAIL
    // ========================================
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
  enum: [0,1],
  default: 1,
  index: true
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

    // ========================================
    // 🧮 M) SYSTEM FIELDS - PROFILE QUALITY
    // ========================================
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
    timestamps: true, // Auto-adds createdAt, updatedAt
  }
);

// ========================================
// 🧮 VIRTUAL FIELD - AGE (Auto-calculated from DOB)
// ========================================
celebratySchema.virtual("age").get(function () {
  if (!this.personalDetails?.dob) return null;
  const today = new Date();
  const birthDate = new Date(this.personalDetails.dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});

// ========================================
// 🪝 PRE-SAVE MIDDLEWARE - SLUG HISTORY TRACKING
// ========================================
celebratySchema.pre("save", function (next) {
  // Track slug changes
  if (this.isModified("identityProfile.slug") && !this.isNew) {
    // Get the old slug value before it changes
    this.constructor
      .findById(this._id)
      .then((oldDoc) => {
        if (oldDoc && oldDoc.identityProfile.slug !== this.identityProfile.slug) {
          // Add old slug to history
          this.identityProfile.slugHistory.push({
            slug: oldDoc.identityProfile.slug,
            changedAt: new Date(),
            changedBy: this.auditTrail.updatedBy,
          });
        }
        next();
      })
      .catch((err) => next(err));
  } else {
    next();
  }
});

// ========================================
// 📋 INDEXES FOR PERFORMANCE
// ========================================
celebratySchema.index({ "identityProfile.slug": 1 });
celebratySchema.index({ "identityProfile.status": 1 });
celebratySchema.index({ "identityProfile.slugHistory.slug": 1 }); // Index old slugs for redirects
celebratySchema.index({ "adminControls.isFeatured": 1 });
celebratySchema.index({ "adminControls.verificationStatus": 1 });
celebratySchema.index({ createdAt: -1 });
celebratySchema.index({ "auditTrail.publishedAt": -1 });
celebratySchema.index({ "analyticsEngagement.popularityScore": -1 });
celebratySchema.index({ "analyticsEngagement.trendingScore": -1 });

// ========================================
// ⚙️ ENABLE VIRTUALS IN JSON/OBJECT
// ========================================
celebratySchema.set("toJSON", { virtuals: true });
celebratySchema.set("toObject", { virtuals: true });

const Celebraty = model("Celebrity", celebratySchema);

module.exports = { Celebraty };