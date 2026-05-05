const { Celebraty } = require("../models/celebraty-model");
const Professionalmaster = require("../models/professionalmaster-model");
const { Language } = require("../models/language-model");

const getCelebritiesByCategory = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find category
    const profession = await Professionalmaster.findOne({
      slug: slug.toLowerCase(),
      status: 1,
    });

    if (!profession) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Find celebrities from nested professionalIdentity.professions
    const celebrities = await Celebraty.find({
      "professionalIdentity.professions": profession._id,
      status: 1,
    })
    .select(
  "identityProfile.name identityProfile.slug identityProfile.categoryImage personalDetails.gender personalDetails.dob professionalIdentity.languages"
)
.populate("professionalIdentity.languages", "name"); // ✅ IMPORTANT
    res.status(200).json({
      success: true,
      category: profession.name,
      total: celebrities.length,
      data: celebrities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


//profile details
// controller

const getCelebrityBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const celebrity = await Celebraty.findOne({
      "identityProfile.slug": slug,
      status: 1,
    }).populate("professionalIdentity.languages", "name");

    if (!celebrity) {
      return res.status(404).json({
        success: false,
        message: "Celebrity not found",
      });
    }

    // ✅ profession ids
    const professionIds =
      celebrity?.professionalIdentity?.professions || [];

    // ✅ profession master se name lao
    const professions = await Professionalmaster.find({
      _id: { $in: professionIds }
    }).select("name");

    // ✅ comma separated names
    const professionNames = professions
      .map((item) => item.name)
      .filter(Boolean)
      .join(", ");

    // ✅ Language Names
    const languageIds =
      celebrity?.professionalIdentity?.languages || [];

    const languages = await Language.find({
      _id: { $in: languageIds }
    }).select("name");

    const languageNames = languages
      .map((item) => item.name)
      .filter(Boolean);

    res.status(200).json({
      success: true,
      data: {
        ...celebrity.toObject(),

        professionalIdentity: {
          ...celebrity.professionalIdentity,

          professions,
          professionNames, // ["Actor","Politician"]

          languages,
          languageNames // ["English","Marathi"]
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
module.exports = {
  getCelebritiesByCategory,getCelebrityBySlug, 
};
