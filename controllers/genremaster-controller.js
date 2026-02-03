const { GenreMaster } = require("../models/genremaster-model");
const createHttpError = require("http-errors");
const generateSlug = require("../utils/helper/slugHelper");

const addGenreMaster = async (req, res, next) => {
  try {
    const { name } = req.body;
    const createdBy = req.user.userId;

    const slug = generateSlug({ name });

    const existingName = await GenreMaster.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingName) {
      throw createHttpError(400, "Name already exist");
    }

    const existingSlug = await GenreMaster.findOne({ slug });
    if (existingSlug) {
      throw createHttpError(409, "Slug already exists");
    }

    const newGenreMaster = await GenreMaster.create({
      name,
      slug,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Genre created successfully",
      data: newGenreMaster,
    });
  } catch (error) {
    next(error);
  }
};

const getdataGenreMaster = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;

    let query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const genres = await GenreMaster.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await GenreMaster.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Genres retrieved successfully",
      data: genres,
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

const getGenreMasterByid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const genre = await GenreMaster.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!genre) {
      throw createHttpError(404, "Genre not found");
    }

    return res.status(200).json({
      success: true,
      message: "Genre retrieved successfully",
      data: genre,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const existingGenre = await GenreMaster.findById(id);
    if (!existingGenre) {
      throw createHttpError(404, "Genre not found");
    }

    const duplicate = await GenreMaster.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
      _id: { $ne: id },
    });

    if (duplicate) {
      throw createHttpError(400, "Name already exist");
    }

    const slug = generateSlug({ name });

    const slugConflict = await GenreMaster.findOne({
      slug: slug,
      _id: { $ne: id },
    });

    if (slugConflict) {
      throw createHttpError(409, "Generated slug already exists");
    }

    const updatedGenre = await GenreMaster.findByIdAndUpdate(
      id,
      { $set: { name, slug } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Genre updated successfully",
      data: updatedGenre,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatusCategory = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    const existingGenre = await GenreMaster.findById(id);
    if (!existingGenre) {
      throw createHttpError(404, "Genre not found");
    }

    const updatedGenre = await GenreMaster.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedGenre,
    });
  } catch (error) {
    next(error);
  }
};

const deleteGenreMaster = async (req, res, next) => {
  try {
    const { id } = req.params;

    const genre = await GenreMaster.findById(id);
    if (!genre) {
      throw createHttpError(404, "Genre not found");
    }

    await GenreMaster.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Genre deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

const categoryOptions = async (req, res, next) => {
  try {
    const genres = await GenreMaster.find({ status: 1 })
      .select("_id name slug")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Active genres retrieved successfully",
      data: genres,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addGenreMaster,
  getdataGenreMaster,
  getGenreMasterByid,
  updateCategory,
  deleteGenreMaster,
  categoryOptions,
  updateStatusCategory,
};