const { TriviaTypes } = require("../models/triviatypes-model");
const createHttpError = require("http-errors");


const addTriviaTypes = async (req, res, next) => {
  try {
    const { name } = req.body;
    const createdBy = req.user.userId; 

    
    const slug = TriviaTypes.generateSlug({ name });

    
    const existingName = await TriviaTypes.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingName) {
      throw createHttpError(400, "Name already exist");
    }

    
    const existingSlug = await TriviaTypes.findOne({ slug });
    if (existingSlug) {
      throw createHttpError(409, "Slug already exists");
    }

   
    const newTriviaType = await TriviaTypes.create({
      name,
      slug,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Trivia type created successfully",
      data: newTriviaType,
    });
  } catch (error) {
    next(error);
  }
};


const getdataTriviaTypes = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;

    let query = {};

  
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

   
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const triviaTypes = await TriviaTypes.find(query)
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await TriviaTypes.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Trivia types retrieved successfully",
      data: triviaTypes,
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


const getTriviaTypesByid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const triviaType = await TriviaTypes.findById(id).populate(
      "createdBy",
      "name email"
    );

    if (!triviaType) {
      throw createHttpError(404, "Trivia type not found");
    }

    return res.status(200).json({
      success: true,
      message: "Trivia type retrieved successfully",
      data: triviaType,
    });
  } catch (error) {
    next(error);
  }
};


const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, status } = req.body;

    
    const existingTriviaType = await TriviaTypes.findById(id);
    if (!existingTriviaType) {
      throw createHttpError(404, "Trivia type not found");
    }

    const updateData = {};

    
    if (name) {
      
      const duplicate = await TriviaTypes.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (duplicate) {
        throw createHttpError(400, "Name already exist");
      }

      updateData.name = name;
      updateData.slug = TriviaTypes.generateSlug({ name });

      
      const slugConflict = await TriviaTypes.findOne({
        slug: updateData.slug,
        _id: { $ne: id },
      });

      if (slugConflict) {
        throw createHttpError(409, "Generated slug already exists");
      }
    }

    
    if (status !== undefined) {
      updateData.status = status;
    }

    
    const updatedTriviaType = await TriviaTypes.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Trivia type updated successfully",
      data: updatedTriviaType,
    });
  } catch (error) {
    next(error);
  }
};


const updateStatusCategory = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    
    const existingTriviaType = await TriviaTypes.findById(id);
    if (!existingTriviaType) {
      throw createHttpError(404, "Trivia type not found");
    }

   
    const updatedTriviaType = await TriviaTypes.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedTriviaType,
    });
  } catch (error) {
    next(error);
  }
};


const deleteTriviaTypes = async (req, res, next) => {
  try {
    const { id } = req.params;

    
    const triviaType = await TriviaTypes.findById(id);
    if (!triviaType) {
      throw createHttpError(404, "Trivia type not found");
    }

    // ✅ Delete the trivia type
    await TriviaTypes.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Trivia type deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};


const categoryOptions = async (req, res, next) => {
  try {
    
    const triviaTypes = await TriviaTypes.find({ status: 1 })
      .select("_id name slug")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Active trivia types retrieved successfully",
      data: triviaTypes,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTriviaTypes,
  getdataTriviaTypes,
  getTriviaTypesByid,
  updateCategory,
  deleteTriviaTypes,
  categoryOptions,
  updateStatusCategory,
};