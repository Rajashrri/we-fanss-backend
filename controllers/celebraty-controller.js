const { Celebraty } = require("../models/celebraty-model");
const { Language } = require("../models/language-model");
const Professionalmaster = require("../models/professionalmaster-model");
const { SocialLink } = require("../models/sociallink-model");
const { Moviev } = require("../models/moviev-model");
const { Series } = require("../models/series-model");
const { Positions } = require("../models/positions-model");
const { Election } = require("../models/election-model");
const Timeline = require("../models/timeline-model");
const { Triviaentries } = require("../models/triviaentries-model");
const { SectionTemplate } = require("../models/sectiontemplate-model");
const SectionMaster = require("../models/sectionmaster-model");
const CelebratySection = require("../models/celebratysection-model");
const createHttpError = require("http-errors");
const generateSlug = require("../utils/helper/slugHelper");
const {
  syncCelebritySections,
} = require("../controllers/profession-controller");
const fs = require("fs");
const path = require("path");
const { PROJECT_ROOT } = require("../utils/upload");

/**
 * Get profession options for dropdown
 */
const professionsOptions = async (req, res, next) => {
  try {
    const professions = await Professionalmaster.find({ status: 1 });

    return res.status(200).json({
      success: true,
      message: "Professions retrieved successfully",
      data: professions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get language options for dropdown
 */
const languageOptions = async (req, res, next) => {
  try {
    const languages = await Language.find({ status: 1 });

    return res.status(200).json({
      success: true,
      message: "Languages retrieved successfully",
      data: languages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get social link options for dropdown
 */
const sociallist = async (req, res, next) => {
  try {
    const socialLinks = await SocialLink.find({ status: 1 });

    return res.status(200).json({
      success: true,
      message: "Social links retrieved successfully",
      data: socialLinks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get professions with section templates
 */
const getProfessions = async (req, res, next) => {
  try {
    const professions = await Professionalmaster.find(
      {},
      "_id name sectiontemplate",
    );

    return res.status(200).json({
      success: true,
      message: "Professions retrieved successfully",
      data: professions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get section templates
 */
const getSectionTemplates = async (req, res, next) => {
  try {
    const templates = await SectionTemplate.find({}, "_id title sections");

    return res.status(200).json({
      success: true,
      message: "Section templates retrieved successfully",
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get section masters
 */
const getSectionMasters = async (req, res, next) => {
  try {
    const sectionMasters = await SectionMaster.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Section masters retrieved successfully",
      data: sectionMasters,
    });
  } catch (error) {
    next(error);
  }
};

const { processCelebrityFiles } = require("../utils/upload");

const addcelebraty = async (req, res, next) => {
  try {
    const {
      identityProfile,
      personalDetails,
      lifeStatus,
      familyRelationships,
      professionalIdentity,
      locationPresence,
      publicAttributes,
      socialLinks,
      seoMetadata,
      adminControls,
    } = req.body;

    const createdBy = req.user.userId;

    if (!identityProfile?.name) {
      throw createHttpError(400, "Celebrity name is required");
    }

    const slug =
      identityProfile.slug || generateSlug({ name: identityProfile.name });

    const existing = await Celebraty.findOne({
      "identityProfile.name": new RegExp(`^${identityProfile.name}$`, "i"),
    });

    if (existing) {
      throw createHttpError(400, "Celebrity already exists");
    }

    // =========================
    // CREATE DOCUMENT FIRST
    // =========================
    const newCelebraty = await Celebraty.create({
      identityProfile: {
        name: identityProfile.name,
        slug,
        image: "",
        categoryImage: "",
        gallery: [],
      },

      personalDetails,
      lifeStatus,
      familyRelationships,
      professionalIdentity,
      locationPresence,
      publicAttributes,
      socialLinks,
      seoMetadata,
      adminControls,

      auditTrail: {
        createdBy,
        publishedAt: identityProfile.status === "Published" ? new Date() : null,
      },

      moderationState: "PENDING",
      status: 1,
    });

    const celebId = newCelebraty._id;

    // =========================
    // IMPORTANT FIX
    // =========================
    const { imagePath, categoryImagePath, galleryPaths } =
      processCelebrityFiles(req.files, celebId);

    const updateData = {};

    // /celebrity/profile/id.webp
    if (imagePath) {
      updateData["identityProfile.image"] = imagePath;
    }

    // /celebrity/categoryimage/id.webp
    if (categoryImagePath) {
      updateData["identityProfile.categoryImage"] = categoryImagePath;
    }

    // /celebrity/gallery/id-1.webp
    if (galleryPaths.length > 0) {
      updateData["identityProfile.gallery"] = galleryPaths;
    }

    if (Object.keys(updateData).length > 0) {
      await Celebraty.findByIdAndUpdate(celebId, {
        $set: updateData,
      });
    }

    const finalData = await Celebraty.findById(celebId);

    return res.status(201).json({
      success: true,
      message: "Celebrity created successfully",
      data: finalData,
    });
  } catch (error) {
    next(error);
  }
};

const getdata = async (req, res, next) => {
  try {
    const { page, limit, search, status, moderationState } = req.query;

    console.log("🔍 Query Params:", { status, moderationState, search }); // ✅ ADD THIS

    let query = {};

    // ✅ ADMIN PANEL: Show ALL moderation states by default
    if (moderationState && moderationState !== "ALL") {
      query.moderationState = moderationState;
    }

    // Search filter
    if (search) {
      query["identityProfile.name"] = { $regex: search, $options: "i" };
    }

    // Root level status filter (Active/Inactive) - if explicitly provided
    if (
      status !== undefined &&
      status !== null &&
      status !== "" &&
      status !== "ALL"
    ) {
      query.status = Number(status);
    }

    console.log("🔍 Final Query:", query); // ✅ ADD THIS TO SEE ACTUAL QUERY

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // ✅ Fetch minimal fields including moderation fields
    const celebrities = await Celebraty.find(query)
      .select({
        "identityProfile.name": 1,
        "identityProfile.image": 1,
        status: 1, // ✅ Make sure this is root level status
        moderationState: 1,
        moderatedBy: 1,
        moderatedAt: 1,
        moderationRemark: 1,
        "professionalIdentity.sections": 1,
        "professionalIdentity.professions": 1,
        _id: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .populate("professionalIdentity.sections", "name")
      .populate("professionalIdentity.professions", "name _id")
      .populate("moderatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    console.log("🔍 Found Celebrities:", celebrities.length); // ✅ ADD THIS
    console.log("🔍 First Celebrity Status:", celebrities[0]?.status); // ✅ ADD THIS

    const total = await Celebraty.countDocuments(query);

    // ✅ Format response with moderation data
    const formattedData = celebrities.map((celeb) => ({
      _id: celeb._id,
      name: celeb.identityProfile?.name || "N/A",
      image: celeb.identityProfile?.image || null,
      status: celeb.status !== undefined ? celeb.status : 1, // ✅ EXPLICIT CHECK
      moderationState: celeb.moderationState || "PENDING",
      moderatedBy: celeb.moderatedBy || null,
      moderatedAt: celeb.moderatedAt || null,
      moderationRemark: celeb.moderationRemark || null,
      sections: celeb.professionalIdentity?.sections || [],
      professions: celeb.professionalIdentity?.professions || [],
      createdAt: celeb.createdAt,
      updatedAt: celeb.updatedAt,
    }));

    // ✅ Count by moderation state for dashboard stats
    const pendingCount = await Celebraty.countDocuments({
      ...query,
      moderationState: "PENDING",
    });
    const publishedCount = await Celebraty.countDocuments({
      ...query,
      moderationState: "PUBLISHED",
    });
    const rejectedCount = await Celebraty.countDocuments({
      ...query,
      moderationState: "REJECTED",
    });

    return res.status(200).json({
      success: true,
      message: "Celebrities retrieved successfully",
      data: formattedData,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        moderationStats: {
          pending: pendingCount,
          published: publishedCount,
          rejected: rejectedCount,
        },
      },
    });
  } catch (error) {
    console.error("Get Celebrities Error:", error);
    next(error);
  }
};

/**
 * Get celebrity by ID
 */
const getcelebratyByid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const celebrity = await Celebraty.findById(id)
      .populate("professionalIdentity.professions", "name")
      .populate("professionalIdentity.primaryProfession", "name")
      .populate("professionalIdentity.languages", "name")
      .populate("professionalIdentity.primaryLanguage", "name")
      .populate("professionalIdentity.sections", "name")
      .populate("socialLinks.platform", "name")
      .populate("auditTrail.createdBy", "name email");

    if (!celebrity) {
      throw createHttpError(404, "Celebrity not found");
    }

    // Prepare response data with death information
    const responseData = {
      ...celebrity.toObject(),
      age: celebrity.age, // This will calculate age correctly based on death date if deceased
      lifeStatus: {
        isAlive: celebrity.lifeStatus?.isAlive ?? true,
        dateOfDeath: celebrity.lifeStatus?.dateOfDeath || null,
        placeOfDeath: celebrity.lifeStatus?.placeOfDeath || null,
        causeOfDeath: celebrity.lifeStatus?.causeOfDeath || null,
      },
    };

    return res.status(200).json({
      success: true,
      message: "Celebrity retrieved successfully",
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

const updatecelebraty = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log("Updating celebrity ID:", id);

    const {
      identityProfile,
      personalDetails,
      lifeStatus, // ✅ ADDED: Death/Life status fields
      familyRelationships,
      professionalIdentity,
      locationPresence,
      publicAttributes,
      socialLinks,
      seoMetadata,
      adminControls,
      status,
      oldGallery,
      removeOldImage,
      removeOldCategoryImage, // ✅ ADD
    } = req.body;

    // ==================== FIND EXISTING CELEBRITY ====================
    const existingCelebraty = await Celebraty.findById(id);
    if (!existingCelebraty) {
      throw createHttpError(404, "Celebrity not found");
    }

    // ==================== DUPLICATE CHECKS ====================
    if (identityProfile?.name) {
      const duplicateName = await Celebraty.findOne({
        "identityProfile.name": {
          $regex: new RegExp(`^${identityProfile.name}$`, "i"),
        },
        _id: { $ne: id },
      });
      if (duplicateName) {
        throw createHttpError(400, "Celebrity with this name already exists");
      }
    }

    if (identityProfile?.slug) {
      const duplicateSlug = await Celebraty.findOne({
        "identityProfile.slug": {
          $regex: new RegExp(`^${identityProfile.slug}$`, "i"),
        },
        _id: { $ne: id },
      });
      if (duplicateSlug) {
        throw createHttpError(409, "Slug already exists");
      }

      const existingInHistory = await Celebraty.findOne({
        "identityProfile.slugHistory.slug": identityProfile.slug,
        _id: { $ne: id },
      });
      if (existingInHistory) {
        throw createHttpError(409, "Slug conflicts with historical slug");
      }
    }

    // ✅ ==================== VALIDATE LIFE STATUS ====================
    if (lifeStatus) {
      // Convert string 'true'/'false' to boolean if needed
      const isAlive =
        lifeStatus.isAlive === "true" || lifeStatus.isAlive === true;

      console.log("=== Life Status Debug (Backend Update) ===");
      console.log("Received lifeStatus:", lifeStatus);
      console.log("isAlive (parsed):", isAlive);
      console.log("dateOfDeath:", lifeStatus.dateOfDeath);
      console.log("placeOfDeath:", lifeStatus.placeOfDeath);
      console.log("causeOfDeath:", lifeStatus.causeOfDeath);
      console.log("=========================================");

      // Validate death date is not in future
      if (!isAlive && lifeStatus.dateOfDeath) {
        const deathDate = new Date(lifeStatus.dateOfDeath);
        const today = new Date();
        if (deathDate > today) {
          throw createHttpError(400, "Date of death cannot be in the future");
        }

        // Validate death date is after birth date (if dob exists)
        const dobToCheck =
          personalDetails?.dob || existingCelebraty.personalDetails?.dob;
        if (dobToCheck) {
          const birthDate = new Date(dobToCheck);
          if (deathDate < birthDate) {
            throw createHttpError(
              400,
              "Date of death cannot be before date of birth",
            );
          }
        }
      }
    }

    // ==================== HANDLE FILE UPLOADS ====================
    let profileImage = existingCelebraty.identityProfile?.image;

    let categoryImage = existingCelebraty.identityProfile?.categoryImage || "";

    let mergedGallery = [];

    // ✅ STEP 1: Parse old gallery properly
    console.log("📦 oldGallery received:", oldGallery);
    console.log("📦 oldGallery type:", typeof oldGallery);

    if (oldGallery) {
      // ✅ Handle both string and array (after parseNestedFormData)
      if (typeof oldGallery === "string") {
        try {
          mergedGallery = JSON.parse(oldGallery);
          console.log("✅ Parsed oldGallery from string:", mergedGallery);
        } catch (error) {
          console.error("❌ Failed to parse oldGallery:", error);
          mergedGallery = [];
        }
      } else if (Array.isArray(oldGallery)) {
        mergedGallery = oldGallery;
        console.log("✅ oldGallery already array:", mergedGallery);
      } else {
        mergedGallery = [];
      }
    }

    // ✅ STEP 2: Handle profile image deletion/update
    if (removeOldImage === true || removeOldImage === "true") {
      if (existingCelebraty.identityProfile?.image) {
        const oldImagePath = path.join(
          __dirname,
          "../public",
          existingCelebraty.identityProfile.image.replace(/^\//, ""),
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("🗑️ Deleted old profile image");
        }
      }
      profileImage = "";
    }
    if (removeOldCategoryImage === true || removeOldCategoryImage === "true") {
      if (existingCelebraty.identityProfile?.categoryImage) {
        const oldCategoryPath = path.join(
          __dirname,
          "../public",
          existingCelebraty.identityProfile.categoryImage.replace(/^\//, ""),
        );

        if (fs.existsSync(oldCategoryPath)) {
          fs.unlinkSync(oldCategoryPath);
          console.log("🗑️ Deleted old category image");
        }
      }

      categoryImage = "";
    }

    // ✅ STEP 3: Process new uploaded files
    if (
      req.files &&
      (req.files.image || req.files.categoryimage || req.files.gallery)
    ) {
      console.log("📤 Processing new files...");

      const { imagePath, categoryImagePath, galleryPaths } =
        processCelebrityFiles(req.files, id);

      console.log("📸 New profile image:", imagePath);
      console.log("🖼️ New gallery images:", galleryPaths);

      // Delete old profile image if new one is uploaded
      if (imagePath && existingCelebraty.identityProfile?.image) {
        const oldImagePath = path.join(
          __dirname,
          "../public",
          existingCelebraty.identityProfile.image.replace(/^\//, ""),
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
          console.log("🗑️ Deleted old profile image (replaced with new)");
        }
        profileImage = imagePath;
      }

      if (
        categoryImagePath &&
        existingCelebraty.identityProfile?.categoryImage
      ) {
        const oldCategoryPath = path.join(
          __dirname,
          "../public",
          existingCelebraty.identityProfile.categoryImage.replace(/^\//, ""),
        );
        if (fs.existsSync(oldCategoryPath)) {
          fs.unlinkSync(oldCategoryPath);
          console.log("🗑️ Deleted old profile image (replaced with new)");
        }
        categoryImage = categoryImagePath;
      }

      // ✅ STEP 4: Append new gallery images to existing ones
      if (galleryPaths.length > 0) {
        mergedGallery = [...mergedGallery, ...galleryPaths];
        console.log("✅ Merged gallery (old + new):", mergedGallery);
      }
    }

    console.log("📊 Final gallery to save:", mergedGallery);

    // ==================== PARSE JSON FIELDS ====================
    const parsedProfessions =
      typeof professionalIdentity?.professions === "string"
        ? JSON.parse(professionalIdentity.professions)
        : professionalIdentity?.professions;

    const parsedLanguages =
      typeof professionalIdentity?.languages === "string"
        ? JSON.parse(professionalIdentity.languages)
        : professionalIdentity?.languages;

    const parsedSections =
      typeof professionalIdentity?.sections === "string"
        ? JSON.parse(professionalIdentity.sections)
        : professionalIdentity?.sections;

    const parsedSocialLinks =
      typeof socialLinks === "string" ? JSON.parse(socialLinks) : socialLinks;

    const parsedChildren =
      typeof familyRelationships?.children === "string"
        ? JSON.parse(familyRelationships.children)
        : familyRelationships?.children;

    const parsedSiblings =
      typeof familyRelationships?.siblings === "string"
        ? JSON.parse(familyRelationships.siblings)
        : familyRelationships?.siblings;

    const parsedSpouses =
      typeof familyRelationships?.spouses === "string"
        ? JSON.parse(familyRelationships.spouses)
        : familyRelationships?.spouses;

    // ==================== BUILD UPDATE OBJECT ====================
    const updateFields = {};

    // A) Identity Profile
    if (identityProfile) {
      if (identityProfile.name !== undefined)
        updateFields["identityProfile.name"] = identityProfile.name;

      // Slug history handling
      if (
        identityProfile.slug !== undefined &&
        identityProfile.slug !== existingCelebraty.identityProfile.slug
      ) {
        const slugHistoryEntry = {
          slug: existingCelebraty.identityProfile.slug,
          changedAt: new Date(),
          changedBy: req.user?.userId,
        };

        updateFields["identityProfile.slug"] = identityProfile.slug;
        updateFields["$push"] = {
          "identityProfile.slugHistory": slugHistoryEntry,
        };
      }

      if (identityProfile.shortinfo !== undefined)
        updateFields["identityProfile.shortinfo"] = identityProfile.shortinfo;
      if (identityProfile.biography !== undefined)
        updateFields["identityProfile.biography"] = identityProfile.biography;
      if (identityProfile.status !== undefined)
        updateFields["identityProfile.status"] = identityProfile.status;

      // ✅ Always update image and gallery
      updateFields["identityProfile.image"] = profileImage;
      updateFields["identityProfile.gallery"] = mergedGallery;
      updateFields["identityProfile.categoryImage"] = categoryImage; // ✅ ADD
    }

    // B) Personal Details
    if (personalDetails) {
      if (personalDetails.dob !== undefined)
        updateFields["personalDetails.dob"] = personalDetails.dob;
      if (personalDetails.birthplace !== undefined)
        updateFields["personalDetails.birthplace"] = personalDetails.birthplace;
      if (personalDetails.gender !== undefined)
        updateFields["personalDetails.gender"] = personalDetails.gender;
      if (personalDetails.nationality !== undefined)
        updateFields["personalDetails.nationality"] =
          personalDetails.nationality;
      if (personalDetails.religion !== undefined)
        updateFields["personalDetails.religion"] = personalDetails.religion;
    }

    // ✅ C) Life Status (NEW - Death/Alive status)
    if (lifeStatus) {
      // Convert string 'true'/'false' to boolean
      const isAlive =
        lifeStatus.isAlive === "true" || lifeStatus.isAlive === true;

      updateFields["lifeStatus.isAlive"] = isAlive;

      if (!isAlive) {
        // Only update death fields if person is not alive
        if (lifeStatus.dateOfDeath !== undefined) {
          updateFields["lifeStatus.dateOfDeath"] =
            lifeStatus.dateOfDeath || null;
        }
        if (lifeStatus.placeOfDeath !== undefined) {
          updateFields["lifeStatus.placeOfDeath"] =
            lifeStatus.placeOfDeath || "";
        }
        if (lifeStatus.causeOfDeath !== undefined) {
          updateFields["lifeStatus.causeOfDeath"] =
            lifeStatus.causeOfDeath || "";
        }
      } else {
        // If alive, clear death fields
        updateFields["lifeStatus.dateOfDeath"] = null;
        updateFields["lifeStatus.placeOfDeath"] = "";
        updateFields["lifeStatus.causeOfDeath"] = "";
      }

      console.log("✅ Life Status fields to update:", {
        isAlive: updateFields["lifeStatus.isAlive"],
        dateOfDeath: updateFields["lifeStatus.dateOfDeath"],
        placeOfDeath: updateFields["lifeStatus.placeOfDeath"],
        causeOfDeath: updateFields["lifeStatus.causeOfDeath"],
      });
    }

    // D) Family Relationships
    if (familyRelationships) {
      if (familyRelationships.father)
        updateFields["familyRelationships.father"] = familyRelationships.father;
      if (familyRelationships.mother)
        updateFields["familyRelationships.mother"] = familyRelationships.mother;
      if (parsedSpouses !== undefined)
        updateFields["familyRelationships.spouses"] = parsedSpouses;
      if (parsedChildren !== undefined)
        updateFields["familyRelationships.children"] = parsedChildren;
      if (parsedSiblings !== undefined)
        updateFields["familyRelationships.siblings"] = parsedSiblings;
    }

    // E) Professional Identity
    if (professionalIdentity) {
      if (parsedProfessions !== undefined)
        updateFields["professionalIdentity.professions"] = parsedProfessions;
      if (professionalIdentity.primaryProfession !== undefined)
        updateFields["professionalIdentity.primaryProfession"] =
          professionalIdentity.primaryProfession;
      if (parsedLanguages !== undefined)
        updateFields["professionalIdentity.languages"] = parsedLanguages;
      if (professionalIdentity.primaryLanguage !== undefined)
        updateFields["professionalIdentity.primaryLanguage"] =
          professionalIdentity.primaryLanguage;
      if (parsedSections !== undefined)
        updateFields["professionalIdentity.sections"] = parsedSections;
      if (professionalIdentity.careerStartYear !== undefined)
        updateFields["professionalIdentity.careerStartYear"] =
          professionalIdentity.careerStartYear;
      if (professionalIdentity.careerEndYear !== undefined)
        updateFields["professionalIdentity.careerEndYear"] =
          professionalIdentity.careerEndYear;
      if (professionalIdentity.isCareerOngoing !== undefined)
        updateFields["professionalIdentity.isCareerOngoing"] =
          professionalIdentity.isCareerOngoing;
    }

    // F) Location Presence
    if (locationPresence) {
      if (locationPresence.currentCity !== undefined)
        updateFields["locationPresence.currentCity"] =
          locationPresence.currentCity;
      if (locationPresence.knownForRegion !== undefined) {
        const parsedRegion =
          typeof locationPresence.knownForRegion === "string"
            ? JSON.parse(locationPresence.knownForRegion)
            : locationPresence.knownForRegion;
        updateFields["locationPresence.knownForRegion"] = parsedRegion;
      }
    }

    // G) Public Attributes
    if (publicAttributes) {
      if (publicAttributes.height !== undefined)
        updateFields["publicAttributes.height"] = publicAttributes.height;
      if (publicAttributes.signatureStyle !== undefined)
        updateFields["publicAttributes.signatureStyle"] =
          publicAttributes.signatureStyle;
    }

    // H) Social Links
    if (parsedSocialLinks !== undefined)
      updateFields["socialLinks"] = parsedSocialLinks;

    // I) SEO Metadata
    if (seoMetadata) {
      if (seoMetadata.tags !== undefined) {
        const parsedTags =
          typeof seoMetadata.tags === "string"
            ? JSON.parse(seoMetadata.tags)
            : seoMetadata.tags;
        updateFields["seoMetadata.tags"] = parsedTags;
      }
      if (seoMetadata.seoMetaTitle !== undefined)
        updateFields["seoMetadata.seoMetaTitle"] = seoMetadata.seoMetaTitle;
      if (seoMetadata.seoMetaDescription !== undefined)
        updateFields["seoMetadata.seoMetaDescription"] =
          seoMetadata.seoMetaDescription;
      if (seoMetadata.seoKeywords !== undefined) {
        const parsedKeywords =
          typeof seoMetadata.seoKeywords === "string"
            ? JSON.parse(seoMetadata.seoKeywords)
            : seoMetadata.seoKeywords;
        updateFields["seoMetadata.seoKeywords"] = parsedKeywords;
      }
    }

    // J) Admin Controls
    if (adminControls) {
      if (adminControls.isFeatured !== undefined)
        updateFields["adminControls.isFeatured"] = adminControls.isFeatured;
      if (adminControls.verificationStatus !== undefined)
        updateFields["adminControls.verificationStatus"] =
          adminControls.verificationStatus;
      if (adminControls.internalNotes !== undefined)
        updateFields["adminControls.internalNotes"] =
          adminControls.internalNotes;
    }

    // K) Root level status
    // K) Root level status
    if (status !== undefined) updateFields["status"] = status;

    // L) Update audit trail
    updateFields["auditTrail.updatedBy"] = req.user?.userId;

    // ✅ M) RESET MODERATION STATE TO PENDING (Content Moderation Flow)
    // When celebrity is updated, it goes back to review queue
    updateFields["moderationState"] = "PENDING";
    updateFields["moderatedBy"] = null;
    updateFields["moderatedAt"] = null;
    updateFields["moderationRemark"] = null;
    updateFields["auditTrail.approvedBy"] = null;
    updateFields["auditTrail.publishedAt"] = null;

    console.log("🔄 Moderation state reset to PENDING after update");

    // ==================== UPDATE CELEBRITY ====================
    const updateOperation = { $set: updateFields };

    if (updateFields["$push"]) {
      updateOperation.$push = updateFields["$push"];
      delete updateFields["$push"];
    }

    const updatedCelebraty = await Celebraty.findByIdAndUpdate(
      id,
      updateOperation,
      { new: true, runValidators: true },
    );

    console.log("✅ Celebrity updated successfully");
    console.log("✅ Life Status saved:", updatedCelebraty.lifeStatus);

    // ==================== SYNC SECTIONS ====================
    if (parsedProfessions && parsedProfessions.length > 0) {
      for (const professionId of parsedProfessions) {
        try {
          const profession = await Professionalmaster.findById(professionId);

          if (!profession) {
            console.log(`⚠️ Profession not found: ${professionId}`);
            continue;
          }

          if (
            profession.sectiontemplate &&
            profession.sectiontemplate.length > 0
          ) {
            await syncCelebritySections(
              professionId,
              profession.sectiontemplate,
              id,
            );
          }
        } catch (syncError) {
          console.error(
            `❌ Error syncing profession ${professionId}:`,
            syncError,
          );
        }
      }
    }

    // ==================== RESPONSE ====================
    const finalCelebrity = await Celebraty.findById(id)
      .populate("professionalIdentity.professions", "name")
      .populate("professionalIdentity.languages", "name")
      .populate("professionalIdentity.sections", "name")
      .populate("professionalIdentity.primaryProfession", "name")
      .populate("professionalIdentity.primaryLanguage", "name")
      .populate("socialLinks.platform", "name");

    return res.status(200).json({
      success: true,
      message: "Celebrity updated successfully",
      data: finalCelebrity,
    });
  } catch (error) {
    console.error("❌ Error in updatecelebraty:", error);
    next(error);
  }
};

/**
 * Update celebrity status (Active/Inactive at root level)
 */
const updateStatus = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    console.log(status);

    const existingCelebraty = await Celebraty.findById(id);
    if (!existingCelebraty) {
      throw createHttpError(404, "Celebrity not found");
    }

    // Update root level status
    const updatedCelebraty = await Celebraty.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true },
    );

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: {
        _id: updatedCelebraty._id,
        name: updatedCelebraty.identityProfile?.name,
        status: updatedCelebraty.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete celebrity
 */
const deletecelebraty = async (req, res, next) => {
  try {
    const { id } = req.params;

    const celebrity = await Celebraty.findById(id);
    if (!celebrity) {
      throw createHttpError(404, "Celebrity not found");
    }

    // Delete related data
    const deletedMovies = await Moviev.deleteMany({ celebrityId: id });
    const deletedSeries = await Series.deleteMany({ celebrityId: id });
    const deletedElection = await Election.deleteMany({ celebrityId: id });
    const deletedPositions = await Positions.deleteMany({ celebrityId: id });
    const deletedTimeline = await Timeline.deleteMany({ celebrityId: id });
    const deletedTrivia = await Triviaentries.deleteMany({ celebrityId: id });
    const deletedSections = await CelebratySection.deleteMany({
      celebratyId: id,
    });

    // Delete celebrity images
    if (celebrity.identityProfile?.image) {
      const imagePath = path.join(
        __dirname,
        "../public/celebrity",
        celebrity.identityProfile.image,
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    if (
      celebrity.identityProfile?.gallery &&
      celebrity.identityProfile.gallery.length > 0
    ) {
      celebrity.identityProfile.gallery.forEach((img) => {
        const imgPath = path.join(__dirname, "../public/celebrity", img);
        if (fs.existsSync(imgPath)) {
          fs.unlinkSync(imgPath);
        }
      });
    }

    // Delete the celebrity
    await Celebraty.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Celebrity and related data deleted successfully",
      data: {
        deletedMoviesCount: deletedMovies.deletedCount,
        deletedSeriesCount: deletedSeries.deletedCount,
        deletedElectionCount: deletedElection.deletedCount,
        deletedPositionsCount: deletedPositions.deletedCount,
        deletedTimelineCount: deletedTimeline.deletedCount,
        deletedTriviaCount: deletedTrivia.deletedCount,
        deletedSectionsCount: deletedSections.deletedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get celebrity sections by celebrity ID
 */
const getCelebratySectionsByCeleb = async (req, res, next) => {
  try {
    const { celebratyId } = req.params;

    const sections = await CelebratySection.find({ celebratyId })
      .populate("sectionmaster", "name")
      .lean();

    const formattedSections = sections.map((section) => ({
      ...section,
      sectionMasterName: section.sectionmaster?.name || null,
      sectionName: section.sectionName || null,
    }));

    return res.status(200).json({
      success: true,
      message: "Celebrity sections retrieved successfully",
      data: formattedSections,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addcelebraty,
  professionsOptions,
  languageOptions,
  updateStatus,
  updatecelebraty,
  getdata,
  deletecelebraty,
  getcelebratyByid,
  sociallist,
  getProfessions,
  getSectionTemplates,
  getSectionMasters,
  getCelebratySectionsByCeleb,
};
