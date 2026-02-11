const mongoose = require("mongoose");
const SectionMaster = require("../models/sectionmaster-model");

const { Celebraty } = require("../models/celebraty-model");
const CustomSection = require("../models/customoption-model");
const { Election } = require("../models/election-model");
const { Movie } = require("../models/moviev-model");
const { Positions } = require("../models/positions-model");
const Reference = require("../models/references-model");
const RelatedPersonality = require("../models/relatedpersonality-model");
const { Series } = require("../models/series-model");
const Timeline = require("../models/timeline-model");
const TriviaEntries = require("../models/triviaentries-model");

const MODERATION_MODULES = Object.freeze({
  CELEBRITY: "celebrity",
  CUSTOM_OPTION: "custom-section",
  ELECTION: "election",
  MOVIE: "movie",
  POSITION: "position",
  REFERENCE: "reference",
  RELATION: "relation",
  SERIES: "series",
  TIMELINE: "timeline",
  TRIVIA: "trivia",
  DYNAMIC_SECTION: "dynamic-section",
});

const MODEL_MAP = {
  [MODERATION_MODULES.CELEBRITY]: Celebraty,
  [MODERATION_MODULES.CUSTOM_OPTION]: CustomSection,
  [MODERATION_MODULES.ELECTION]: Election,
  [MODERATION_MODULES.MOVIE]: Movie,
  [MODERATION_MODULES.POSITION]: Positions,
  [MODERATION_MODULES.REFERENCE]: Reference,
  [MODERATION_MODULES.RELATION]: RelatedPersonality,
  [MODERATION_MODULES.SERIES]: Series,
  [MODERATION_MODULES.TIMELINE]: Timeline,
  [MODERATION_MODULES.TRIVIA]: TriviaEntries,
  [MODERATION_MODULES.TRIVIA_ENTRIES]: TriviaEntries,  // ✅ Added mapping for triviaentries
};

const getModelByModule = async (module, options = {}) => {
  if (module === MODERATION_MODULES.DYNAMIC_SECTION) {
    const { sectionId } = options;

    if (!sectionId) return null;

    const section = await SectionMaster.findById(sectionId);
    if (!section) return null;

    const collectionName = section.name.toLowerCase();

    return (
      mongoose.models[collectionName] ||
      mongoose.model(collectionName, new mongoose.Schema({}, { strict: false }))
    );
  }

  return MODEL_MAP[module] || null;
};

module.exports = {
  MODERATION_MODULES,
  getModelByModule,
};