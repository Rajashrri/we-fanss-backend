// controllers/read-controller.js

const Read = require("../models/read-model");
const createHttpError = require("http-errors");
const fs = require("fs");
const path = require("path");
const generateSlug = require("../utils/helper/slugHelper");

const {
  MODERATION_STATES,
} = require("../models/schema/moderation-schema");

/* ================= ADD READ ================= */

const addRead = async (req, res, next) => {
  try {
    const {
      title,
      shortIntro,
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

    const existingTitle = await Read.findOne({
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

    const existingSlug = await Read.findOne({
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

    const newRead = await Read.create({
      title: title.trim(),
      slug: finalSlug,
      thumbnail,
      shortIntro,
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
        "Read created successfully and sent for review",
      data: newRead,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= GET READ DATA ================= */

const getdata = async (req, res, next) => {
  try {
    const { celebrityId } = req.params;

    const {
      page,
      limit,
      search,
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

    // SEARCH
    if (search) {
      query.title = {
        $regex: search,
        $options: "i",
      };
    }

    const pageNum =
      parseInt(page) || 1;

    const limitNum =
      parseInt(limit) || 10;

    const skip =
      (pageNum - 1) * limitNum;

    const reads = await Read.find(query)
      .select({
        title: 1,
        slug: 1,
        thumbnail: 1,
        shortIntro: 1,
        link: 1,
        celebrity: 1,
        status: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .populate(
        "celebrity",
        "identityProfile.name"
      )
      .populate(
        "createdBy",
        "name email"
      )
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    const total =
      await Read.countDocuments(query);

    return res.status(200).json({
      success: true,
      message:
        "Read data retrieved successfully",

      data: reads,

      meta: {
        total,
        page: pageNum,
        limit: limitNum,

        totalPages: Math.ceil(
          total / limitNum
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

/* ================= GET READ BY ID ================= */

const getreadByid = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const read = await Read.findById(id)
      .populate(
        "celebrity",
        "identityProfile.name"
      )
      .populate("createdBy", "name email")
      .populate(
        "moderatedBy",
        "name email"
      );

    if (!read) {
      throw createHttpError(
        404,
        "Read not found"
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Read retrieved successfully",
      data: read,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE READ ================= */

const updateRead = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const {
      title,
      slug,
      shortIntro,
      link,
    } = req.body;

    const existingRead =
      await Read.findById(id);

    if (!existingRead) {
      throw createHttpError(
        404,
        "Read not found"
      );
    }

    if (title) {
      const duplicateTitle =
        await Read.findOne({
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
        await Read.findOne({
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

    if (shortIntro !== undefined) {
      updateFields.shortIntro =
        shortIntro;
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
      if (existingRead.thumbnail) {
        const oldPath = path.join(
          __dirname,
          "../public/read/",
          existingRead.thumbnail
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

    const updatedRead =
      await Read.findByIdAndUpdate(
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
        "Read updated successfully and sent for review",

      data: updatedRead,
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
        "Read ID is required"
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

    const existingRead =
      await Read.findById(id);

    if (!existingRead) {
      throw createHttpError(
        404,
        "Read not found"
      );
    }

    const updatedRead =
      await Read.findByIdAndUpdate(
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
        "Read status updated successfully",

      data: updatedRead,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= DELETE READ ================= */

const deleteRead = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const read =
      await Read.findById(id);

    if (!read) {
      throw createHttpError(
        404,
        "Read not found"
      );
    }

    if (read.thumbnail) {
      const thumbnailPath = path.join(
        __dirname,
        "../public/read/",
        read.thumbnail
      );

      if (
        fs.existsSync(thumbnailPath)
      ) {
        fs.unlinkSync(thumbnailPath);
      }
    }

    await Read.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message:
        "Read deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addRead,
  getdata,
  getreadByid,
  updateRead,
  updateStatus,
  deleteRead,
};