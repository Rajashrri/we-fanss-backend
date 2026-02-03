// Social Link Controller - Handles CRUD operations for social links including name, slug, and status management

const { SocialLink } = require("../models/sociallink-model");
const createHttpError = require("http-errors");
const  generateSlug  = require("../utils/helper/slugHelper");

const addSocialLink = async (req, res, next) => {
  try {
    const { name } = req.body;
    const createdBy = req.user.userId;

    const slug = generateSlug({ name });

    const existingName = await SocialLink.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingName) {
      throw createHttpError(400, "Name already exist");
    }

    const existingSlug = await SocialLink.findOne({ slug });
    if (existingSlug) {
      throw createHttpError(409, "Slug already exists");
    }

    const newSocialLink = await SocialLink.create({
      name,
      slug,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Social link created successfully",
      data: newSocialLink,
    });
  } catch (error) {
    next(error);
  }
};

const getdataSocialLink = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const socialLinks = await SocialLink.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await SocialLink.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Social links retrieved successfully",
      data: socialLinks,
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getSocialLinkByid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const socialLink = await SocialLink.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!socialLink) {
      throw createHttpError(404, "Social link not found");
    }

    return res.status(200).json({
      success: true,
      message: "Social link retrieved successfully",
      data: socialLink,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existingSocialLink = await SocialLink.findById(id);
    if (!existingSocialLink) {
      throw createHttpError(404, "Social link not found");
    }

    const duplicate = await SocialLink.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: id },
    });

    if (duplicate) {
      throw createHttpError(400, "Name already exist");
    }

    const slug = generateSlug({ name });

    const slugConflict = await SocialLink.findOne({
      slug: slug,
      _id: { $ne: id },
    });

    if (slugConflict) {
      throw createHttpError(409, "Generated slug already exists");
    }

    const updatedSocialLink = await SocialLink.findByIdAndUpdate(
      id,
      { $set: { name, slug } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Social link updated successfully",
      data: updatedSocialLink,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatusCategory = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    const existingSocialLink = await SocialLink.findById(id);
    if (!existingSocialLink) {
      throw createHttpError(404, "Social link not found");
    }

    const updatedSocialLink = await SocialLink.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedSocialLink,
    });
  } catch (error) {
    next(error);
  }
};

const deleteSocialLink = async (req, res, next) => {
  try {
    const { id } = req.params;

    const socialLink = await SocialLink.findById(id);
    if (!socialLink) {
      throw createHttpError(404, "Social link not found");
    }

    await SocialLink.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Social link deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const categoryOptions = async (req, res, next) => {
  try {
    const socialLinks = await SocialLink.find({ status: 1 })
      .select("_id name slug")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Active social links retrieved successfully",
      data: socialLinks,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addSocialLink,
  getdataSocialLink,
  getSocialLinkByid,
  updateCategory,
  deleteSocialLink,
  categoryOptions,
  updateStatusCategory,
};