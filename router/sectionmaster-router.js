const express = require("express");
const router = express.Router();
const SectionMasterController = require("../controllers/sectionmaster-controller");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const validate = require("../middlewares/validate.middleware");
const {
  createSectionMasterSchema,
  updateSectionMasterSchema,
  updateStatusSectionMasterSchema,
  getSectionMasterByIdSchema,
  deleteSectionMasterSchema,
  getAllSectionMasterSchema,
} = require("../validations/section.validation");

router.use(authenticate);

/**
 * @route   POST /api/sectionmaster/addsectionmaster
 * @desc    Create a new section master
 * @access  Private - Requires ADD permission on SECTION_TYPE resource
 * @body    { name, layout?, isRepeater?, fieldsConfig }
 */
router.post(
  "/addsectionmaster",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.ADD),
  validate(createSectionMasterSchema),
  SectionMasterController.addsectionmaster
);

/**
 * @route   PATCH /api/sectionmaster/updatesectionmaster/:id
 * @desc    Update an existing section master
 * @access  Private - Requires EDIT permission on SECTION_TYPE resource
 * @params  id - Section Master ID
 * @body    { name?, layout?, isRepeater?, fieldsConfig? }
 */
router.patch(
  "/updatesectionmaster/:id",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.EDIT),
  validate(updateSectionMasterSchema),
  SectionMasterController.updatesectionmaster
);

/**
 * @route   GET /api/sectionmaster/getdata
 * @desc    Get all section masters with pagination
 * @access  Private - Requires ADD permission on SECTION_TYPE resource
 * @query   { page?, limit?, search? }
 */
router.get(
  "/getdata",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.ADD),
  validate(getAllSectionMasterSchema),
  SectionMasterController.getdata
);

/**
 * @route   GET /api/sectionmaster/getsectionmasterByid/:id
 * @desc    Get a single section master by ID
 * @access  Private - Requires ADD permission on SECTION_TYPE resource
 * @params  id - Section Master ID
 */
router.get(
  "/getsectionmasterByid/:id",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.ADD),
  validate(getSectionMasterByIdSchema),
  SectionMasterController.getsectionmasterByid
);

/**
 * @route   DELETE /api/sectionmaster/deletesectionmaster/:id
 * @desc    Delete a section master
 * @access  Private - Requires DELETE permission on SECTION_TYPE resource
 * @params  id - Section Master ID
 */
router.delete(
  "/deletesectionmaster/:id",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.DELETE),
  validate(deleteSectionMasterSchema),
  SectionMasterController.deletesectionmaster
);

/**
 * @route   PATCH /api/sectionmaster/updateStatus
 * @desc    Update section master status (active/inactive)
 * @access  Private - Requires EDIT permission on SECTION_TYPE resource
 * @body    { id, status }
 */
router.patch(
  "/updateStatus",
  checkPrivilege(RESOURCES.SECTION_TYPE, OPERATIONS.EDIT),
  validate(updateStatusSectionMasterSchema),
  SectionMasterController.updateStatus
);

module.exports = router;