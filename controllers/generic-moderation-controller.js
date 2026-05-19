const createHttpError = require("http-errors");
const { getModelByModule, MODERATION_MODULES } = require("../utils/moderation-resource-map");

const SectionMaster  = require("../models/sectionmaster-model");
const { Celebraty } = require("../models/celebraty-model");


/**
 * @desc    Get pending summary for a specific celebrity (tab-wise)
 * @route   GET /api/moderation/celebrity/:id/pending-summary
 * @access  Private - Reviewer/Admin only
 */
const getCelebrityPendingSummary = async (req, res, next) => {
  try {

    const { id } = req.params;

    // ✅ Fetch celebrity with professions
    const celebrity = await Celebraty.findById(id)
      .select({
        "identityProfile.name": 1,
        "identityProfile.image": 1,
        "moderationState": 1,
        "professionalIdentity.professions": 1,
        createdAt: 1,
      })
      .populate("professionalIdentity.professions", "name")
      .lean();

    if (!celebrity) {
      return res.status(404).json({
        success: false,
        message: "Celebrity not found",
      });
    }

    const celebrityId = celebrity._id.toString();

    // ✅ Get profession names
    const professions = celebrity.professionalIdentity?.professions || [];
    const professionNames = professions.map(p => p.name?.toLowerCase());
    
    const isActor = professionNames.includes('actor');
    const isPolitician = professionNames.includes('politician');

    // ✅ Common modules for ALL professions (Fixed Sections)
    const commonModules = [
      { key: 'timeline', label: 'Timeline', module: MODERATION_MODULES.TIMELINE },
      { key: 'trivia', label: 'Trivia', module: MODERATION_MODULES.TRIVIA },
      { key: 'custom', label: 'Custom Options', module: MODERATION_MODULES.CUSTOM_OPTION },
      { key: 'references', label: 'References', module: MODERATION_MODULES.REFERENCE },
      { key: 'related', label: 'Related Personalities', module: MODERATION_MODULES.RELATION },
      { key: 'watch', label: 'Watch', module: MODERATION_MODULES.WATCH },
      { key: 'read', label: 'Read', module: MODERATION_MODULES.READ },
      { key: 'listen', label: 'Listen', module: MODERATION_MODULES.LISTEN },

    ];

    // ✅ Profession-specific modules
    const actorModules = [
      { key: 'movie', label: 'Movies', module: MODERATION_MODULES.MOVIE },
      { key: 'series', label: 'Series', module: MODERATION_MODULES.SERIES },
    ];

    const politicianModules = [
      { key: 'election', label: 'Elections', module: MODERATION_MODULES.ELECTION },
      { key: 'position', label: 'Positions', module: MODERATION_MODULES.POSITION },
    ];

    // ✅ Build complete module list based on profession
    let allModules = [...commonModules];
    
    if (isActor) {
      allModules = [...allModules, ...actorModules];
    }
    
    if (isPolitician) {
      allModules = [...allModules, ...politicianModules];
    }

    // ✅ Get pending counts for each module
    const tabs = [];
    let totalPending = 0;

    for (const moduleConfig of allModules) {
      const Model = await getModelByModule(moduleConfig.module);
      
      if (Model) {
        console.log(Model)
        const pendingCount = await Model.countDocuments({
          celebrity: celebrityId,
          moderationState: "PENDING",
          status: 1,
        });

        console.log(pendingCount)

        const publishedCount = await Model.countDocuments({
          celebrity: celebrityId,
          moderationState: "PUBLISHED",
          status: 1,
        });

        const rejectedCount = await Model.countDocuments({
          celebrity: celebrityId,
          moderationState: "REJECTED",
          status: 1,
        });

        tabs.push({
          key: moduleConfig.key,
          label: moduleConfig.label,
          pendingCount,
          publishedCount,
          rejectedCount,
          totalCount: pendingCount + publishedCount + rejectedCount,
        });

        totalPending += pendingCount;
      }
    }

    // ✅ Celebrity info pending check
    const celebrityPending = celebrity.moderationState === "PENDING" ? 1 : 0;
    totalPending += celebrityPending;

    return res.status(200).json({
      success: true,
      message: "Celebrity pending summary retrieved successfully",
      data: {
        celebrity: {
          _id: celebrity._id,
          name: celebrity.identityProfile?.name || "N/A",
          image: celebrity.identityProfile?.image || null,
          moderationState: celebrity.moderationState || "PENDING",
          professions: professions,
        },
        tabs,  // ✅ Tab-wise pending counts
        summary: {
          totalPending,
          celebrityInfoPending: celebrityPending,
          hasPendingItems: totalPending > 0,
        },
      },
    });
  } catch (error) {
    console.error("Get Celebrity Pending Summary Error:", error);
    next(error);
  }
};



/**
 * @desc    Get all pending items for a specific module
 * @route   GET /api/moderation/:module/pending
 * @access  Private - Reviewer/Admin only
 */
const getPendingItems = async (req, res, next) => {
  try {
    const { module } = req.params;
    const { page, limit, search, celebrity, sectionId } = req.query;

    // Validate module (pass sectionId for dynamic sections)
    const Model = await getModelByModule(module, { sectionId });
    if (!Model) {
      throw createHttpError(400, `Invalid moderation module: ${module}`);
    }

    // Build query
    let query = {
      moderationState: "PENDING",
      status: 1,
    };

    // Optional filters
    if (search) {
      // Search in both 'title' and 'name' fields
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    if (celebrity) {
      query.celebrity = celebrity;
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Fetch pending items
    const items = await Model.find(query)
      .populate("celebrity", "name")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Model.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: `Pending ${module} items retrieved successfully`,
      data: items,
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

/**
 * @desc    Get moderation statistics for a specific module
 * @route   GET /api/moderation/:module/stats
 * @access  Private - Reviewer/Admin only
 */
const getModerationStats = async (req, res, next) => {
  try {
    const { module } = req.params;
    const { sectionId } = req.query;

    // Validate module (pass sectionId for dynamic sections)
    const Model = await getModelByModule(module, { sectionId });
    if (!Model) {
      throw createHttpError(400, `Invalid moderation module: ${module}`);
    }

    // Aggregate stats by moderationState
    const stats = await Model.aggregate([
      {
        $match: { status: 1 }, // Only count active items
      },
      {
        $group: {
          _id: "$moderationState",
          count: { $sum: 1 },
        },
      },
    ]);

    // Format stats
    const formattedStats = {
      PENDING: 0,
      PUBLISHED: 0,
      REJECTED: 0,
      total: 0,
    };

    stats.forEach((stat) => {
      if (stat._id) {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;
      }
    });

    return res.status(200).json({
      success: true,
      message: `${module} moderation statistics retrieved successfully`,
      data: formattedStats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Helper: Smart populate based on schema fields
 */
const smartPopulate = async (Model, itemId) => {
  let query = Model.findById(itemId);
  
  // Check and populate 'celebrity' if exists
  if (Model.schema.paths.celebrity) {
    query = query.populate("celebrity", "name");
  }
  
  // Check and populate 'createdBy' if exists
  if (Model.schema.paths.createdBy) {
    query = query.populate("createdBy", "name email");
  }
  
  // Check and populate 'moderatedBy' if exists
  if (Model.schema.paths.moderatedBy) {
    query = query.populate("moderatedBy", "name email");
  }
  
  return await query;
};

/**
 * @desc    Publish an item (approve and make it live)
 */
const publishItem = async (req, res, next) => {
  try {
    
    const { module, id } = req.params;
    const { sectionId } = req.query;
    const moderatorId = req.user?.userId;

    

    const Model = await getModelByModule(module, { sectionId });
    if (!Model) {
      throw createHttpError(400, `Invalid moderation module: ${module}`);
    }

    const item = await Model.findById(id);
    if (!item) {
      throw createHttpError(404, `${module} item not found`);
    }

    if (item.moderationState === "PUBLISHED") {
      throw createHttpError(400, `${module} item is already published`);
    }

    // Update to PUBLISHED
    await Model.findByIdAndUpdate(
      id,
      {
        $set: {
          moderationState: "PUBLISHED",
          moderatedBy: moderatorId,
          moderatedAt: new Date(),
          moderationRemark: null,
        },
      },
      { new: true, runValidators: true }
    );

    // ✅ USE SMART POPULATE HELPER
    const populatedItem = await smartPopulate(Model, id);

    return res.status(200).json({
      success: true,
      message: `${module} item published successfully`,
      data: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Reject an item
 */
const rejectItem = async (req, res, next) => {
  try {
    const { module, id } = req.params;
    const { moderationRemark, sectionId } = req.body;
    const moderatorId = req.user?.userId;

    const Model = await getModelByModule(module, { sectionId });
    if (!Model) {
      throw createHttpError(400, `Invalid moderation module: ${module}`);
    }

    const item = await Model.findById(id);
    if (!item) {
      throw createHttpError(404, `${module} item not found`);
    }

    if (item.moderationState === "REJECTED") {
      throw createHttpError(400, `${module} item is already rejected`);
    }

    // Update to REJECTED
    await Model.findByIdAndUpdate(
      id,
      {
        $set: {
          moderationState: "REJECTED",
          moderatedBy: moderatorId,
          moderatedAt: new Date(),
          moderationRemark: moderationRemark || "No reason provided",
        },
      },
      { new: true, runValidators: true }
    );

    // ✅ USE SMART POPULATE HELPER
    const populatedItem = await smartPopulate(Model, id);

    return res.status(200).json({
      success: true,
      message: `${module} item rejected successfully`,
      data: populatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all items for a specific module with moderation filter
 * @route   GET /api/moderation/:module/all
 * @access  Private - Reviewer/Admin only
 */
const getAllItems = async (req, res, next) => {
  try {
    const { module } = req.params;
    const { page, limit, search, celebrity, moderationState, sectionId } = req.query;

    // Validate module (pass sectionId for dynamic sections)
    const Model = await getModelByModule(module, { sectionId });
    if (!Model) {
      throw createHttpError(400, `Invalid moderation module: ${module}`);
    }

    // Build query
    let query = { status: 1 };

    // Filter by moderation state if provided
    if (moderationState) {
      query.moderationState = moderationState;
    }

    // Optional filters
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { name: { $regex: search, $options: "i" } },
      ];
    }

    if (celebrity) {
      query.celebrity = celebrity;
    }

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Fetch items
    const items = await Model.find(query)
      .populate("celebrity", "name")
      .populate("createdBy", "name email")
      .populate("moderatedBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Model.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: `${module} items retrieved successfully`,
      data: items,
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

module.exports = {
  getPendingItems,
  getModerationStats,
  publishItem,
  rejectItem,
  getAllItems,
  getCelebrityPendingSummary,
};