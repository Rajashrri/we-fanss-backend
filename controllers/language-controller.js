const { Language } = require("../models/language-model");
const createError = require("http-errors");


const addLanguage = async (req, res, next) => {
  try {
    const { name, code } = req.body;

    // ✅ Check duplicate name or code
    const existingLanguage = await Language.findOne({
      $or: [
        { name: name.trim() },
        { code: code.trim().toUpperCase() }
      ],
    });

    if (existingLanguage) {
      const field = existingLanguage.name.toLowerCase() === name.trim().toLowerCase() ? "name" : "code";
      throw createError(409, `Language ${field} already exists`);
    }

    // ✅ Generate slug using schema static method
    const generatedSlug = Language.generateSlug({ name });

    // ✅ Create language (createdBy from req.user)
    const newLanguage = await Language.create({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      slug: generatedSlug,
      status: 1,
      createdBy: req.user.userId
    });

    return res.status(201).json({
      success: true,
      message: "Language created successfully",
      data: newLanguage
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET ALL LANGUAGES
// ============================================
const getDataLanguage = async (req, res, next) => {
  try {
    const languages = await Language.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Languages retrieved successfully",
      data: languages
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET LANGUAGE BY ID
// ============================================
const getLanguageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const language = await Language.findById(id)
      .populate('createdBy', 'name email');

    if (!language) {
      throw createError(404, "Language not found");
    }

    return res.status(200).json({
      success: true,
      message: "Language retrieved successfully",
      data: language
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE LANGUAGE
// ============================================
const updateLanguage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code} = req.body;

    // ✅ Check if language exists
    const existingLanguage = await Language.findById(id);
    if (!existingLanguage) {
      throw createError(404, "Language not found");
    }

    // ✅ Check duplicate name or code (excluding current id)
    if (name || code) {
      const duplicateQuery = [];
      if (name) duplicateQuery.push({ name: name.trim() });
      if (code) duplicateQuery.push({ code: code.trim().toUpperCase() });

      const duplicate = await Language.findOne({
        $or: duplicateQuery,
        _id: { $ne: id }
      });

      if (duplicate) {
        const field = duplicate.name?.toLowerCase() === name?.trim().toLowerCase() ? "name" : "code";
        throw createError(409, `Language ${field} already exists`);
      }
    }

    // ✅ Prepare update data
    const updateData = {};
    if (name) {
      updateData.name = name.trim();
      updateData.slug = Language.generateSlug({ name });
    }
    if (code) updateData.code = code.trim().toUpperCase();
    

    // ✅ Update language
    const updatedLanguage = await Language.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: "Language updated successfully",
      data: updatedLanguage
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// UPDATE LANGUAGE STATUS
// ============================================
const updateLanguageStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const language = await Language.findById(id);
    if (!language) {
      throw createError(404, "Language not found");
    }

    language.status = status;
    await language.save();

    return res.status(200).json({
      success: true,
      message: "Language status updated successfully",
      data: language
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// DELETE LANGUAGE
// ============================================
const deleteLanguage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const language = await Language.findById(id);
    if (!language) {
      throw createError(404, "Language not found");
    }

    await Language.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Language deleted successfully",
      data: { id }
    });

  } catch (error) {
    next(error);
  }
};

// ============================================
// GET ACTIVE LANGUAGES (OPTIONS)
// ============================================
const getLanguageOptions = async (req, res, next) => {
  try {
    const languages = await Language.find({ status: 1 })
      .select('name code slug')
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      message: "Active languages retrieved successfully",
      data: languages
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  addLanguage,
  getDataLanguage,
  getLanguageById,
  updateLanguage,
  updateLanguageStatus,
  deleteLanguage,
  getLanguageOptions
};