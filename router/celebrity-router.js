const express = require("express");
const router = express.Router();
const Celebraty = require("../controllers/celebraty-controller");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const authenticate = require("../middlewares/auth-middleware");
const validate = require("../middlewares/validate.middleware");
const { createUpload } = require("../utils/upload");
const {
  createCelebratySchema,
  updateCelebratySchema,
  updateStatusCelebratySchema,
  getCelebratyByIdSchema,
  deleteCelebratySchema,
  getAllCelebratySchema,
  getCelebratySectionsByCelebSchema,
} = require("../validations/celebrity.validation");
const { parseNestedFormData } = require("../middlewares/formdata-parser.middleware");


const celebrityUpload = createUpload('celebrity');

// ✅ Apply authentication to all routes
router.use(authenticate);

/**
 * @route   GET /api/celebrity/professionsOptions
 * @desc    Get profession options for dropdown
 * @access  Private
 */
router.get(
  "/professionsOptions",
  Celebraty.professionsOptions
);

/**
 * @route   GET /api/celebrity/sociallist
 * @desc    Get social link options for dropdown
 * @access  Private
 */
router.get(
  "/sociallist",
  Celebraty.sociallist
);

/**
 * @route   GET /api/celebrity/professions
 * @desc    Get all professions
 * @access  Private
 */
router.get(
  "/professions",
  Celebraty.getProfessions
);

/**
 * @route   GET /api/celebrity/fetchSectionTemplate
 * @desc    Get section templates for celebrity sections
 * @access  Private
 */
router.get(
  "/fetchSectionTemplate",
  Celebraty.getSectionTemplates
);

/**
 * @route   GET /api/celebrity/languageOptions
 * @desc    Get language options for dropdown
 * @access  Private
 */
router.get(
  "/languageOptions",
  Celebraty.languageOptions
);



/**
 * @route   GET /api/celebrity/getSectionMasters
 * @desc    Get all section master types
 * @access  Private
 */
router.get(
  "/getSectionMasters",
  Celebraty.getSectionMasters
);

/**
 * @route   GET /api/celebrity/getcelebraties
 * @desc    Get all celebrities with pagination and filters
 * @access  Private
 * @query   { page?, limit?, search?, profession?, language?, gender?, status? }
 */
router.get(
  "/getcelebraties",
  validate(getAllCelebratySchema),
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.ADD),
  Celebraty.getdata
);

/**
 * @route   GET /api/celebrity/getcelebratyByid/:id
 * @desc    Get a single celebrity by ID with full details
 * @access  Private
 * @params  id - Celebrity ID
 */
router.get(
  "/getcelebratyByid/:id",
  validate(getCelebratyByIdSchema),
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.ADD),
  Celebraty.getcelebratyByid
);

/**
 * @route   GET /api/celebrity/getCelebratySectionsByCeleb/:celebratyId
 * @desc    Get all sections for a specific celebrity
 * @access  Private
 * @params  celebratyId - Celebrity ID
 */
router.get(
  "/getCelebratySectionsByCeleb/:celebratyId",
  validate(getCelebratySectionsByCelebSchema),
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.ADD),
  Celebraty.getCelebratySectionsByCeleb
);

/**
 * @route   POST /api/celebrity/addcelebraty
 * @desc    Create a new celebrity with image and gallery upload
 * @access  Private - Requires ADD permission on CELEBRITY resource
 * @body    { name, shortinfo, biography, templates?, sections?, professions?, languages?, gender?, dob?, socialLinks?, status? }
 * @files   image (single), gallery (multiple - max 10)
 */

router.post(
  "/addcelebraty",
  celebrityUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  parseNestedFormData, 
  
  validate(createCelebratySchema),
 Celebraty.addcelebraty
);

/**
 * @route   PATCH /api/celebrity/updatecelebraty/:id
 * @desc    Update an existing celebrity with optional image/gallery update
 * @access  Private - Requires EDIT permission on CELEBRITY resource
 * @params  id - Celebrity ID
 * @body    { name?, shortinfo?, biography?, templates?, sections?, professions?, languages?, gender?, dob?, socialLinks?, status? }
 * @files   image? (single), gallery? (multiple - max 10)
 */
router.patch(
  "/updatecelebraty/:id",
  celebrityUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "gallery", maxCount: 10 },
  ]),
  parseNestedFormData,
  validate(updateCelebratySchema),
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.EDIT),
  Celebraty.updatecelebraty
);

/**
 * @route   PATCH /api/celebrity/update-statuscelebraty
 * @desc    Update celebrity status (active/inactive)
 * @access  Private - Requires EDIT permission on CELEBRITY resource
 * @body    { id, status }
 */
router.patch(
  "/update-statuscelebraty",
  validate(updateStatusCelebratySchema),
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.EDIT),
  Celebraty.updateStatus
);

/**
 * @route   DELETE /api/celebrity/deletecelebraty/:id
 * @desc    Delete a celebrity
 * @access  Private - Requires DELETE permission on CELEBRITY resource
 * @params  id - Celebrity ID
 */
router.delete(
  "/deletecelebraty/:id",
  validate(deleteCelebratySchema),
  checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.DELETE),
  Celebraty.deletecelebraty
);

module.exports = router;