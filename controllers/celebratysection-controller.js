// controllers/celebratysection-controller.js
const CelebratySectionModel = require("../models/celebratysection-model");
const { createError } = require("http-errors");

const getCelebritySections = async (req, res, next) => {
  try {
    const { celebratyId } = req.params;

    if (!celebratyId) {
      throw createError(400, "Celebrity ID is required");
    }

    const sections = await CelebratySectionModel.find({ 
      celebratyId: celebratyId,
      flag: 1
    })
      .populate('celebratyId', 'name email')
      .populate('professions', 'name')
      .populate('sectionmaster', 'name description')
      .populate('templateId', 'name content')
      .sort({ createdAt: -1 });

    if (!sections || sections.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No sections found for this celebrity",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      message: "Sections retrieved successfully",
      data: sections,
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCelebritySections,
};