// controllers/listen-controller.js

const Listen = require("../models/listen-model");
const createHttpError = require("http-errors");
const fs = require("fs");
const path = require("path");
const generateSlug = require("../utils/helper/slugHelper");

const {
  MODERATION_STATES,
} = require("../models/schema/moderation-schema");

/* ================= ADD LISTEN ================= */

const addListen = async (
  req,
  res,
  next
) => {
  try {
    const {
      title,
      videoLink,
      noOfHours,
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

    const existingTitle =
      await Listen.findOne({
        title: {
          $regex: new RegExp(
            `^${title}$`,
            "i"
          ),
        },
      });

    if (existingTitle) {
      throw createHttpError(
        400,
        "Title already exists"
      );
    }

    const existingSlug =
      await Listen.findOne({
        slug: finalSlug,
      });

    if (existingSlug) {
      throw createHttpError(
        409,
        "Slug already exists"
      );
    }

    const thumbnail = req.files?.[
      "thumbnail"
    ]
      ? req.files["thumbnail"][0]
          .filename
      : "";

    const newListen =
      await Listen.create({
        title: title.trim(),
        slug: finalSlug,
        thumbnail,
        videoLink,
        noOfHours,
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
        "Listen created successfully and sent for review",

      data: newListen,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= GET LISTEN DATA ================= */

const getdata = async (
  req,
  res,
  next
) => {
  try {
    const { celebrityId } =
      req.params;

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

    /* SEARCH */
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

    const listens =
      await Listen.find(query)
        .select({
          title: 1,
          slug: 1,
          thumbnail: 1,
          videoLink: 1,
          noOfHours: 1,
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
      await Listen.countDocuments(
        query
      );

    return res.status(200).json({
      success: true,
      message:
        "Listen data retrieved successfully",

      data: listens,

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

/* ================= GET LISTEN BY ID ================= */

const getlistenByid = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const listen =
      await Listen.findById(id)
        .populate(
          "celebrity",
          "identityProfile.name"
        )
        .populate(
          "createdBy",
          "name email"
        )
        .populate(
          "moderatedBy",
          "name email"
        );

    if (!listen) {
      throw createHttpError(
        404,
        "Listen not found"
      );
    }

    return res.status(200).json({
      success: true,
      message:
        "Listen retrieved successfully",

      data: listen,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= UPDATE LISTEN ================= */

const updateListen = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const {
      title,
      slug,
      videoLink,
      noOfHours,
      link,
    } = req.body;

    const existingListen =
      await Listen.findById(id);

    if (!existingListen) {
      throw createHttpError(
        404,
        "Listen not found"
      );
    }

    if (title) {
      const duplicateTitle =
        await Listen.findOne({
          title: {
            $regex:
              new RegExp(
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
        await Listen.findOne({
          slug: {
            $regex:
              new RegExp(
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
      updateFields.title =
        title.trim();
    }

    if (slug !== undefined) {
      updateFields.slug = slug;
    }

    if (
      videoLink !== undefined
    ) {
      updateFields.videoLink =
        videoLink;
    }

    if (
      noOfHours !== undefined
    ) {
      updateFields.noOfHours =
        noOfHours;
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
      if (
        existingListen.thumbnail
      ) {
        const oldPath =
          path.join(
            __dirname,
            "../public/listen/",
            existingListen.thumbnail
          );

        if (
          fs.existsSync(oldPath)
        ) {
          fs.unlinkSync(oldPath);
        }
      }

      updateFields.thumbnail =
        newThumbnail.filename;
    }

    updateFields.moderationState =
      "PENDING";

    updateFields.moderatedBy =
      null;

    updateFields.moderatedAt =
      null;

    updateFields.moderationRemark =
      null;

    const updatedListen =
      await Listen.findByIdAndUpdate(
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
        "Listen updated successfully and sent for review",

      data: updatedListen,
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
    const { id, status } =
      req.body;

    if (!id) {
      throw createHttpError(
        400,
        "Listen ID is required"
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
      ![0, 1].includes(
        Number(status)
      )
    ) {
      throw createHttpError(
        400,
        "Status must be 0 or 1"
      );
    }

    const existingListen =
      await Listen.findById(id);

    if (!existingListen) {
      throw createHttpError(
        404,
        "Listen not found"
      );
    }

    const updatedListen =
      await Listen.findByIdAndUpdate(
        id,
        {
          $set: {
            status:
              Number(status),
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
        "Listen status updated successfully",

      data: updatedListen,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= DELETE LISTEN ================= */

const deleteListen = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;

    const listen =
      await Listen.findById(id);

    if (!listen) {
      throw createHttpError(
        404,
        "Listen not found"
      );
    }

    if (listen.thumbnail) {
      const thumbnailPath =
        path.join(
          __dirname,
          "../public/listen/",
          listen.thumbnail
        );

      if (
        fs.existsSync(
          thumbnailPath
        )
      ) {
        fs.unlinkSync(
          thumbnailPath
        );
      }
    }

    await Listen.findByIdAndDelete(
      id
    );

    return res.status(200).json({
      success: true,
      message:
        "Listen deleted successfully",

      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addListen,
  getdata,
  getlistenByid,
  updateListen,
  updateStatus,
  deleteListen,
};