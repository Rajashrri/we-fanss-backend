const createHttpError = require('http-errors');
const RelatedPersonality = require('../models/relatedpersonality-model');
const { Celebraty: Celebrity } = require('../models/celebraty-model'); // Fix the import

const createRelatedPersonality = async (req, res, next) => {
  try {
    const { celebrity, relatedCelebrity, relationshipType } = req.body;

    console.log(relatedCelebrity);

    // Validate both celebrities exist
    const [mainCelebrity, relatedCelebrityDoc] = await Promise.all([
      Celebrity.findById(celebrity),
      Celebrity.findById(relatedCelebrity)
    ]);

    if (!mainCelebrity) {
      throw createHttpError(404, 'Celebrity not found');
    }

    if (!relatedCelebrityDoc) {
      throw createHttpError(404, 'Related celebrity not found');
    }

    // Check if celebrity is trying to relate to themselves
    if (celebrity === relatedCelebrity) {
      throw createHttpError(400, 'Celebrity cannot be related to themselves');
    }

    // ✅ UPDATED: Check for duplicate relationship OF THE SAME TYPE
    const existingRelation = await RelatedPersonality.findOne({
      celebrity,
      relatedCelebrity,
      relationshipType // Now checking with relationship type
    });

    if (existingRelation) {
      throw createHttpError(409, `This ${relationshipType} relationship already exists between these celebrities`);
    }

    const relatedPersonalityData = {
      ...req.body,
      createdBy: req.user.userId,
    };

    const relatedPersonality = await RelatedPersonality.create(relatedPersonalityData);

    // Populate after creation
    await relatedPersonality.populate([
      { path: 'celebrity', select: 'identityProfile.name' },
      { path: 'relatedCelebrity', select: 'identityProfile.name' },
      { path: 'createdBy', select: 'name email' }
    ]);

    return res.status(201).json({
      success: true,
      message: 'Related personality created successfully',
      data: relatedPersonality,
    });
  } catch (error) {
    next(error);
  }
};

const getAllRelatedPersonalities = async (req, res, next) => {
  try {
    const { celebrityId } = req.params;
    const { page = 1, limit = 10, status } = req.query;

    // Validate celebrity exists
    const celebrity = await Celebrity.findById(celebrityId);
    if (!celebrity) {
      throw createHttpError(404, 'Celebrity not found');
    }

    const filter = { celebrity: celebrityId };
    if (status !== undefined) {
      filter.status = Number(status);
    }

    const skip = (page - 1) * limit;

    const relatedPersonalities = await RelatedPersonality.find(filter)
      .populate('celebrity', 'identityProfile.name')
      .populate('relatedCelebrity', 'identityProfile.name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await RelatedPersonality.countDocuments(filter);

    return res.status(200).json({
      success: true,
      message: 'Related personalities retrieved successfully',
      data: relatedPersonalities,
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

const getRelatedPersonalityById = async (req, res, next) => {
  try {
    const relatedPersonality = await RelatedPersonality.findById(req.params.id)
      .populate('celebrity', 'identityProfile.name')
      .populate('relatedCelebrity', 'identityProfile.name')
      .populate('createdBy', 'name email');

    if (!relatedPersonality) {
      throw createHttpError(404, 'Related personality not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Related personality retrieved successfully',
      data: relatedPersonality,
    });
  } catch (error) {
    next(error);
  }
};

const updateRelatedPersonality = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };

    // Check if related personality exists
    const existingRelation = await RelatedPersonality.findById(id);
    if (!existingRelation) {
      throw createHttpError(404, 'Related personality not found');
    }

    // If updating celebrity or relatedCelebrity, validate they exist
    if (updateData.celebrity) {
      const celebrity = await Celebrity.findById(updateData.celebrity);
      if (!celebrity) {
        throw createHttpError(404, 'Celebrity not found');
      }
    }

    if (updateData.relatedCelebrity) {
      const relatedCelebrity = await Celebrity.findById(updateData.relatedCelebrity);
      if (!relatedCelebrity) {
        throw createHttpError(404, 'Related celebrity not found');
      }
    }

    // Check if celebrity is trying to relate to themselves
    const finalCelebrity = updateData.celebrity || existingRelation.celebrity;
    const finalRelatedCelebrity = updateData.relatedCelebrity || existingRelation.relatedCelebrity;

    if (finalCelebrity.toString() === finalRelatedCelebrity.toString()) {
      throw createHttpError(400, 'Celebrity cannot be related to themselves');
    }

    // Check for duplicate relationship (if celebrity or relatedCelebrity changed)
    if (updateData.celebrity || updateData.relatedCelebrity) {
      const duplicateRelation = await RelatedPersonality.findOne({
        _id: { $ne: id },
        celebrity: finalCelebrity,
        relatedCelebrity: finalRelatedCelebrity
      });

      if (duplicateRelation) {
        throw createHttpError(409, 'This relationship already exists');
      }
    }

    const relatedPersonality = await RelatedPersonality.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('celebrity', 'identityProfile.name')
      .populate('relatedCelebrity', 'identityProfile.name')
      .populate('createdBy', 'name email');

    return res.status(200).json({
      success: true,
      message: 'Related personality updated successfully',
      data: relatedPersonality,
    });
  } catch (error) {
    next(error);
  }
};

const updateRelatedPersonalityStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (status === undefined) {
      throw createHttpError(400, 'Status is required');
    }

    const relatedPersonality = await RelatedPersonality.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('celebrity', 'identityProfile.name')
      .populate('relatedCelebrity', 'identityProfile.name')
      .populate('createdBy', 'name email');

    if (!relatedPersonality) {
      throw createHttpError(404, 'Related personality not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Related personality status updated successfully',
      data: relatedPersonality,
    });
  } catch (error) {
    next(error);
  }
};

const deleteRelatedPersonality = async (req, res, next) => {
  try {
    const relatedPersonality = await RelatedPersonality.findByIdAndDelete(req.params.id);

    if (!relatedPersonality) {
      throw createHttpError(404, 'Related personality not found');
    }

    return res.status(200).json({
      success: true,
      message: 'Related personality deleted successfully',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRelatedPersonality,
  getAllRelatedPersonalities,
  getRelatedPersonalityById,
  updateRelatedPersonality,
  updateRelatedPersonalityStatus,
  deleteRelatedPersonality,
};