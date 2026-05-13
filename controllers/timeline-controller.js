const Timeline = require("../models/timeline-model");
const createHttpError = require("http-errors");
const fs = require("fs");
const path = require("path");
const generateSlug = require("../utils/helper/slugHelper");
const { MODERATION_STATES } = require("../models/schema/moderation-schema");

const addtimeline = async (req, res, next) => {
  try {
    const { title, description, fromYear, toYear, celebrity } = req.body;
    const createdBy = req.user.userId;

    if (!title || !celebrity) {
      throw createHttpError(400, "Title and Celebrity are required");
    }

    const finalSlug = generateSlug({ name: title });

    const existingTitle = await Timeline.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });

    if (existingTitle) {
      throw createHttpError(400, "Title already exists");
    }

    const existingSlug = await Timeline.findOne({ slug: finalSlug });
    if (existingSlug) {
      throw createHttpError(409, "Slug already exists");
    }

    const media = req.files?.["media"] ? req.files["media"][0].filename : "";

    const newTimeline = await Timeline.create({
      title: title.trim(),
      slug: finalSlug,
      description: description?.trim(),
      media,
      fromYear,
      toYear,
      celebrity,
      createdBy,
      moderationState: MODERATION_STATES.PENDING,
      moderatedBy: null,
      moderatedAt: null,
      moderationRemark: null,
    });

    return res.status(201).json({
      success: true,
      message: "Timeline created successfully and sent for review",
      data: newTimeline,
    });
  } catch (error) {
    next(error);
  }
};

const getdata = async (req, res, next) => {
  try {
    const { celebrityId } = req.params;
    const { page, limit, search, status, moderationState } = req.query;

    if (!celebrityId) {
      throw createHttpError(400, "Celebrity ID is required");
    }

    let query = {
      celebrity: celebrityId,
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

    const timelines = await Timeline.find(query)
      .select({
        title: 1,
        slug: 1,
        description: 1,
        media: 1,
        fromYear: 1,
        toYear: 1,
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
      .populate("createdBy", "name email")
      .populate("moderatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await Timeline.countDocuments(query);

    const formattedData = timelines.map((timeline) => ({
      _id: timeline._id,
      title: timeline.title,
      slug: timeline.slug,
      description: timeline.description,
      media: timeline.media,
      fromYear: timeline.fromYear,
      toYear: timeline.toYear,
      celebrity: timeline.celebrity,
      status: timeline.status || 1,
      moderationState: timeline.moderationState || "PENDING",
      moderatedBy: timeline.moderatedBy || null,
      moderatedAt: timeline.moderatedAt || null,
      moderationRemark: timeline.moderationRemark || null,
      createdBy: timeline.createdBy,
      createdAt: timeline.createdAt,
      updatedAt: timeline.updatedAt,
    }));

    const pendingCount = await Timeline.countDocuments({
      celebrity: celebrityId,
      moderationState: "PENDING",
    });
    const publishedCount = await Timeline.countDocuments({
      celebrity: celebrityId,
      moderationState: "PUBLISHED",
    });
    const rejectedCount = await Timeline.countDocuments({
      celebrity: celebrityId,
      moderationState: "REJECTED",
    });

    return res.status(200).json({
      success: true,
      message: "Timelines retrieved successfully",
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

const gettimelineByid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const timeline = await Timeline.findById(id)
      .populate("celebrity", "identityProfile.name")
      .populate("createdBy", "name email")
      .populate("moderatedBy", "name email");

    if (!timeline) {
      throw createHttpError(404, "Timeline not found");
    }

    return res.status(200).json({
      success: true,
      message: "Timeline retrieved successfully",
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};

const updatetimeline = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, slug, description,  from_year,
  to_year } = req.body;

    const existingTimeline = await Timeline.findById(id);
    if (!existingTimeline) {
      throw createHttpError(404, "Timeline not found");
    }

    if (title) {
      const duplicateTitle = await Timeline.findOne({
        title: { $regex: new RegExp(`^${title}$`, "i") },
        _id: { $ne: id },
      });

      if (duplicateTitle) {
        throw createHttpError(400, "Title already exists");
      }
    }

    if (slug) {
      const duplicateSlug = await Timeline.findOne({
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
   updateFields.fromYear = fromYear || from_year;
updateFields.toYear = toYear || to_year;
    const newImageFile =
      (req.files && req.files.media && req.files.media[0]) || req.file;

    if (newImageFile) {
      if (existingTimeline.media) {
        const oldPath = path.join(
          __dirname,
          "../public/timeline/",
          existingTimeline.media
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateFields.media = newImageFile.filename;
    }

    updateFields.moderationState = "PENDING";
    updateFields.moderatedBy = null;
    updateFields.moderatedAt = null;
    updateFields.moderationRemark = null;

    const updatedTimeline = await Timeline.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Timeline updated successfully and sent for review",
      data: updatedTimeline,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    if (!id) {
      throw createHttpError(400, "Timeline ID is required");
    }

    if (status === undefined || status === null) {
      throw createHttpError(400, "Status is required");
    }

    if (![0, 1].includes(Number(status))) {
      throw createHttpError(400, "Status must be 0 (inactive) or 1 (active)");
    }

    const existingTimeline = await Timeline.findById(id);
    if (!existingTimeline) {
      throw createHttpError(404, "Timeline not found");
    }

    const updatedTimeline = await Timeline.findByIdAndUpdate(
      id,
      { $set: { status: Number(status) } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Timeline status updated successfully",
      data: updatedTimeline,
    });
  } catch (error) {
    next(error);
  }
};

const deletetimeline = async (req, res, next) => {
  try {
    const { id } = req.params;

    const timeline = await Timeline.findById(id);
    if (!timeline) {
      throw createHttpError(404, "Timeline not found");
    }

    if (timeline.media) {
      const mediaPath = path.join(
        __dirname,
        "../public/timeline/",
        timeline.media
      );
      if (fs.existsSync(mediaPath)) {
        fs.unlinkSync(mediaPath);
      }
    }

    await Timeline.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Timeline deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addtimeline,
  getdata,
  gettimelineByid,
  updatetimeline,
  updateStatus,
  deletetimeline,
};