const TriviaEntries = require("../models/triviaentries-model");
const TriviaTypes = require("../models/triviatypes-model");
const createHttpError = require("http-errors");
const fs = require("fs");
const path = require("path");
const generateSlug = require("../utils/helper/slugHelper");
const { MODERATION_STATES } = require("../models/schema/moderation-schema");

// ✅ Add Trivia Entry
const addtriviaentries = async (req, res, next) => {
  try {
    const { 
      title, 
      description, 
      categoryId, 
      categoryName, 
      sourceLink, 
      celebrity 
    } = req.body;

    const createdBy = req.user.userId; // ✅ From auth middleware

    if (!title || !categoryId) {
      throw createHttpError(400, "Title and Category are required");
    }

    if (!celebrity) {
      throw createHttpError(400, "Celebrity is required");
    }

    // ✅ Generate slug
    const finalSlug = generateSlug({ name: title });

    // ✅ Check for existing title
    const existingTitle = await TriviaEntries.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });

    if (existingTitle) {
      throw createHttpError(400, "Title already exists");
    }

    // ✅ Check for existing slug
    const existingSlug = await TriviaEntries.findOne({ slug: finalSlug });
    if (existingSlug) {
      throw createHttpError(409, "Slug already exists");
    }

    // ✅ Handle media upload
    const media = req.files?.["media"] ? req.files["media"][0].filename : "";

    // ✅ Create new trivia entry
    const newEntry = await TriviaEntries.create({
      title: title.trim(),
      slug: finalSlug,
      description: description?.trim(),
      categoryId,
      categoryName: categoryName?.trim(),
      media,
      sourceLink: sourceLink?.trim(),
      celebrity,
      createdBy,
      moderationState: MODERATION_STATES.PENDING,
      moderatedBy: null,
      moderatedAt: null,
      moderationRemark: null,
    });

    return res.status(201).json({
      success: true,
      message: "Trivia entry created successfully and sent for review",
      data: newEntry,
    });
  } catch (error) {
    next(error);
  }
};



// ✅ Get all trivia entries by celebrity
const getdatatriviaentries = async (req, res, next) => {
  try {
    const { celebrity } = req.params;
    const { page, limit, search, status, moderationState } = req.query;

    if (!celebrity) {
      throw createHttpError(400, "Celebrity is required");
    }

    let query = {
      celebrity: celebrity,
    };

    if (moderationState && moderationState !== "ALL") {
      query.moderationState = moderationState;
    }

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    if (status && status !== "ALL") {
      query.status = parseInt(status);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const triviaEntries = await TriviaEntries.find(query)
      .select({
        title: 1,
        slug: 1,
        description: 1,
        media: 1,
        categoryId: 1,
        categoryName: 1,
        sourceLink: 1,
        celebrity: 1,
        status: 1,
        moderationState: 1,
        moderatedBy: 1,
        moderatedAt: 1,
        moderationRemark: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .populate("celebrity", "identityProfile.name")
      .populate("categoryId", "name")
      .populate("createdBy", "name email")
      .populate("moderatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await TriviaEntries.countDocuments(query);

    const formattedData = triviaEntries.map((entry) => ({
      _id: entry._id,
      title: entry.title,
      slug: entry.slug,
      description: entry.description,
      media: entry.media,
      categoryId: entry.categoryId,
      categoryName: entry.categoryName,
      sourceLink: entry.sourceLink,
      celebrity: entry.celebrity,
      status: entry.status || 1,
      moderationState: entry.moderationState || "PENDING",
      moderatedBy: entry.moderatedBy || null,
      moderatedAt: entry.moderatedAt || null,
      moderationRemark: entry.moderationRemark || null,
      createdBy: entry.createdBy,
      createdAt: entry.createdAt,
      updatedAt: entry.updatedAt,
    }));

    // ✅ Moderation stats
    const pendingCount = await TriviaEntries.countDocuments({
      celebrity: celebrity,
      moderationState: "PENDING",
    });
    const publishedCount = await TriviaEntries.countDocuments({
      celebrity: celebrity,
      moderationState: "PUBLISHED",
    });
    const rejectedCount = await TriviaEntries.countDocuments({
      celebrity: celebrity,
      moderationState: "REJECTED",
    });

    return res.status(200).json({
      success: true,
      message: "Trivia entries retrieved successfully",
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
    next(error);
  }
};

// ✅ Get Trivia Entry by ID
const gettriviaentriesByid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entry = await TriviaEntries.findById(id)
      .populate("celebrity", "identityProfile.name")
      .populate("categoryId", "name")
      .populate("createdBy", "name email")
      .populate("moderatedBy", "name email");

    if (!entry) {
      throw createHttpError(404, "Trivia entry not found");
    }

    return res.status(200).json({
      success: true,
      message: "Trivia entry retrieved successfully",
      data: entry,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Update Trivia Entry
const updatetriviaentries = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      slug, 
      description, 
      categoryId, 
      categoryName, 
      sourceLink 
    } = req.body;

    const updatedBy = req.user.userId; // ✅ From auth middleware

    const existingEntry = await TriviaEntries.findById(id);
    if (!existingEntry) {
      throw createHttpError(404, "Trivia entry not found");
    }

    // ✅ Check for duplicate title
    if (title) {
      const duplicateTitle = await TriviaEntries.findOne({
        title: { $regex: new RegExp(`^${title}$`, "i") },
        _id: { $ne: id },
      });

      if (duplicateTitle) {
        throw createHttpError(400, "Title already exists");
      }
    }

    // ✅ Check for duplicate slug
    if (slug) {
      const duplicateSlug = await TriviaEntries.findOne({
        slug: { $regex: new RegExp(`^${slug}$`, "i") },
        _id: { $ne: id },
      });

      if (duplicateSlug) {
        throw createHttpError(409, "Slug already exists");
      }
    }

    const updateFields = {};
    if (title !== undefined) updateFields.title = title.trim();
    if (slug !== undefined) updateFields.slug = slug;
    if (description !== undefined) updateFields.description = description.trim();
    if (categoryId !== undefined) updateFields.categoryId = categoryId;
    if (categoryName !== undefined) updateFields.categoryName = categoryName.trim();
    if (sourceLink !== undefined) updateFields.sourceLink = sourceLink.trim();
    
    updateFields.updatedBy = updatedBy;

    // ✅ Handle media upload
    const newImageFile =
      (req.files && req.files.media && req.files.media[0]) || req.file;

    if (newImageFile) {
      if (existingEntry.media) {
        const oldPath = path.join(
          __dirname,
          "../public/triviaentries/",
          existingEntry.media
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateFields.media = newImageFile.filename;
    }

    // ✅ Reset moderation state
    updateFields.moderationState = "PENDING";
    updateFields.moderatedBy = null;
    updateFields.moderatedAt = null;
    updateFields.moderationRemark = null;

    const updatedEntry = await TriviaEntries.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Trivia entry updated successfully and sent for review",
      data: updatedEntry,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Update status (active/inactive)
const updateStatustriviaentries = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    if (!id) {
      throw createHttpError(400, "Trivia entry ID is required");
    }

    if (status === undefined || status === null) {
      throw createHttpError(400, "Status is required");
    }

    if (![0, 1].includes(Number(status))) {
      throw createHttpError(400, "Status must be 0 (inactive) or 1 (active)");
    }

    const existingEntry = await TriviaEntries.findById(id);
    if (!existingEntry) {
      throw createHttpError(404, "Trivia entry not found");
    }

    const updatedEntry = await TriviaEntries.findByIdAndUpdate(
      id,
      { $set: { status: Number(status) } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Trivia entry status updated successfully",
      data: updatedEntry,
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Delete Trivia Entry
const deletetriviaentries = async (req, res, next) => {
  try {
    const { id } = req.params;

    const entry = await TriviaEntries.findById(id);
    if (!entry) {
      throw createHttpError(404, "Trivia entry not found");
    }

    // ✅ Delete media file
    if (entry.media) {
      const mediaPath = path.join(
        __dirname,
        "../public/triviaentries/",
        entry.media
      );
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }

    await TriviaEntries.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Trivia entry deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addtriviaentries,
  getdatatriviaentries,
  gettriviaentriesByid,
  updatetriviaentries,
  updateStatustriviaentries,
  deletetriviaentries,
};