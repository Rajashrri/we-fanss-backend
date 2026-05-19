// controllers/watch-controller.js

const Watch = require("../models/watch-model");
const createHttpError = require("http-errors");
const fs = require("fs");
const path = require("path");
const generateSlug = require("../utils/helper/slugHelper");

const {
  MODERATION_STATES,
} = require("../models/schema/moderation-schema");

/* ================= ADD WATCH ================= */

const addWatch = async (req, res, next) => {
  try {
    const {
      title,
      videoType,
      link,
      celebrity,
    } = req.body;

    const createdBy = req.user.userId;

    if (!title || !celebrity) {
      throw createHttpError(
        400,
        "Title and Celebrity are required"
      );
    }

    const finalSlug = generateSlug({
      name: title,
    });

    const existingTitle = await Watch.findOne({
      title: {
        $regex: new RegExp(`^${title}$`, "i"),
      },
    });

    if (existingTitle) {
      throw createHttpError(
        400,
        "Title already exists"
      );
    }

    const existingSlug = await Watch.findOne({
      slug: finalSlug,
    });

    if (existingSlug) {
      throw createHttpError(
        409,
        "Slug already exists"
      );
    }

    const thumbnail = req.files?.["thumbnail"]
      ? req.files["thumbnail"][0].filename
      : "";

    const newWatch = await Watch.create({
      title: title.trim(),
      slug: finalSlug,
      thumbnail,
      videoType,
      link,
      celebrity,
      createdBy,

      moderationState:
        MODERATION_STATES.PENDING,

      moderatedBy: null,
      moderatedAt: null,
      moderationRemark: null,
    });

    return res.status(201).json({
      success: true,
      message:
        "Watch created successfully and sent for review",
      data: newWatch,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= GET WATCH DATA ================= */

const getdata = async (req, res, next) => {
  try {
    const { celebrityId } = req.params;

    const {
      page,
      limit,
      search,
      status,
      moderationState,
    } = req.query;

    if (!celebrityId) {
      throw createHttpError(
        400,
        "Celebrity ID is required"
      );
    }

    let query = {
      celebrity: celebrityId,
    };

    if (
      moderationState &&
      moderationState !== "ALL"
    ) {
      query.moderationState =
        moderationState;
    }

    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    if (status && status !== "ALL") {
      query.status = parseInt(status);
    }

    const pageNum = parseInt(page) || 1;

    const limitNum = parseInt(limit) || 10;

    const skip = (pageNum - 1) * limitNum;

    const watches = await Watch.find(query)
      .select({
        title: 1,
        slug: 1,
        thumbnail: 1,
        videoType: 1,
        link: 1,
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
      .populate(
        "celebrity",
        "identityProfile.name"
      )
      .populate("createdBy", "name email")
      .populate(
        "moderatedBy",
        "name email"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total =
      await Watch.countDocuments(query);

    const formattedData = watches.map(
      (watch) => ({
        _id: watch._id,
        title: watch.title,
        slug: watch.slug,
        thumbnail: watch.thumbnail,
        videoType: watch.videoType,
        link: watch.link,
        celebrity: watch.celebrity,
        status: watch.status || 1,

        moderationState:
          watch.moderationState ||
          "PENDING",

        moderatedBy:
          watch.moderatedBy || null,

        moderatedAt:
          watch.moderatedAt || null,

        moderationRemark:
          watch.moderationRemark ||
          null,

        createdBy: watch.createdBy,
        createdAt: watch.createdAt,
        updatedAt: watch.updatedAt,
      })
    );

    const pendingCount =
      await Watch.countDocuments({
        celebrity: celebrityId,
        moderationState: "PENDING",
      });

    const publishedCount =
      await Watch.countDocuments({
        celebrity: celebrityId,
        moderationState: "PUBLISHED",
      });

    const rejectedCount =
      await Watch.countDocuments({
        celebrity: celebrityId,
        moderationState: "REJECTED",
      });

    return res.status(200).json({
      success: true,
      message:
        "Watch data retrieved successfully",

      data: formattedData,

      meta: {
        total,
        page: pageNum,
        limit: limitNum,

        totalPages: Math.ceil(
          total / limitNum
        ),

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

/* ================= GET WATCH BY ID ================= */

const getwatchByid = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const watch = await Watch.findById(id)
      .populate(
        "celebrity",
        "identityProfile.name"
      )
      .populate("createdBy", "name email")
      .populate(
        "moderatedBy",
        "name email"
      );

    if (!watch) {
      throw createHttpError(
        404,
        "Watch not found"
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Watch retrieved successfully",
      data: watch,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE WATCH ================= */

const updateWatch = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const {
      title,
      slug,
      videoType,
      link,
    } = req.body;

    const existingWatch =
      await Watch.findById(id);

    if (!existingWatch) {
      throw createHttpError(
        404,
        "Watch not found"
      );
    }

    if (title) {
      const duplicateTitle =
        await Watch.findOne({
          title: {
            $regex: new RegExp(
              `^${title}$`,
              "i"
            ),
          },
          _id: { $ne: id },
        });

      if (duplicateTitle) {
        throw createHttpError(
          400,
          "Title already exists"
        );
      }
    }

    if (slug) {
      const duplicateSlug =
        await Watch.findOne({
          slug: {
            $regex: new RegExp(
              `^${slug}$`,
              "i"
            ),
          },
          _id: { $ne: id },
        });

      if (duplicateSlug) {
        throw createHttpError(
          409,
          "Slug already exists"
        );
      }
    }

    const updateFields = {};

    if (title !== undefined) {
      updateFields.title = title.trim();
    }

    if (slug !== undefined) {
      updateFields.slug = slug;
    }

    if (videoType !== undefined) {
      updateFields.videoType =
        videoType;
    }

    if (link !== undefined) {
      updateFields.link = link;
    }

    const newThumbnail =
      (req.files &&
        req.files.thumbnail &&
        req.files.thumbnail[0]) ||
      req.file;

    if (newThumbnail) {
      if (existingWatch.thumbnail) {
        const oldPath = path.join(
          __dirname,
          "../public/watch/",
          existingWatch.thumbnail
        );

        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      updateFields.thumbnail =
        newThumbnail.filename;
    }

    updateFields.moderationState =
      "PENDING";

    updateFields.moderatedBy = null;

    updateFields.moderatedAt = null;

    updateFields.moderationRemark =
      null;

    const updatedWatch =
      await Watch.findByIdAndUpdate(
        id,
        { $set: updateFields },
        {
          new: true,
          runValidators: true,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Watch updated successfully and sent for review",

      data: updatedWatch,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE STATUS ================= */

const updateStatus = async (
  req,
  res,
  next
) => {
  try {
    const { id, status } = req.body;

    if (!id) {
      throw createHttpError(
        400,
        "Watch ID is required"
      );
    }

    if (
      status === undefined ||
      status === null
    ) {
      throw createHttpError(
        400,
        "Status is required"
      );
    }

    if (
      ![0, 1].includes(Number(status))
    ) {
      throw createHttpError(
        400,
        "Status must be 0 or 1"
      );
    }

    const existingWatch =
      await Watch.findById(id);

    if (!existingWatch) {
      throw createHttpError(
        404,
        "Watch not found"
      );
    }

    const updatedWatch =
      await Watch.findByIdAndUpdate(
        id,
        {
          $set: {
            status: Number(status),
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

    return res.status(200).json({
      success: true,
      message:
        "Watch status updated successfully",

      data: updatedWatch,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= DELETE WATCH ================= */

const deleteWatch = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const watch =
      await Watch.findById(id);

    if (!watch) {
      throw createHttpError(
        404,
        "Watch not found"
      );
    }

    if (watch.thumbnail) {
      const thumbnailPath = path.join(
        __dirname,
        "../public/watch/",
        watch.thumbnail
      );

      if (
        fs.existsSync(thumbnailPath)
      ) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    await Watch.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Watch deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addWatch,
  getdata,
  getwatchByid,
  updateWatch,
  updateStatus,
  deleteWatch,
};