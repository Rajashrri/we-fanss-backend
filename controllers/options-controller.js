const createHttpError = require('http-errors');
const { Celebraty: Celebrity } = require('../models/celebraty-model');
const { Language } = require('../models/language-model');
const { SocialLink } = require('../models/sociallink-model');
const { TriviaTypes } = require('../models/triviatypes-model');

/**
 * Get celebrity options (id and label)
 * @route POST /api/options/celebrities
 * @body excludeList - array of celebrity IDs to exclude (OPTIONAL)
 */
const getCelebrityOptions = async (req, res, next) => {
  try {
    const { excludeList } = req.body;

    // Build filter - only active celebrities
    const filter = { status: 1 };

    // Add exclude filter ONLY if excludeList is provided and is a valid array
    if (excludeList && Array.isArray(excludeList) && excludeList.length > 0) {
      filter._id = { $nin: excludeList };
    }

    const celebrities = await Celebrity.find(filter)
      .select('_id identityProfile.name')
      .sort({ 'identityProfile.name': 1 })
      .lean();

    // Format response
    const options = celebrities.map(celebrity => ({
      id: celebrity._id,
      label: celebrity.identityProfile?.name || 'Unknown',
    }));

    return res.status(200).json({
      success: true,
      message: 'Celebrity options retrieved successfully',
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get language options (id and label)
 * @route POST /api/options/languages
 * @body excludeList - array of language IDs to exclude (OPTIONAL)
 */
const getLanguageOptions = async (req, res, next) => {
  try {
    const { excludeList } = req.body;

    // Build filter - only active languages
    const filter = { status: 1 };

    // Add exclude filter ONLY if excludeList is provided and is a valid array
    if (excludeList && Array.isArray(excludeList) && excludeList.length > 0) {
      filter._id = { $nin: excludeList };
    }

    const languages = await Language.find(filter)
      .select('_id name code')
      .sort({ name: 1 })
      .lean();

    // Format response
    const options = languages.map(language => ({
      id: language._id,
      label: `${language.name} (${language.code})`,
    }));

    return res.status(200).json({
      success: true,
      message: 'Language options retrieved successfully',
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get social link options (id and label)
 * @route POST /api/options/social-links
 * @body excludeList - array of social link IDs to exclude (OPTIONAL)
 */
const getSocialLinkOptions = async (req, res, next) => {
  try {
    const { excludeList } = req.body;

    // Build filter - only active social links
    const filter = { status: 1 };

    // Add exclude filter ONLY if excludeList is provided and is a valid array
    if (excludeList && Array.isArray(excludeList) && excludeList.length > 0) {
      filter._id = { $nin: excludeList };
    }

    const socialLinks = await SocialLink.find(filter)
      .select('_id name')
      .sort({ name: 1 })
      .lean();

    // Format response
    const options = socialLinks.map(link => ({
      id: link._id,
      label: link.name,
    }));

    return res.status(200).json({
      success: true,
      message: 'Social link options retrieved successfully',
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get trivia type options (id and label)
 * @route POST /api/options/trivia-types
 * @body excludeList - array of trivia type IDs to exclude (OPTIONAL)
 */
const getTriviaTypeOptions = async (req, res, next) => {
  try {
    const { excludeList } = req.body;

    // Build filter - only active trivia types
    const filter = { status: 1 };

    // Add exclude filter ONLY if excludeList is provided and is a valid array
    if (excludeList && Array.isArray(excludeList) && excludeList.length > 0) {
      filter._id = { $nin: excludeList };
    }

    const triviaTypes = await TriviaTypes.find(filter)
      .select('_id name')
      .sort({ name: 1 })
      .lean();

    // Format response
    const options = triviaTypes.map(type => ({
      id: type._id,
      label: type.name,
    }));

    return res.status(200).json({
      success: true,
      message: 'Trivia type options retrieved successfully',
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCelebrityOptions,
  getLanguageOptions,
  getSocialLinkOptions,
  getTriviaTypeOptions,
};