const { z } = require("zod");

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

const stringToBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    return value.toLowerCase() === "true";
  }
  return false;
};

const stringToNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
};

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

const familyMemberSchema = z.object({
  name: z
    .string({
      invalid_type_error: "Name must be a string",
    })
    .trim()
    .optional(),
  profession: z
    .string({
      invalid_type_error: "Profession must be a string",
    })
    .trim()
    .optional(),
  showOnPublicProfile: z
    .union([z.boolean(), z.string()])
    .transform(stringToBoolean)
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
    .transform(stringToBoolean)
    .optional()
    .default(false),
});

const createCelebratySchema = z.object({
  body: z.object({
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
          required_error: "Short info is required",
          invalid_type_error: "Short info must be a string",
        })
        .trim()
        .min(10, "Short info must be at least 10 characters")
        .max(500, "Short info must be less than 500 characters"),
      biography: z
        .string({
          required_error: "Biography is required",
          invalid_type_error: "Biography must be a string",
        })
        .trim()
        .min(1, "Biography is required"),
      status: z
        .enum(["Draft", "In Review", "Published", "Archived"], {
          invalid_type_error:
            "Status must be Draft, In Review, Published, or Archived",
        })
        .optional()
        .default("Draft"),
    }),

    personalDetails: z.object({
      dob: z
        .string({
          required_error: "Date of birth is required",
          invalid_type_error: "Date of birth must be a string",
        })
        .regex(
          /^\d{4}-\d{2}-\d{2}$/,
          "Date of birth must be in YYYY-MM-DD format"
        ),
      birthplace: z
        .string({
          invalid_type_error: "Birthplace must be a string",
        })
        .trim()
        .optional(),
      gender: z.enum(["Male", "Female", "Other", "Prefer not to say"], {
        required_error: "Gender is required",
        invalid_type_error:
          "Gender must be Male, Female, Other, or Prefer not to say",
      }),
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
    }),

    lifeStatus: z
      .object({
        isAlive: z
          .union([z.boolean(), z.string()])
          .transform(stringToBoolean)
          .optional()
          .default(true),
        dateOfDeath: z
          .string({
            invalid_type_error: "Date of death must be a string",
          })
          .regex(
            /^\d{4}-\d{2}-\d{2}$/,
            "Date of death must be in YYYY-MM-DD format"
          )
          .optional(),
        placeOfDeath: z
          .string({
            invalid_type_error: "Place of death must be a string",
          })
          .trim()
          .optional(),
        causeOfDeath: z
          .string({
            invalid_type_error: "Cause of death must be a string",
          })
          .trim()
          .optional(),
      })
      .optional(),

    familyRelationships: z
      .object({
        father: familyMemberSchema.optional(),
        mother: familyMemberSchema.optional(),
        spouses: z
          .union([
            z.string().transform(stringToArray),
            z.array(familyMemberSchema),
          ])
          .optional(),
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

    professionalIdentity: z.object({
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
        .optional()
        .default(true),
    }),

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

    socialLinks: z
      .union([
        z.string().transform(stringToArray),
        z.array(socialLinkSchema),
      ])
      .optional(),

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

      lifeStatus: z
        .object({
          isAlive: z
            .union([z.boolean(), z.string()])
            .transform(stringToBoolean)
            .optional(),
          dateOfDeath: z
            .string({
              invalid_type_error: "Date of death must be a string",
            })
            .regex(
              /^\d{4}-\d{2}-\d{2}$/,
              "Date of death must be in YYYY-MM-DD format"
            )
            .optional(),
          placeOfDeath: z
            .string({
              invalid_type_error: "Place of death must be a string",
            })
            .trim()
            .optional(),
          causeOfDeath: z
            .string({
              invalid_type_error: "Cause of death must be a string",
            })
            .trim()
            .optional(),
        })
        .optional(),

      familyRelationships: z
        .object({
          father: familyMemberSchema.optional(),
          mother: familyMemberSchema.optional(),
          spouses: z
            .union([
              z.string().transform(stringToArray),
              z.array(familyMemberSchema),
            ])
            .optional(),
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

      socialLinks: z
        .union([
          z.string().transform(stringToArray),
          z.array(socialLinkSchema),
        ])
        .optional(),

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

      oldGallery: z
        .union([z.string(), z.array(z.string())])
        .optional(),

      removeOldImage: z
        .union([z.string(), z.boolean()])
        .transform((val) => {
          if (typeof val === "boolean") return val;
          if (typeof val === "string") return val === "true";
          return false;
        })
        .optional(),

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
const updateFeaturedCelebratySchema = z.object({
  body: z.object({
    id: z
      .string({ required_error: "Celebrity ID is required" })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Celebrity ID format"),
    featured: z.union([z.literal(0), z.literal(1)], {
      required_error: "Featured is required",
      invalid_type_error: "Featured must be 0 (Inactive) or 1 (Active)",
    }),
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

const deleteCelebratySchema = z.object({
  params: z.object({
    id: z
      .string({
        required_error: "Celebrity ID is required",
      })
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid Celebrity ID format"),
  }),
});

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
      // ✅ Allow empty string, convert to undefined
      status: z
        .union([
          z.literal(""),
          z.literal("0"),
          z.literal("1"),
        ])
        .optional()
        .transform((val) => (val === "" || val === undefined ? undefined : Number(val))),
      // ✅ Allow empty string, convert to undefined
      moderationState: z
        .union([
          z.literal(""),
          z.literal("PENDING"),
          z.literal("PUBLISHED"),
          z.literal("REJECTED"),
          z.literal("ALL"),
        ])
        .optional()
        .transform((val) => (val === "" || val === undefined ? undefined : val)),
    })
    .optional(),
});

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
  updateFeaturedCelebratySchema,
};