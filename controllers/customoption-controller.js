const CustomOption = require("../models/customoption-model");
const fs = require("fs");
const path = require("path");
const generateSlug = require("../utils/helper/slugHelper");
const createError = require("http-errors");
const { MODERATION_STATES } = require("../models/schema/moderation-schema");

const addcustomoption = async (req, res, next) => {
  try {
    const { title, description, celebrity } = req.body;
    const createdBy = req.user.userId;

        console.log("BODY:", req.body);

    if (!title) {
      throw createError(400, "Title is required");
    }

    const slug = generateSlug({ name: title });

    // Check if already exists
    const existingOption = await CustomOption.findOne({
      $or: [
        { title: { $regex: new RegExp(`^${title}$`, "i") } },
        { slug: slug }
      ],
    });

    if (existingOption) {
      throw createError(
        409,
        "Custom option already exists with this title or slug",
      );
    }

    const mediaFile = req.files?.["media"] ? req.files["media"][0] : null;

    let mediaData = undefined;
    if (mediaFile) {
      // Determine media type from mimetype
      const mediaType = mediaFile.mimetype.startsWith("video/")
        ? "video"
        : "image";

      mediaData = {
        path: `/custom-section/${mediaFile.filename}`,
        type: mediaType,
      };
    }

    const newCustomOption = await CustomOption.create({
      title: title.trim(),
      slug,
      description: description?.trim(),
      media: mediaData,
      celebrity,
      createdBy,
      moderationState: MODERATION_STATES.PENDING,
      moderatedBy: null,
      moderatedAt: null,
      moderationRemark: null,
    });

    return res.status(201).json({
      success: true,
      message: "Custom option created successfully and sent for review",
      data: newCustomOption,
    });
  } catch (error) {
    next(error);
  }
};

const getdata = async (req, res, next) => {
  try {
    const { celebrity } = req.params;
    const { page, limit, search, status, moderationState } = req.query;

    if (!celebrity) {
      throw createError(400, "Celebrity ID is required");
    }

    let query = {
      celebrity: celebrity,
    };

    // ✅ Fix: Properly handle moderationState filter
    if (moderationState && moderationState !== "ALL") {
      query.moderationState = moderationState;
    }

    // ✅ Fix: Handle search
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // ✅ Fix: Properly handle status (0 is valid, so check for null/undefined)
    if (status !== undefined && status !== null && status !== "ALL") {
      query.status = parseInt(status);
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const customOptions = await CustomOption.find(query)
      .select({
        title: 1,
        slug: 1,
        description: 1,
        media: 1,
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
      .populate("celebrity", "identityProfile.name identityProfile.image identityProfile.slug")
      .populate("createdBy", "name email")
      .populate("moderatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total = await CustomOption.countDocuments(query);

    const formattedData = customOptions.map((option) => ({
      _id: option._id,
      title: option.title,
      slug: option.slug,
      description: option.description,
      media: option.media,
      celebrity: option.celebrity,
      status: option.status !== undefined ? option.status : 1,
      moderationState: option.moderationState || "PENDING",
      moderatedBy: option.moderatedBy || null,
      moderatedAt: option.moderatedAt || null,
      moderationRemark: option.moderationRemark || null,
      createdBy: option.createdBy,
      createdAt: option.createdAt,
      updatedAt: option.updatedAt,
    }));

    // ✅ Moderation stats
    const pendingCount = await CustomOption.countDocuments({
      celebrity: celebrity,
      moderationState: "PENDING",
    });
    const publishedCount = await CustomOption.countDocuments({
      celebrity: celebrity,
      moderationState: "PUBLISHED",
    });
    const rejectedCount = await CustomOption.countDocuments({
      celebrity: celebrity,
      moderationState: "REJECTED",
    });

    return res.status(200).json({
      success: true,
      message: "Custom options retrieved successfully",
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

const getcustomoptionByid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customoption = await CustomOption.findById(id)
      .populate("celebrity", "identityProfile.name identityProfile.image identityProfile.slug")
      .populate("createdBy", "name email")
      .populate("moderatedBy", "name email");

    if (!customoption) {
      throw createError(404, "Custom option not found");
    }

    return res.status(200).json({
      success: true,
      message: "Custom option retrieved successfully",
      data: customoption,
    });
  } catch (error) {
    next(error);
  }
};

const updatecustomoption = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, celebrity } = req.body;

    const existingOption = await CustomOption.findById(id);
    if (!existingOption) {
      throw createError(404, "Custom option not found");
    }

    // Check for duplicates if title is being updated
    if (title) {
      const newSlug = generateSlug({ name: title });

      const duplicate = await CustomOption.findOne({
        $and: [
          { _id: { $ne: id } },
          {
            $or: [
              { title: { $regex: new RegExp(`^${title}$`, "i") } },
              { slug: newSlug }
            ],
          },
        ],
      });

      if (duplicate) {
        throw createError(
          409,
          "Custom option with this title or slug already exists",
        );
      }
    }

    const updateFields = {};
    if (title !== undefined) {
      updateFields.title = title.trim();
      updateFields.slug = generateSlug({ name: title });
    }
    if (description !== undefined) updateFields.description = description.trim();
    if (celebrity !== undefined) updateFields.celebrity = celebrity;

    const newImageFile =
      (req.files && req.files.media && req.files.media[0]) || req.file;

    if (newImageFile) {
      // Delete old media
      if (existingOption.media && existingOption.media.path) {
        const oldImageName = path.basename(existingOption.media.path);
        const oldPath = path.join(
          __dirname,
          "../public/custom-section/",
          oldImageName,
        );
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.error("❌ Failed to delete old media:", err);
          }
        }
      }

      // Determine media type from mimetype
      const mediaType = newImageFile.mimetype.startsWith("video/")
        ? "video"
        : "image";

      updateFields.media = {
        path: `/custom-section/${newImageFile.filename}`,
        type: mediaType,
      };
    }

    // ✅ Reset moderation state on update
    updateFields.moderationState = "PENDING";
    updateFields.moderatedBy = null;
    updateFields.moderatedAt = null;
    updateFields.moderationRemark = null;

    const updatedOption = await CustomOption.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Custom option updated successfully and sent for review",
      data: updatedOption,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    if (!id) {
      throw createError(400, "Custom option ID is required");
    }

    if (status === undefined || status === null) {
      throw createError(400, "Status is required");
    }

    if (![0, 1].includes(Number(status))) {
      throw createError(400, "Status must be 0 (inactive) or 1 (active)");
    }

    const existingOption = await CustomOption.findById(id);
    if (!existingOption) {
      throw createError(404, "Custom option not found");
    }

    const updatedOption = await CustomOption.findByIdAndUpdate(
      id,
      { $set: { status: Number(status) } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Custom option status updated successfully",
      data: updatedOption,
    });
  } catch (error) {
    next(error);
  }
};

const deletecustomoption = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customoption = await CustomOption.findById(id);
    if (!customoption) {
      throw createError(404, "Custom option not found");
    }

    // Delete media if exists
    if (customoption.media && customoption.media.path) {
      const mediaName = path.basename(customoption.media.path);
      const mediaPath = path.join(
        __dirname,
        "../public/custom-section/",
        mediaName,
      );
      if (fs.existsSync(mediaPath)) {
        try {
          fs.unlinkSync(mediaPath);
        } catch (err) {
          console.error("❌ Failed to delete media:", err);
        }
      }
    }

    await CustomOption.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Custom option deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addcustomoption,
  updateStatus,
  updatecustomoption,
  getdata,
  deletecustomoption,
  getcustomoptionByid,
};