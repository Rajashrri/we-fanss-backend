// celebraty-validation.js - FIXED VERSION

const { z } = require("zod");

// ========================================
// 🔧 HELPER FUNCTIONS
// ========================================
const stringToArray = (value) => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return value;
};

// ✅ STRING TO BOOLEAN CONVERTER
const stringToBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return false;
};

// ✅ STRING TO NUMBER CONVERTER
const stringToNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
};

// ========================================
// 🌐 SOCIAL LINK SCHEMA
// ========================================
const socialLinkSchema = z.object({
  platform: z
    .string({
      required_error: "Platform is required",
      invalid_type_error: "Platform must be a valid ID",
    })
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid platform ID format"),
  url: z
    .string({
      required_error: "URL is required",
      invalid_type_error: "URL must be a string",
    })
    .trim()
    .url("Invalid URL format"),
  label: z
    .string({
      invalid_type_error: "Label must be a string",
    })
    .trim()
    .optional(),
});

// ========================================
// 👨‍👩‍👧 FAMILY MEMBER SCHEMA
// ========================================
const familyMemberSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Name must be a string",
    })
    .trim()
    .optional(),
  showOnPublicProfile: z
    .union([z.boolean(), z.string()])
    .transform(stringToBoolean) // ✅ STRING → BOOLEAN
    .optional()
    .default(false),
});

const familyMemberWithRelationSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Name must be a string",
    })
    .trim()
    .optional(),
  relation: z
    .string({
      invalid_type_error: "Relation must be a string",
    })
    .trim()
    .optional(),
  showOnPublicProfile: z
    .union([z.boolean(), z.string()])
    .transform(stringToBoolean) // ✅ STRING → BOOLEAN
    .optional()
    .default(false),
});

// ========================================
// ✅ CREATE CELEBRITY SCHEMA
// ========================================
const createCelebratySchema = z.object({
  body: z.object({
    // A) Identity & Profile (Core)
    identityProfile: z.object({
      name: z
        .string({
          required_error: "Name is required",
          invalid_type_error: "Name must be a string",
        })
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(200, "Name must be less than 200 characters"),
      slug: z
        .string({
          invalid_type_error: "Slug must be a string",
        })
        .trim()
        .optional(),
      
      gallery: z
        .union([
          z.string().transform(stringToArray),
          z.array(z.string().trim()),
        ])
        .optional(),
      shortinfo: z
        .string({
          invalid_type_error: "Short info must be a string",
        })
        .trim()
        .min(10, "Short info must be at least 10 characters")
        .max(500, "Short info must be less than 500 characters")
        .optional(),
      biography: z
        .string({
          invalid_type_error: "Biography must be a string",
        })
        .trim()
        .optional(),
      status: z
        .enum(["Draft", "In Review", "Published", "Archived"], {
          invalid_type_error:
            "Status must be Draft, In Review, Published, or Archived",
        })
        .optional()
        .default("Draft"),
    }),

    // B) Personal Details
    personalDetails: z
      .object({
        dob: z
          .string({
            invalid_type_error: "Date of birth must be a string",
          })
          .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Date of birth must be in YYYY-MM-DD format"
          )
          .optional(),
        birthplace: z
          .string({
            invalid_type_error: "Birthplace must be a string",
          })
          .trim()
          .optional(),
        gender: z
          .enum(["Male", "Female", "Other", "Prefer not to say"], {
            invalid_type_error:
              "Gender must be Male, Female, Other, or Prefer not to say",
          })
          .optional(),
        nationality: z
          .string({
            invalid_type_error: "Nationality must be a string",
          })
          .trim()
          .optional(),
        religion: z
          .string({
            invalid_type_error: "Religion must be a string",
          })
          .trim()
          .optional(),
      })
      .optional(),

    // C) Family & Relationships
    familyRelationships: z
      .object({
        father: familyMemberSchema.optional(),
        mother: familyMemberSchema.optional(),
        spouse: familyMemberSchema.optional(),
        children: z
          .union([
            z.string().transform(stringToArray),
            z.array(familyMemberWithRelationSchema),
          ])
          .optional(),
        siblings: z
          .union([
            z.string().transform(stringToArray),
            z.array(familyMemberWithRelationSchema),
          ])
          .optional(),
      })
      .optional(),

    // D) Professional Identity
    professionalIdentity: z
      .object({
        sections: z
          .union([
            z.string().transform(stringToArray),
            z.array(
              z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, "Invalid section ID format")
            ),
          ])
          .optional(),
        professions: z
          .union([
            z.string().transform(stringToArray),
            z.array(
              z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, "Invalid profession ID format")
            ),
          ])
          .refine((arr) => arr && arr.length > 0, {
            message: "At least one profession is required",
          }),
        primaryProfession: z
          .string({
            required_error: "Primary profession is required",
            invalid_type_error: "Primary profession must be a valid ID",
          })
          .regex(/^[0-9a-fA-F]{24}$/, "Invalid primary profession ID format"),
        languages: z
          .union([
            z.string().transform(stringToArray),
            z.array(
              z
                .string()
                .regex(/^[0-9a-fA-F]{24}$/, "Invalid language ID format")
            ),
          ])
          .optional(),
        primaryLanguage: z
          .string({
            invalid_type_error: "Primary language must be a valid ID",
          })
          .regex(/^[0-9a-fA-F]{24}$/, "Invalid primary language ID format")
          .optional(),
        careerStartYear: z
          .union([z.number(), z.string()]) // ✅ STRING YA NUMBER DONO ACCEPT
          .transform(stringToNumber) // ✅ STRING → NUMBER
          .pipe(
            z
              .number({
                invalid_type_error: "Career start year must be a number",
              })
              .int()
              .min(1900, "Career start year must be after 1900")
              .max(
                new Date().getFullYear(),
                "Career start year cannot be in the future"
              )
          )
          .optional(),
        careerEndYear: z
          .union([z.number(), z.string()]) // ✅ STRING YA NUMBER DONO ACCEPT
          .transform(stringToNumber) // ✅ STRING → NUMBER
          .pipe(
            z
              .number({
                invalid_type_error: "Career end year must be a number",
              })
              .int()
              .min(1900, "Career end year must be after 1900")
              .max(
                new Date().getFullYear() + 10,
                "Career end year is too far in the future"
              )
          )
          .optional(),
        isCareerOngoing: z
          .union([z.boolean(), z.string()]) // ✅ STRING YA BOOLEAN DONO
          .transform(stringToBoolean) // ✅ STRING → BOOLEAN
          .optional()
          .default(true),
      })
      .optional(),

    // E) Location & Public Presence
    locationPresence: z
      .object({
        currentCity: z
          .string({
            invalid_type_error: "Current city must be a string",
          })
          .trim()
          .optional(),
        knownForRegion: z
          .union([
            z.string().transform(stringToArray),
            z.array(z.string().trim()),
          ])
          .optional(),
      })
      .optional(),

    // F) Physical & Public Attributes
    publicAttributes: z
      .object({
        height: z
          .string({
            invalid_type_error: "Height must be a string",
          })
          .trim()
          .optional(),
        signatureStyle: z
          .string({
            invalid_type_error: "Signature style must be a string",
          })
          .trim()
          .max(200, "Signature style must be less than 200 characters")
          .optional(),
      })
      .optional(),

    // G) Social Links
    socialLinks: z
      .union([
        z.string().transform(stringToArray),
        z.array(socialLinkSchema),
      ])
      .optional(),

    // H) SEO Metadata
    seoMetadata: z
      .object({
        tags: z
          .union([
            z.string().transform(stringToArray),
            z.array(z.string().trim()),
          ])
          .optional(),
        seoMetaTitle: z
          .string({
            invalid_type_error: "SEO meta title must be a string",
          })
          .trim()
          .max(60, "SEO meta title must be less than 60 characters")
          .optional(),
        seoMetaDescription: z
          .string({
            invalid_type_error: "SEO meta description must be a string",
          })
          .trim()
          .max(160, "SEO meta description must be less than 160 characters")
          .optional(),
        seoKeywords: z
          .union([
            z.string().transform(stringToArray),
            z.array(z.string().trim()),
          ])
          .optional(),
      })
      .optional(),

    // I) Admin Controls (Admin Only)
    adminControls: z
      .object({
        isFeatured: z
          .union([z.boolean(), z.string()]) // ✅ STRING YA BOOLEAN
          .transform(stringToBoolean) // ✅ STRING → BOOLEAN
          .optional(),
        verificationStatus: z
          .enum(["Not Claimed", "Claim Requested", "Verified"], {
            invalid_type_error:
              "Verification status must be Not Claimed, Claim Requested, or Verified",
          })
          .optional(),
        internalNotes: z
          .string({
            invalid_type_error: "Internal notes must be a string",
          })
          .trim()
          .optional(),
      })
      .optional(),
  }),
});


const updateCelebratySchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Celebrity ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Celebrity ID format"),
  }),
  body: z
    .object({
      // A) Identity & Profile (Core)
      identityProfile: z
        .object({
          name: z
            .string({
              invalid_type_error: "Name must be a string",
            })
            .trim()
            .min(2, "Name must be at least 2 characters")
            .max(200, "Name must be less than 200 characters")
            .optional(),
          slug: z
            .string({
              invalid_type_error: "Slug must be a string",
            })
            .trim()
            .optional(),
          image: z
            .string({
              invalid_type_error: "Image must be a string",
            })
            .trim()
            .optional(),
          gallery: z
            .union([
              z.string().transform(stringToArray),
              z.array(z.string().trim()),
            ])
            .optional(),
          shortinfo: z
            .string({
              invalid_type_error: "Short info must be a string",
            })
            .trim()
            .min(10, "Short info must be at least 10 characters")
            .max(500, "Short info must be less than 500 characters")
            .optional(),
          biography: z
            .string({
              invalid_type_error: "Biography must be a string",
            })
            .trim()
            .optional(),
          status: z
            .enum(["Draft", "In Review", "Published", "Archived"], {
              invalid_type_error:
                "Status must be Draft, In Review, Published, or Archived",
            })
            .optional(),
        })
        .optional(),

      // B) Personal Details
      personalDetails: z
        .object({
          dob: z
            .string({
              invalid_type_error: "Date of birth must be a string",
            })
            .regex(
              /^\d{4}-\d{2}-\d{2}$/,
              "Date of birth must be in YYYY-MM-DD format"
            )
            .optional(),
          birthplace: z
            .string({
              invalid_type_error: "Birthplace must be a string",
            })
            .trim()
            .optional(),
          gender: z
            .enum(["Male", "Female", "Other", "Prefer not to say"], {
              invalid_type_error:
                "Gender must be Male, Female, Other, or Prefer not to say",
            })
            .optional(),
          nationality: z
            .string({
              invalid_type_error: "Nationality must be a string",
            })
            .trim()
            .optional(),
          religion: z
            .string({
              invalid_type_error: "Religion must be a string",
            })
            .trim()
            .optional(),
        })
        .optional(),

      // C) Family & Relationships
      familyRelationships: z
        .object({
          father: familyMemberSchema.optional(),
          mother: familyMemberSchema.optional(),
          spouse: familyMemberSchema.optional(),
          children: z
            .union([
              z.string().transform(stringToArray),
              z.array(familyMemberWithRelationSchema),
            ])
            .optional(),
          siblings: z
            .union([
              z.string().transform(stringToArray),
              z.array(familyMemberWithRelationSchema),
            ])
            .optional(),
        })
        .optional(),

      // D) Professional Identity
      professionalIdentity: z
        .object({
          sections: z
            .union([
              z.string().transform(stringToArray),
              z.array(
                z
                  .string()
                  .regex(/^[0-9a-fA-F]{24}$/, "Invalid section ID format")
              ),
            ])
            .optional(),
          professions: z
            .union([
              z.string().transform(stringToArray),
              z.array(
                z
                  .string()
                  .regex(/^[0-9a-fA-F]{24}$/, "Invalid profession ID format")
              ),
            ])
            .optional(),
          primaryProfession: z
            .string({
              invalid_type_error: "Primary profession must be a valid ID",
            })
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid primary profession ID format")
            .optional(),
          languages: z
            .union([
              z.string().transform(stringToArray),
              z.array(
                z
                  .string()
                  .regex(/^[0-9a-fA-F]{24}$/, "Invalid language ID format")
              ),
            ])
            .optional(),
          primaryLanguage: z
            .string({
              invalid_type_error: "Primary language must be a valid ID",
            })
            .regex(/^[0-9a-fA-F]{24}$/, "Invalid primary language ID format")
            .optional(),
          careerStartYear: z
            .union([z.number(), z.string()])
            .transform(stringToNumber)
            .pipe(
              z
                .number({
                  invalid_type_error: "Career start year must be a number",
                })
                .int()
                .min(1900, "Career start year must be after 1900")
                .max(
                  new Date().getFullYear(),
                  "Career start year cannot be in the future"
                )
            )
            .optional(),
          careerEndYear: z
            .union([z.number(), z.string()])
            .transform(stringToNumber)
            .pipe(
              z
                .number({
                  invalid_type_error: "Career end year must be a number",
                })
                .int()
                .min(1900, "Career end year must be after 1900")
                .max(
                  new Date().getFullYear() + 10,
                  "Career end year is too far in the future"
                )
            )
            .optional(),
          isCareerOngoing: z
            .union([z.boolean(), z.string()])
            .transform(stringToBoolean)
            .optional(),
        })
        .optional(),

      // E) Location & Public Presence
      locationPresence: z
        .object({
          currentCity: z
            .string({
              invalid_type_error: "Current city must be a string",
            })
            .trim()
            .optional(),
          knownForRegion: z
            .union([
              z.string().transform(stringToArray),
              z.array(z.string().trim()),
            ])
            .optional(),
        })
        .optional(),

      // F) Physical & Public Attributes
      publicAttributes: z
        .object({
          height: z
            .string({
              invalid_type_error: "Height must be a string",
            })
            .trim()
            .optional(),
          signatureStyle: z
            .string({
              invalid_type_error: "Signature style must be a string",
            })
            .trim()
            .max(200, "Signature style must be less than 200 characters")
            .optional(),
        })
        .optional(),

      // G) Social Links
      socialLinks: z
        .union([
          z.string().transform(stringToArray),
          z.array(socialLinkSchema),
        ])
        .optional(),

      // H) SEO Metadata
      seoMetadata: z
        .object({
          tags: z
            .union([
              z.string().transform(stringToArray),
              z.array(z.string().trim()),
            ])
            .optional(),
          seoMetaTitle: z
            .string({
              invalid_type_error: "SEO meta title must be a string",
            })
            .trim()
            .max(60, "SEO meta title must be less than 60 characters")
            .optional(),
          seoMetaDescription: z
            .string({
              invalid_type_error: "SEO meta description must be a string",
            })
            .trim()
            .max(160, "SEO meta description must be less than 160 characters")
            .optional(),
          seoKeywords: z
            .union([
              z.string().transform(stringToArray),
              z.array(z.string().trim()),
            ])
            .optional(),
        })
        .optional(),

      // I) Admin Controls
      adminControls: z
        .object({
          isFeatured: z
            .union([z.boolean(), z.string()])
            .transform(stringToBoolean)
            .optional(),
          verificationStatus: z
            .enum(["Not Claimed", "Claim Requested", "Verified"], {
              invalid_type_error:
                "Verification status must be Not Claimed, Claim Requested, or Verified",
            })
            .optional(),
          internalNotes: z
            .string({
              invalid_type_error: "Internal notes must be a string",
            })
            .trim()
            .optional(),
        })
        .optional(),

      // ✅ FIXED - Legacy fields for backward compatibility
      oldGallery: z
        .union([
          z.string(),           // String format: "['/path1.jpg','/path2.jpg']"
          z.array(z.string()),  // Array format: ['/path1.jpg', '/path2.jpg']
        ])
        .optional(),
      
      removeOldImage: z
        .union([
          z.string(),           // "true" or "false"
          z.boolean(),          // true or false
        ])
        .transform((val) => {
          if (typeof val === 'boolean') return val;
          if (typeof val === 'string') return val === 'true';
          return false;
        })
        .optional(),
      
      // ✅ Root level status
      status: z
        .union([z.number(), z.string()])
        .transform(stringToNumber)
        .pipe(z.union([z.literal(0), z.literal(1)]))
        .optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});


const updateStatusCelebratySchema = z.object({
  body: z.object({
    id: z
      .string({ required_error: "Celebrity ID is required" })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Celebrity ID format"),

    status: z.union([z.literal(0), z.literal(1)], {
      required_error: "Status is required",
      invalid_type_error: "Status must be 0 (Inactive) or 1 (Active)",
    }),
  }),
});



const getCelebratyByIdSchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Celebrity ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Celebrity ID format"),
  }),
});

// ========================================
// 🗑️ DELETE CELEBRITY SCHEMA
// ========================================
const deleteCelebratySchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Celebrity ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Celebrity ID format"),
  }),
});

// ========================================
// 📋 GET ALL CELEBRITIES SCHEMA
// ========================================
const getAllCelebratySchema = z.object({
  query: z
    .object({
      page: z
        .string()
        .regex(/^\d+$/, "Page must be a positive number")
        .transform(Number)
        .optional(),
      limit: z
        .string()
        .regex(/^\d+$/, "Limit must be a positive number")
        .transform(Number)
        .optional(),
      search: z.string().trim().optional(),
      profession: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid profession ID format")
        .optional(),
      language: z
        .string()
        .regex(/^[0-9a-fA-F]{24}$/, "Invalid language ID format")
        .optional(),
      gender: z
        .enum(["Male", "Female", "Other", "Prefer not to say"])
        .optional(),
      status: z
        .enum(["Draft", "In Review", "Published", "Archived"])
        .optional(),
      isFeatured: z
        .string()
        .regex(/^(true|false)$/, "isFeatured must be true or false")
        .transform((val) => val === "true")
        .optional(),
      verificationStatus: z
        .enum(["Not Claimed", "Claim Requested", "Verified"])
        .optional(),
    })
    .optional(),
});

// ========================================
// 📑 GET CELEBRITY SECTIONS BY CELEB SCHEMA
// ========================================
const getCelebratySectionsByCelebSchema = z.object({
  params: z.object({
    celebratyId: z
      .string({
        required_error: "Celebrity ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Celebrity ID format"),
  }),
});

module.exports = {
  createCelebratySchema,
  updateCelebratySchema,
  updateStatusCelebratySchema,
  getCelebratyByIdSchema,
  deleteCelebratySchema,
  getAllCelebratySchema,
  getCelebratySectionsByCelebSchema,
};