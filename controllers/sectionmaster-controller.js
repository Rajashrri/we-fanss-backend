const SectionMaster = require("../models/sectionmaster-model");
const createHttpError = require("http-errors");
const generateSlug = require("../utils/helper/slugHelper");

const addsectionmaster = async (req, res, next) => {
  try {
    const { name, slug, layout, isRepeater, fieldsConfig } = req.body;
    const createdBy = req.user.userId;

    const finalSlug = slug || generateSlug({ name });

    const existingName = await SectionMaster.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingName) {
      throw createHttpError(400, "Name already exist");
    }

    const existingSlug = await SectionMaster.findOne({ slug: finalSlug });
    if (existingSlug) {
      throw createHttpError(409, "Slug already exists");
    }

    const newSectionMaster = await SectionMaster.create({
      name,
      slug: finalSlug,
      layout,
      isRepeater,
      fieldsConfig,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Section master created successfully",
      data: newSectionMaster,
    });
  } catch (error) {
    next(error);
  }
};

const getdata = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const sectionMasters = await SectionMaster.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await SectionMaster.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Section masters retrieved successfully",
      data: sectionMasters,
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

const getsectionmasterByid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sectionMaster = await SectionMaster.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!sectionMaster) {
      throw createHttpError(404, "Section master not found");
    }

    return res.status(200).json({
      success: true,
      message: "Section master retrieved successfully",
      data: sectionMaster,
    });
  } catch (error) {
    next(error);
  }
};

const updatesectionmaster = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug, layout, isRepeater, fieldsConfig } = req.body;

    const existingSectionMaster = await SectionMaster.findById(id);
    if (!existingSectionMaster) {
      throw createHttpError(404, "Section master not found");
    }

    if (name) {
      const duplicateName = await SectionMaster.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (duplicateName) {
        throw createHttpError(400, "Name already exist");
      }
    }

    if (slug) {
      const duplicateSlug = await SectionMaster.findOne({
        slug: { $regex: new RegExp(`^${slug}$`, "i") },
        _id: { $ne: id },
      });

      if (duplicateSlug) {
        throw createHttpError(409, "Slug already exists");
      }
    }

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (slug !== undefined) updateFields.slug = slug;
    if (layout !== undefined) updateFields.layout = layout;
    if (isRepeater !== undefined) updateFields.isRepeater = isRepeater;
    if (fieldsConfig !== undefined) updateFields.fieldsConfig = fieldsConfig;

    const updatedSectionMaster = await SectionMaster.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section master updated successfully",
      data: updatedSectionMaster,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    const existingSectionMaster = await SectionMaster.findById(id);
    if (!existingSectionMaster) {
      throw createHttpError(404, "Section master not found");
    }

    const updatedSectionMaster = await SectionMaster.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedSectionMaster,
    });
  } catch (error) {
    next(error);
  }
};

const deletesectionmaster = async (req, res, next) => {
  try {
    const { id } = req.params;

    const sectionMaster = await SectionMaster.findById(id);
    if (!sectionMaster) {
      throw createHttpError(404, "Section master not found");
    }

    await SectionMaster.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Section master deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addsectionmaster,
  getdata,
  getsectionmasterByid,
  updatesectionmaster,
  updateStatus,
  deletesectionmaster,
};