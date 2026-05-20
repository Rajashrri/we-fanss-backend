const { Celebraty } = require("../models/celebraty-model");
const Professionalmaster = require("../models/professionalmaster-model");
const { Language } = require("../models/language-model");
const Timeline = require("../models/timeline-model");
const TriviaEntries = require("../models/triviaentries-model");
const Reference = require('../models/references-model');
const RelatedPersonality = require('../models/relatedpersonality-model');
const Watch = require("../models/watch-model");
const Read = require("../models/read-model");
const Listen = require("../models/listen-model");

const { Movie } = require("../models/moviev-model");
const { Series } = require("../models/series-model");
const mongoose = require("mongoose");

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

//timeline fetch
// ✅ Get Timeline By Celebrity
const getTimelineByCelebrity = async (req, res) => {
  try {
    const { celebrityId } = req.params;

    const timeline = await Timeline.find({
      celebrity: celebrityId,
      status: 1,
    }).sort({ fromYear: 1 });

    res.status(200).json({
      success: true,
      data: timeline,
    });
  } catch (error) {
    console.log("Timeline Fetch Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch timeline",
    });
  }
};

// ✅ Get Trivia By Celebrity
const getTriviaByCelebrity = async (req, res) => {
  try {
    const { celebrityId } = req.params;

    const trivia = await TriviaEntries.find({
      celebrity: celebrityId,
      status: 1,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: trivia,
    });
  } catch (error) {
    console.log("Trivia Fetch Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch trivia",
    });
  }
};


// ✅ Get References By Celebrity
const getReferencesByCelebrity = async (req, res) => {
  try {
    const { id } = req.params;

    const references = await Reference.find({
      celebrity: id,
      status: 1,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: references,
    });
  } catch (error) {
    console.log("Reference Fetch Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to fetch references",
      error: error.message,
    });
  }
};
const getRelatedPersonalitiesByCelebrity = async (
  req,
  res
) => {
  try {
    const { id } = req.params;

    console.log("Celebrity ID:", id);

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Celebrity ID is required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Celebrity ID",
      });
    }

    const relations =
      await RelatedPersonality.find({
        celebrity: id,
        status: 1,
      })
        .populate({
          path: "relatedCelebrity",
          select:
            "identityProfile.name identityProfile.slug identityProfile.image identityProfile.shortinfo",
        })
        .sort({ createdAt: -1 });

    console.log("Relations:", relations);

    res.status(200).json({
      success: true,
      data: relations,
    });
  } catch (error) {
    console.log(
      "Related Personality Fetch Error:",
      error
    );

    res.status(500).json({
      success: false,
      message:
        "Failed to fetch related personalities",
      error: error.message,
    });
  }
};
const getFeaturedMoviesByCelebrity = async (req, res) => {
  try {
    const { celebrityId } = req.params;

    const movies = await Movie.find({
      celebrity: celebrityId,
      status: 1,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: movies,
    });
  } catch (error) {
    console.log("Featured Movies Error:", error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
const getFeaturedSeriesByCelebrity = async (req, res) => {
  try {
    const { celebrityId } = req.params;

    const data = await Series.find({
      celebrityId,
      featured: 1,
      status: "1",
    })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Featured series fetched successfully",
      data,
    });
  } catch (error) {
    console.log("Featured Series Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
const getLatestWatchByCelebrity = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await Watch.find({
      celebrity: id,
      status: 0,
    })
      .sort({ createdAt: -1 })
      .limit(2);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getLatestReadByCelebrity = async (req, res) => {
  try {
    const { celebrityId } = req.params;

    const data = await Read.find({
      celebrity: celebrityId,
      status: 1,
    })
      .sort({ createdAt: -1 })
      .limit(2);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

const getLatestListenByCelebrity = async (req, res) => {
  try {
    const { celebrityId } = req.params;

    const data = await Listen.find({
      celebrity: celebrityId,
      status: 1,
    })
      .sort({ createdAt: -1 })
      .limit(2);

    res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  getCelebritiesByCategory,getCelebrityBySlug, getTimelineByCelebrity,getTriviaByCelebrity,
  getReferencesByCelebrity,getRelatedPersonalitiesByCelebrity,getFeaturedSeriesByCelebrity,
  getFeaturedMoviesByCelebrity,getLatestWatchByCelebrity,getLatestReadByCelebrity,getLatestListenByCelebrity
};
