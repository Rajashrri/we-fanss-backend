const express = require("express");
const router = express.Router();
const Celebraty = require("../controllers/celebraty-controller");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const {
  OPERATIONS,
  PRIVILEGE_RESOURCES,
} = require("../utils/constant/privilege-constant");
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
  updateFeaturedCelebratySchema,
  getCelebratySectionsByCelebSchema,
} = require("../validations/celebrity.validation");
const {
  parseNestedFormData,
} = require("../middlewares/formdata-parser.middleware");

const celebrityUpload = createUpload("celebrity");

// ✅ Apply authentication to all routes

/**
 * @route   GET /api/celebrity/professionsOptions
 * @desc    Get profession options for dropdown
 * @access  Private
 */
router.get("/professionsOptions", Celebraty.professionsOptions);

/**
 * @route   GET /api/celebrity/sociallist
 * @desc    Get social link options for dropdown
 * @access  Private
 */
router.get("/sociallist", Celebraty.sociallist);

/**
 * @route   GET /api/celebrity/professions
 * @desc    Get all professions
 * @access  Private
 */
router.get("/professions", Celebraty.getProfessions);
router.use(authenticate);

/**
 * @route   GET /api/celebrity/fetchSectionTemplate
 * @desc    Get section templates for celebrity sections
 * @access  Private
 */
router.get("/fetchSectionTemplate", Celebraty.getSectionTemplates);

/**
 * @route   GET /api/celebrity/languageOptions
 * @desc    Get language options for dropdown
 * @access  Private
 */
router.get("/languageOptions", Celebraty.languageOptions);

/**
 * @route   GET /api/celebrity/getSectionMasters
 * @desc    Get all section master types
 * @access  Private
 */
router.get("/getSectionMasters", Celebraty.getSectionMasters);

/**
 * @route   GET /api/celebrity/getcelebraties
 * @desc    Get all celebrities with pagination and filters
 * @access  Private - Requires VIEW permission on CELEBRITY_BASIC_INFO
 * @query   { page?, limit?, search?, profession?, language?, gender?, status?, moderationState? }
 */
router.get(
  "/getcelebraties",
  validate(getAllCelebratySchema),
  checkPrivilege(PRIVILEGE_RESOURCES.CELEBRITY_BASIC_INFO, [
    OPERATIONS.VIEW,
    OPERATIONS.PUBLISH,
  ]),
  Celebraty.getdata,
);

/**
 * @route   GET /api/celebrity/getcelebratyByid/:id
 * @desc    Get a single celebrity by ID with full details
 * @access  Private - Requires VIEW permission on CELEBRITY_BASIC_INFO
 * @params  id - Celebrity ID
 */
router.get(
  "/getcelebratyByid/:id",
  validate(getCelebratyByIdSchema),
  checkPrivilege(PRIVILEGE_RESOURCES.CELEBRITY_BASIC_INFO, [
    OPERATIONS.EDIT,
    OPERATIONS.PUBLISH,
  ]),
  Celebraty.getcelebratyByid,
);

/**
 * @route   GET /api/celebrity/getCelebratySectionsByCeleb/:celebratyId
 * @desc    Get all sections for a specific celebrity
 * @access  Private - Requires VIEW permission on CELEBRITY_BASIC_INFO
 * @params  celebratyId - Celebrity ID
 */
router.get(
  "/getCelebratySectionsByCeleb/:celebratyId",
  validate(getCelebratySectionsByCelebSchema),
  checkPrivilege(PRIVILEGE_RESOURCES.CELEBRITY_BASIC_INFO, OPERATIONS.VIEW),
  Celebraty.getCelebratySectionsByCeleb,
);

/**
 * @route   POST /api/celebrity/addcelebraty
 * @desc    Create a new celebrity with image and gallery upload
 * @access  Private - Requires ADD permission on CELEBRITY_BASIC_INFO resource
 * @body    { name, shortinfo, biography, templates?, sections?, professions?, languages?, gender?, dob?, socialLinks?, status? }
 * @files   image (single), gallery (multiple - max 10)
 */
router.post(
  "/addcelebraty",
  celebrityUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "categoryimage", maxCount: 1 }, // ✅ ADD THIS
    { name: "featuredimage", maxCount: 1 }, // ✅ ADD THIS

    { name: "gallery", maxCount: 50 },
  ]),
  parseNestedFormData,
  validate(createCelebratySchema),
  checkPrivilege(PRIVILEGE_RESOURCES.CELEBRITY_BASIC_INFO, OPERATIONS.ADD),
  Celebraty.addcelebraty,
);

/**
 * @route   PATCH /api/celebrity/updatecelebraty/:id
 * @desc    Update an existing celebrity with optional image/gallery update
 * @access  Private - Requires EDIT permission on CELEBRITY_BASIC_INFO resource
 * @params  id - Celebrity ID
 * @body    { name?, shortinfo?, biography?, templates?, sections?, professions?, languages?, gender?, dob?, socialLinks?, status? }
 * @files   image? (single), gallery? (multiple - max 10)
 */
router.patch(
  "/updatecelebraty/:id",
  celebrityUpload.fields([
    { name: "image", maxCount: 1 },
    { name: "categoryimage", maxCount: 1 }, // ✅ ADD THIS
    { name: "featuredimage", maxCount: 1 }, // ✅ ADD THIS

    { name: "gallery", maxCount: 50 },
  ]),
  parseNestedFormData,
  validate(updateCelebratySchema),
  checkPrivilege(PRIVILEGE_RESOURCES.CELEBRITY_BASIC_INFO, OPERATIONS.EDIT),
  Celebraty.updatecelebraty,
);

/**
 * @route   PATCH /api/celebrity/update-statuscelebraty
 * @desc    Update celebrity status (active/inactive)
 * @access  Private - Requires EDIT permission on CELEBRITY_BASIC_INFO resource
 * @body    { id, status }
 */
router.patch(
  "/update-statuscelebraty",
  validate(updateStatusCelebratySchema),
  checkPrivilege(PRIVILEGE_RESOURCES.CELEBRITY_BASIC_INFO, OPERATIONS.EDIT),
  Celebraty.updateStatus,
);


router.patch(
  "/update-celebratyfeatured",
  validate(updateFeaturedCelebratySchema),
  checkPrivilege(
    PRIVILEGE_RESOURCES.CELEBRITY_BASIC_INFO,
    OPERATIONS.EDIT
  ),
  Celebraty.updateCelebratyFeatured
);


/**
 * @route   DELETE /api/celebrity/deletecelebraty/:id
 * @desc    Delete a celebrity
 * @access  Private - Requires DELETE permission on CELEBRITY_BASIC_INFO resource
 * @params  id - Celebrity ID
 */
router.delete(
  "/deletecelebraty/:id",
  validate(deleteCelebratySchema),
  checkPrivilege(PRIVILEGE_RESOURCES.CELEBRITY_BASIC_INFO, OPERATIONS.DELETE),
  Celebraty.deletecelebraty,
);

module.exports = router;
