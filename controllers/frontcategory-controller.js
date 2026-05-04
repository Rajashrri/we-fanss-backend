const { Celebraty } = require("../models/celebraty-model");
const Professionalmaster = require("../models/professionalmaster-model");

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

    res.status(200).json({
      success: true,
      data: celebrity,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getCelebritiesByCategory,getCelebrityBySlug, 
};
