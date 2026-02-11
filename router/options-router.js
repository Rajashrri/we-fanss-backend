const express = require('express');
const router = express.Router();
const optionsController = require('../controllers/options-controller');
const authenticate = require('../middlewares/auth-middleware');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/options/celebrities
 * @desc    Get celebrity options (id and label)
 * @access  Private
 * @body    { excludeList?: string[] }
 */
router.post('/celebrities', optionsController.getCelebrityOptions);

/**
 * @route   POST /api/options/languages
 * @desc    Get language options (id and label)
 * @access  Private
 * @body    { excludeList?: string[] }
 */
router.post('/languages', optionsController.getLanguageOptions);

/**
 * @route   POST /api/options/social-links
 * @desc    Get social link options (id and label)
 * @access  Private
 * @body    { excludeList?: string[] }
 */
router.post('/social-links', optionsController.getSocialLinkOptions);

/**
 * @route   POST /api/options/trivia-types
 * @desc    Get trivia type options (id and label)
 * @access  Private
 * @body    { excludeList?: string[] }
 */
router.post('/trivia-types', optionsController.getTriviaTypeOptions);

/**
 * @route   POST /api/options/professions
 * @desc    Get profession options (id and label)
 * @access  Private
 * @body    { excludeList?: string[] }
 */
router.post('/professions', optionsController.getProfessionOptions);

/**
 * @route   POST /api/options/genres
 * @desc    Get genre master options (id and label)
 * @access  Private
 * @body    { excludeList?: string[] }
 */
router.post('/genres', optionsController.getGenreOptions);

module.exports = router;