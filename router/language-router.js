const express = require("express");
const router = express.Router();
const languageController = require("../controllers/language-controller");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const validate = require("../middlewares/validate.middleware");
const {
  createLanguageSchema,
  updateLanguageSchema,
  getLanguageSchema,
  deleteLanguageSchema,
  getAllLanguagesSchema
} = require("../validations/language.validation");

// ✅ Apply authentication to all routes
router.use(authenticate);

/**
 * @route   POST /api/language/addlanguage
 * @desc    Create a new language
 * @access  Private - Requires ADD permission on LANGUAGE resource
 * @body    { name, code, slug? }
 */
router.post(
  "/addlanguage",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.ADD),
  validate(createLanguageSchema),
  languageController.addLanguage
);

/**
 * @route   GET /api/language/getdatalanguage
 * @desc    Get all languages
 * @access  Private - Requires VIEW permission on LANGUAGE resource
 * @query   { page?, limit?, status?, search? }
 */
router.get(
  "/getdatalanguage",
  validate(getAllLanguagesSchema),
  languageController.getDataLanguage
);

/**
 * @route   GET /api/language/getlanguageByid/:id
 * @desc    Get a single language by ID
 * @access  Private - Requires VIEW permission on LANGUAGE resource
 * @params  id - Language ID
 */
router.get(
  "/getlanguageByid/:id",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.EDIT),
  validate(getLanguageSchema),
  languageController.getLanguageById
);

/**
 * @route   GET /api/language/options
 * @desc    Get active languages for dropdown options
 * @access  Private - Requires VIEW permission on LANGUAGE resource
 */
router.get(
  "/options",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.EDIT),
  languageController.getLanguageOptions
);

/**
 * @route   PATCH /api/language/updatelanguage/:id
 * @desc    Update an existing language (name, code, slug, status)
 * @access  Private - Requires EDIT permission on LANGUAGE resource
 * @params  id - Language ID
 * @body    { name?, code?, slug?, status? }
 */
router.patch(
  "/updatelanguage/:id",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.EDIT),
  validate(updateLanguageSchema),
  languageController.updateLanguage
);

/**
 * @route   PATCH /api/language/update-status/:id
 * @desc    Update language status only
 * @access  Private - Requires EDIT permission on LANGUAGE resource
 * @params  id - Language ID
 * @body    { status }
 */
router.patch(
  "/update-status/:id",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.EDIT),
  languageController.updateLanguageStatus
);

/**
 * @route   DELETE /api/language/deletelanguage/:id
 * @desc    Delete a language
 * @access  Private - Requires DELETE permission on LANGUAGE resource
 * @params  id - Language ID
 */
router.delete(
  "/deletelanguage/:id",
  checkPrivilege(RESOURCES.LANGUAGE, OPERATIONS.DELETE),
  validate(deleteLanguageSchema),
  languageController.deleteLanguage
);

module.exports = router;