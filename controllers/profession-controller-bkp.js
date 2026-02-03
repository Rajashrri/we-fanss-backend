const createHttpError = require("http-errors");
const Professionalmaster = require("../models/professionalmaster-model");
const { SectionTemplate } = require("../models/sectiontemplate-model");
const Celebratysection = require("../models/celebratysection-model");
const { Celebraty } = require("../models/celebraty-model");
const fs = require("fs");
const path = require("path");

// ==================== HELPER FUNCTIONS ====================

const createCleanUrl = (title) => {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
};

const syncCelebritySections = async (professionId, templateIds, specificCelebrityId = null) => {
  try {
    console.log("🔄 Starting sync for profession:", professionId);

    let celebrities;
    if (specificCelebrityId) {
      const celeb = await Celebraty.findById(specificCelebrityId).select("_id sections");
      celebrities = celeb ? [celeb] : [];
    } else {
      celebrities = await Celebraty.find({
        professions: professionId.toString(),
      }).select("_id sections");
    }

    if (!celebrities.length) {
      console.log("⚠️ No celebrities found for this profession");
      return;
    }

    for (const templateId of templateIds) {
      const template = await SectionTemplate.findById(templateId).populate("sections");

      if (!template || !template.sections || template.sections.length === 0) {
        console.log(`⚠️ Template ${templateId} not found or has no sections`);
        continue;
      }

      for (const celeb of celebrities) {
        // ✅ Celebrity ka sections array string set banao — fast lookup ke liye
        const existingSectionSet = new Set(
          (celeb.sections || []).map((s) => s.toString())
        );

        const newSectionIds = [];

        for (const section of template.sections) {
          // ✅ STEP 1: Celebrity.sections array mein already hai?
          if (existingSectionSet.has(section._id.toString())) {
            console.log(`⏭️ Section ${section.name} already in celebrity sections array — skipping`);
            continue;
          }

          // ✅ STEP 2: CelebratySection collection mein already exists?
          const exists = await Celebratysection.findOne({
            celebratyId: celeb._id.toString(),
            professions: professionId.toString(),
            templateId: templateId.toString(),
            sectionmaster: section._id.toString(),
          });

          if (exists) {
            console.log(`⏭️ CelebratySection entry already exists for ${section.name} — skipping`);
            continue;
          }

          // ✅ STEP 3: Dono checks pass — entry create karo
          const isNewCelebrity = specificCelebrityId !== null;

          await Celebratysection.create({
            celebratyId: celeb._id.toString(),
            professions: professionId.toString(),
            templateId: templateId.toString(),
            sectionmaster: section._id.toString(),
            sectiontemplate: section.name || template.title,
            status: isNewCelebrity ? 1 : 0,
            flag: 1,
          });

          console.log(`✅ Section created: ${section.name} | status: ${isNewCelebrity ? 1 : 0}`);

          // ✅ STEP 4: Track for array push
          newSectionIds.push(section._id);

          // ✅ Local set mein bhi add karo — same loop mein dobara check na ho
          existingSectionSet.add(section._id.toString());
        }

        // ✅ STEP 5: Celebrity.sections array mein push karo
        if (newSectionIds.length > 0) {
          await Celebraty.findByIdAndUpdate(celeb._id, {
            $addToSet: { sections: { $each: newSectionIds } },
          });
          console.log(`✅ Pushed ${newSectionIds.length} sections to celebrity ${celeb._id}`);
        }
      }
    }

    console.log("🎉 Sync completed successfully!");
  } catch (error) {
    console.error("❌ Sync error:", error);
    throw error;
  }
};

// ==================== CONTROLLERS ====================

/**
 * @desc    Get section template options for dropdown
 * @route   GET /api/professional/section-templates
 * @access  Private
 */
const getSectionTemplateOptions = async (req, res, next) => {
  try {
    const templates = await SectionTemplate.find({ status: 1 });

    if (!templates || templates.length === 0) {
      throw createHttpError(404, "No section templates found");
    }

    return res.status(200).json({
      success: true,
      message: "Section templates fetched successfully",
      data: templates,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create new professional master
 * @route   POST /api/professional
 * @access  Private - Super Admin, Admin only
 */
const createProfessional = async (req, res, next) => {
  try {
    const { name, slug } = req.body;
    let sectiontemplate = [];

    // ✅ Parse section template if provided
    if (req.body.sectiontemplate) {
      try {
        sectiontemplate = typeof req.body.sectiontemplate === 'string' 
          ? JSON.parse(req.body.sectiontemplate) 
          : req.body.sectiontemplate;
      } catch (err) {
        throw createHttpError(400, "Invalid section template format");
      }
    }

    // ✅ Check if already exists
    const existingProfessional = await Professionalmaster.findOne({
      $or: [
        { name: name.trim() }, 
        { slug: slug ? slug.trim() : Professionalmaster.generateSlug({ name }) }
      ],
    });

    if (existingProfessional) {
      throw createHttpError(409, "Professional master already exists with this name or slug");
    }

    // ✅ Generate slug if not provided
    const finalSlug = slug?.trim() || Professionalmaster.generateSlug({ name });

    // ✅ Handle image upload - Store as /professions/image_id
    let imagePath = "";
    if (req.files?.image?.[0]) {
      const uploadedFile = req.files.image[0];
      imagePath = `/professions/${uploadedFile.filename}`;
    }

    // ✅ Generate clean URL
    const url = createCleanUrl(name);

    // ✅ Get createdBy from authenticated user
    const createdBy = req.user?.userId || null;

    // ✅ Create new professional master
    const newProfessional = await Professionalmaster.create({
      name: name.trim(),
      slug: finalSlug,
      imagePath,
      sectiontemplate,
      status: 1,
      url,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Professional master created successfully",
      data: {
        professional: newProfessional,
        professionalId: newProfessional._id.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update professional master
 * @route   PUT /api/professional/:id
 * @access  Private - Super Admin, Admin only
 */
const updateProfessional = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, slug } = req.body;
    let sectiontemplate = [];

    // ✅ Parse section template
    if (req.body.sectiontemplate) {
      try {
        sectiontemplate = typeof req.body.sectiontemplate === 'string'
          ? JSON.parse(req.body.sectiontemplate)
          : req.body.sectiontemplate;
      } catch (err) {
        throw createHttpError(400, "Invalid section template format");
      }
    }

    // ✅ Find professional
    const professional = await Professionalmaster.findById(id);
    if (!professional) {
      throw createHttpError(404, "Professional master not found");
    }

    // ✅ Check for duplicates
    if (name || slug) {
      const duplicate = await Professionalmaster.findOne({
        $and: [
          { _id: { $ne: id } },
          {
            $or: [
              { name: name?.trim() || professional.name },
              { slug: slug?.trim() || professional.slug },
            ],
          },
        ],
      });

      if (duplicate) {
        throw createHttpError(409, "Professional with this name or slug already exists");
      }
    }

    // ✅ Store old templates for sync comparison
    const oldTemplates = professional.sectiontemplate.map((t) => t.toString());

    // ✅ Update fields
    if (name) professional.name = name.trim();
    if (slug) professional.slug = slug.trim();
    if (Array.isArray(sectiontemplate) && sectiontemplate.length > 0) {
      professional.sectiontemplate = sectiontemplate;
    }

    // ✅ Handle image update - Store as /professions/image_id
    const newImageFile = req.files?.image?.[0] || req.file;
    if (newImageFile) {
      // Delete old image if exists
      if (professional.imagePath) {
        const oldImageName = path.basename(professional.imagePath);
        const oldPath = path.join(__dirname, "../public/professions/", oldImageName);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
            console.log("🗑️ Old image deleted");
          } catch (err) {
            console.error("❌ Failed to delete old image:", err);
          }
        }
      }
      professional.imagePath = `/professions/${newImageFile.filename}`;
    }

    // ✅ Save professional
    await professional.save();
    console.log("✅ Professional saved successfully");

    // ✅ Sync celebrities if templates changed
    const newTemplates = professional.sectiontemplate.map((t) => t.toString());
    const templatesChanged =
      newTemplates.length !== oldTemplates.length ||
      newTemplates.some((t) => !oldTemplates.includes(t));

    if (templatesChanged && newTemplates.length > 0) {
      console.log("🔄 Templates changed, syncing celebrities...");
      try {
        // ✅ Pass null as specificCelebrityId → status will be 0 (inactive) for later updates
        await syncCelebritySections(id, newTemplates, null);
        console.log("✅ Celebrity sections synced successfully");
      } catch (syncError) {
        console.error("❌ Sync failed but professional saved:", syncError);
      }
    }

    return res.status(200).json({
      success: true,
      message: "Professional master updated successfully",
      data: {
        professional,
        professionalId: professional._id.toString(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update professional status
 * @route   PATCH /api/professional/status
 * @access  Private - Super Admin, Admin only
 */
const updateProfessionalStatus = async (req, res, next) => {
  try {
    const { status, id } = req.body;

    // ✅ Validation
    if (!id) {
      throw createHttpError(400, "Professional ID is required");
    }

    if (status === undefined || status === null) {
      throw createHttpError(400, "Status is required");
    }

    if (![0, 1].includes(status)) {
      throw createHttpError(400, "Status must be either 0 (inactive) or 1 (active)");
    }

    const professional = await Professionalmaster.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!professional) {
      throw createHttpError(404, "Professional master not found");
    }

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: {
        professionalId: professional._id.toString(),
        status: professional.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all professionals
 * @route   GET /api/professional
 * @access  Private - Super Admin only
 */
const getAllProfessionals = async (req, res, next) => {
  try {
    const professionals = await Professionalmaster.find()
      .populate('sectiontemplate', 'name status')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Professionals fetched successfully",
      data: professionals,
      meta: {
        count: professionals.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get professional by ID
 * @route   GET /api/professional/:id
 * @access  Private - Super Admin, Admin only
 */
const getProfessionalById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const professional = await Professionalmaster.findById(id)
      .populate('sectiontemplate', 'name status')
      .populate('createdBy', 'name email');

    if (!professional) {
      throw createHttpError(404, "Professional master not found");
    }

    return res.status(200).json({
      success: true,
      message: "Professional fetched successfully",
      data: professional,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete professional
 * @route   DELETE /api/professional/:id
 * @access  Private - Super Admin, Admin only
 */
const deleteProfessional = async (req, res, next) => {
  try {
    const { id } = req.params;

    const professional = await Professionalmaster.findByIdAndDelete(id);

    if (!professional) {
      throw createHttpError(404, "Professional master not found");
    }

    // ✅ Delete image if exists
    if (professional.imagePath) {
      const imageName = path.basename(professional.imagePath);
      const imagePath = path.join(__dirname, "../public/professions/", imageName);
      if (fs.existsSync(imagePath)) {
        try {
          fs.unlinkSync(imagePath);
          console.log("🗑️ Image deleted");
        } catch (err) {
          console.error("❌ Failed to delete image:", err);
        }
      }
    }

    return res.status(200).json({
      success: true,
      message: "Professional master deleted successfully",
      data: {
        professionalId: id,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ==================== EXPORTS ====================

module.exports = {
  getSectionTemplateOptions,
  createProfessional,
  updateProfessional,
  updateProfessionalStatus,
  getAllProfessionals,
  getProfessionalById,
  deleteProfessional,
  syncCelebritySections,
};