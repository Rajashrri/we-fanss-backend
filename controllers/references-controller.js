const createHttpError = require('http-errors');
const Reference = require('../models/references-model');
const generateSlug = require('../utils/helper/slugHelper');

const createReference = async (req, res, next) => {
  try {
    const slug = generateSlug({ name: req.body.title });
    
    if (!slug) {
      throw createHttpError(400, 'Title is required to generate slug');
    }

    const referenceData = {
      ...req.body,
      slug,
      createdBy: req.user.userId,
    };

    delete referenceData.slug;
    referenceData.slug = slug;

    const reference = await Reference.create(referenceData);

    return res.status(201).json({
      success: true,
      message: 'Reference created successfully',
      data: reference,
    });
  } catch (error) {
    next(error);
  }
};

const getAllReferences = async (req, res, next) => {
  try {
    const { celebrityId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    const filter = { celebrity: celebrityId };
    if (status !== undefined) {
      filter.status = Number(status);
    }

    const skip = (page - 1) * limit;

    const references = await Reference.find(filter)
      .populate('celebrity', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Reference.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'References retrieved successfully',
      data: references,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getReferenceById = async (req, res, next) => {
  try {
    const reference = await Reference.findById(req.params.id).populate(
      'createdBy',
      'name email'
    );

    if (!reference) {
      throw createHttpError(404, 'Reference not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Reference retrieved successfully',
      data: reference,
    });
  } catch (error) {
    next(error);
  }
};

const updateReference = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    if (req.body.title) {
      const slug = generateSlug({ name: req.body.title });
      if (!slug) {
        throw createHttpError(400, 'Title is required to generate slug');
      }
      updateData.slug = slug;
    }

    const reference = await Reference.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!reference) {
      throw createHttpError(404, 'Reference not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Reference updated successfully',
      data: reference,
    });
  } catch (error) {
    next(error);
  }
};

const updateReferenceStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (status === undefined) {
      throw createHttpError(400, 'Status is required');
    }

    const reference = await Reference.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!reference) {
      throw createHttpError(404, 'Reference not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Reference status updated successfully',
      data: reference,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReference = async (req, res, next) => {
  try {
    const reference = await Reference.findByIdAndDelete(req.params.id);

    if (!reference) {
      throw createHttpError(404, 'Reference not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Reference deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReference,
  getAllReferences,
  getReferenceById,
  updateReference,
  updateReferenceStatus,
  deleteReference,
};