const { SectionTemplate } = require("../models/sectiontemplate-model");
const SectionMaster = require("../models/sectionmaster-model");
const CelebratySection = require("../models/celebratysection-model");
const createHttpError = require("http-errors");
const generateSlug = require("../utils/helper/slugHelper");
const Professionalmaster = require("../models/professionalmaster-model")
const {Celebraty} = require("../models/celebraty-model")

//add project
const sectionsOptions = async (req, res, next) => {
  try {
    const item = await SectionMaster.find({ status: 1 });
    if (!item) {
      throw createHttpError(404, "No Data Found");
    }

    res.status(200).json({
      success: true,
      message: "Sections retrieved successfully",
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

// -----------Category Features------------------
//add fixed item
const addsectiontemplate = async (req, res, next) => {
  try {
    const { title, sections = [], slug } = req.body;
    const createdBy = req.user.userId;

    const finalSlug = slug || generateSlug({ name: title });

    // ✅ Check if a template with same title already exists
    const existingTitle = await SectionTemplate.findOne({
      title: { $regex: new RegExp(`^${title}$`, "i") },
    });
    if (existingTitle) {
      throw createHttpError(400, "Section Template with this title already exists");
    }

    // ✅ Check if slug already exists
    const existingSlug = await SectionTemplate.findOne({ slug: finalSlug });
    if (existingSlug) {
      throw createHttpError(409, "Slug already exists");
    }

    // ✅ Create new Section Template document
    const newTemplate = await SectionTemplate.create({
      title,
      sections,
      slug: finalSlug,
      createdBy,
    });

    return res.status(201).json({
      success: true,
      message: "Section Template created successfully",
      data: newTemplate,
    });
  } catch (error) {
    next(error);
  }
};

const getdatasectiontemplate = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query;

    let query = {};

    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    const templates = await SectionTemplate.find(query)
      .populate("sections", "name slug")
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await SectionTemplate.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: "Section templates retrieved successfully",
      data: templates,
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

const getsectiontemplateByid = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await SectionTemplate.findById(id)
      .populate("sections", "name slug")
      .populate("createdBy", "name email");

    if (!template) {
      throw createHttpError(404, "Section Template not found");
    }

    return res.status(200).json({
      success: true,
      message: "Section template retrieved successfully",
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

// ==================== 2. updateSectionTemplate ====================
// Called when: template mein new sections add hote hain
// Status: 0 (inactive) — template update hai

const updateSectionTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, sections, slug } = req.body;

    // 1️⃣ Find existing template
    const existingTemplate = await SectionTemplate.findById(id);
    if (!existingTemplate) {
      throw createHttpError(404, "Section Template not found");
    }

    // 2️⃣ Duplicate title check
    if (title) {
      const duplicateTitle = await SectionTemplate.findOne({
        title: { $regex: new RegExp(`^${title}$`, "i") },
        _id: { $ne: id },
      });
      if (duplicateTitle) {
        throw createHttpError(400, "Section Template with this title already exists");
      }
    }

    // 3️⃣ Duplicate slug check
    if (slug) {
      const duplicateSlug = await SectionTemplate.findOne({
        slug: { $regex: new RegExp(`^${slug}$`, "i") },
        _id: { $ne: id },
      });
      if (duplicateSlug) {
        throw createHttpError(409, "Slug already exists");
      }
    }

    // 4️⃣ Build update fields
    const updateFields = {};
    if (title !== undefined) updateFields.title = title;
    if (sections !== undefined) updateFields.sections = sections;
    if (slug !== undefined) updateFields.slug = slug;

    // 5️⃣ Detect newly added sections
    if (sections) {
      const oldSections = existingTemplate.sections.map((s) => s.toString()) || [];
      const newSections = sections.filter((s) => !oldSections.includes(s));

      // 6️⃣ New sections mile hain toh sync
      if (newSections.length > 0) {
        // ✅ New section names fetch karte hain
        const sectionDocs = await SectionMaster.find({ _id: { $in: newSections } });
        const sectionMap = {};
        sectionDocs.forEach((s) => {
          sectionMap[s._id.toString()] = s.name;
        });

        // ✅ Kaun se Professions is template use karte hain
        const professions = await Professionalmaster.find({
          sectiontemplate: id,
        }).select("_id");

        if (professions.length === 0) {
          console.log("⚠️ No professions linked to this template — skipping sync");
        } else {
          const professionIds = professions.map((p) => p._id.toString());

          // ✅ Un professions se linked celebrities — professionalIdentity select karte hain
          const celebrities = await Celebraty.find({
            "professionalIdentity.professions": { $in: professionIds },
          }).select("_id professionalIdentity");

          console.log(`📌 Found ${celebrities.length} celebrities to sync`);

          const newEntries = [];
          const celebNewSectionsMap = {};

          for (const celeb of celebrities) {
            // ✅ Celebrity ka sections array Set banao — fast lookup
            const existingSectionSet = new Set(
              (celeb.professionalIdentity?.sections || []).map((s) => s.toString())
            );

            // ✅ Sirf wahi professions process karo jo is template use karte hain
            const celebProfIds = (celeb.professionalIdentity?.professions || []).map((p) => p.toString());
            const matchedProfIds = celebProfIds.filter((pid) => professionIds.includes(pid));

            for (const profId of matchedProfIds) {
              for (const secId of newSections) {
                // ✅ STEP 1: Celebrity.professionalIdentity.sections array mein already hai?
                if (existingSectionSet.has(secId.toString())) {
                  console.log(`⏭️ Section ${secId} already in celebrity ${celeb._id} sections array — skipping`);
                  continue;
                }

                // ✅ STEP 2: CelebratySection collection mein already exists?
                const exists = await CelebratySection.findOne({
                  celebratyId: celeb._id,
                  professions: profId,
                  templateId: id,
                  sectionmaster: secId,
                });

                if (exists) {
                  console.log(`⏭️ CelebratySection entry already exists — skipping`);
                  continue;
                }

                // ✅ STEP 3: Dono checks pass — entry banao
                newEntries.push({
                  celebratyId: celeb._id,
                  professions: profId,
                  templateId: id,
                  sectionmaster: secId,
                  sectiontemplate: sectionMap[secId] || "Unknown Section",
                  status: 0,  // template update → inactive
                  flag: 1,
                });

                // ✅ STEP 4: Track for array push
                if (!celebNewSectionsMap[celeb._id.toString()])
                  celebNewSectionsMap[celeb._id.toString()] = [];
                celebNewSectionsMap[celeb._id.toString()].push(secId);

                // ✅ Local set update — same loop mein dobara skip ho
                existingSectionSet.add(secId.toString());
              }
            }
          }

          // ✅ STEP 5a: Bulk insert CelebratySection entries
          if (newEntries.length > 0) {
            await CelebratySection.insertMany(newEntries);
            console.log(`✅ ${newEntries.length} new celebratysection entries created`);
          }

          // ✅ STEP 5b: Celebrity.professionalIdentity.sections array mein push karo
          for (const [celebId, sectionIds] of Object.entries(celebNewSectionsMap)) {
            await Celebraty.findByIdAndUpdate(celebId, {
              $addToSet: { "professionalIdentity.sections": { $each: sectionIds } },
            });
            console.log(`✅ Pushed ${sectionIds.length} sections to celebrity ${celebId}`);
          }
        }
      }
    }

    // 7️⃣ Update template
    const updatedTemplate = await SectionTemplate.findByIdAndUpdate(
      id,
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Section Template updated successfully",
      data: updatedTemplate,
    });
  } catch (error) {
    next(error);
  }
};

const updateStatusCategory = async (req, res, next) => {
  try {
    const { status, id } = req.body;

    const existingTemplate = await SectionTemplate.findById(id);
    if (!existingTemplate) {
      throw createHttpError(404, "Section Template not found");
    }

    const updatedTemplate = await SectionTemplate.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: updatedTemplate,
    });
  } catch (error) {
    next(error);
  }
};

const deletesectiontemplate = async (req, res, next) => {
  try {
    const { id } = req.params;

    const template = await SectionTemplate.findById(id);
    if (!template) {
      throw createHttpError(404, "Section Template not found");
    }

    await SectionTemplate.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: "Section Template deleted successfully",
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addsectiontemplate,
  getdatasectiontemplate,
  getsectiontemplateByid,
  updateSectionTemplate,
  deletesectiontemplate,
  updateStatusCategory,
  sectionsOptions,
};