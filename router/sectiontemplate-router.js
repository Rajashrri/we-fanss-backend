const express = require("express");
const router = express.Router();
const SectionTemplate = require("../controllers/sectiontemplate-controller");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const validate = require("../middlewares/validate.middleware");
const {
  createSectionTemplateSchema,
  updateSectionTemplateSchema,
  updateStatusSectionTemplateSchema,
  getSectionTemplateByIdSchema,
  deleteSectionTemplateSchema,
  getAllSectionTemplateSchema,
} = require("../validations/section-template.validation");

router.use(authenticate);

/**
 * @route   POST /api/sectiontemplate/addsectiontemplate
 * @desc    Create a new section template
 * @access  Private - Requires ADD permission on SECTION_TEMPLATE resource
 * @body    { title, sections, slug?, status? }
 */
router.post(
  "/addsectiontemplate",
  validate(createSectionTemplateSchema),
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.ADD),
  SectionTemplate.addsectiontemplate
);

/**
 * @route   GET /api/sectiontemplate/getdatasectiontemplate
 * @desc    Get all section templates with pagination and filters
 * @access  Private - Anyone with access to section template resource
 * @query   { page?, limit?, search? }
 */
router.get(
  "/getdatasectiontemplate",
  validate(getAllSectionTemplateSchema),
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.ADD),
  SectionTemplate.getdatasectiontemplate
);

/**
 * @route   GET /api/sectiontemplate/getsectiontemplateByid/:id
 * @desc    Get a single section template by ID
 * @access  Private - Anyone with access to section template resource
 * @params  id - Section Template ID
 */
router.get(
  "/getsectiontemplateByid/:id",
  validate(getSectionTemplateByIdSchema),
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.ADD),
  SectionTemplate.getsectiontemplateByid
);

/**
 * @route   PATCH /api/sectiontemplate/updatesectiontemplate/:id
 * @desc    Update an existing section template
 * @access  Private - Requires EDIT permission on SECTION_TEMPLATE resource
 * @params  id - Section Template ID
 * @body    { title?, sections?, slug?, status? }
 */
router.patch(
  "/updatesectiontemplate/:id",
  validate(updateSectionTemplateSchema),
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.EDIT),
  SectionTemplate.updateSectionTemplate
);

/**
 * @route   DELETE /api/sectiontemplate/deletesectiontemplate/:id
 * @desc    Delete a section template
 * @access  Private - Requires DELETE permission on SECTION_TEMPLATE resource
 * @params  id - Section Template ID
 */
router.delete(
  "/deletesectiontemplate/:id",
  validate(deleteSectionTemplateSchema),
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.DELETE),
  SectionTemplate.deletesectiontemplate
);

/**
 * @route   PATCH /api/sectiontemplate/update-statuscategory
 * @desc    Update section template status (active/inactive)
 * @access  Private - Requires EDIT permission on SECTION_TEMPLATE resource
 * @body    { id, status }
 */
router.patch(
  "/update-statuscategory",
  validate(updateStatusSectionTemplateSchema),
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.EDIT),
  SectionTemplate.updateStatusCategory
);

/**
 * @route   GET /api/sectiontemplate/sectionsOptions
 * @desc    Get active section templates for dropdown options
 * @access  Private - Anyone with access to section template resource
 */
router.get(
  "/sectionsOptions",
  checkPrivilege(RESOURCES.SECTION_TEMPLATE, OPERATIONS.ADD),
  SectionTemplate.sectionsOptions
);

module.exports = router;