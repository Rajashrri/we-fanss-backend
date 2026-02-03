const express = require("express");
const router = express.Router();
const SocialLink = require("../controllers/sociallink-controller");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const  validate  = require("../middlewares/validate.middleware");
const {
  createSocialLinkSchema,
  updateSocialLinkSchema,
  updateStatusSchema,
  getSocialLinkByIdSchema,
  deleteSocialLinkSchema,
  getAllSocialLinksSchema
} = require("../validations/social-link.validation");

router.use(authenticate)


/**
 * @route   POST /api/sociallink/addSocialLink
 * @desc    Create a new social link
 * @access  Private - Requires ADD permission on SOCIAL_LINKS resource
 * @body    { name }
 */
router.post(
  "/addSocialLink",
  validate(createSocialLinkSchema),
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.ADD),
  SocialLink.addSocialLink
);

/**
 * @route   GET /api/sociallink/getdataSocialLink
 * @desc    Get all social links
 * @access  Private - Anyone with access to social links resource
 * @query   { page?, limit?, search? }
 */
router.get(
  "/getdataSocialLink",
  validate(getAllSocialLinksSchema),
  SocialLink.getdataSocialLink
);

/**
 * @route   GET /api/sociallink/getSocialLinkByid/:id
 * @desc    Get a single social link by ID
 * @access  Private - Anyone with access to social links resource
 * @params  id - Social Link ID
 */
router.get(
  "/getSocialLinkByid/:id",
  validate(getSocialLinkByIdSchema),
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.ADD),
  SocialLink.getSocialLinkByid
);

/**
 * @route   PATCH /api/sociallink/updateSocialLink/:id
 * @desc    Update an existing social link
 * @access  Private - Requires EDIT permission on SOCIAL_LINKS resource
 * @params  id - Social Link ID
 * @body    { name }
 */
router.patch(
  "/updateSocialLink/:id",
  validate(updateSocialLinkSchema),
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.EDIT),
  SocialLink.updateCategory
);

/**
 * @route   DELETE /api/sociallink/deleteSocialLink/:id
 * @desc    Delete a social link
 * @access  Private - Requires DELETE permission on SOCIAL_LINKS resource
 * @params  id - Social Link ID
 */
router.delete(
  "/deleteSocialLink/:id",
  validate(deleteSocialLinkSchema),
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.DELETE),
  SocialLink.deleteSocialLink
);

/**
 * @route   PATCH /api/sociallink/update-statuscategory
 * @desc    Update social link status (active/inactive)
 * @access  Private - Requires EDIT permission on SOCIAL_LINKS resource
 * @body    { id, status }
 */
router.patch(
  "/update-statuscategory",
  validate(updateStatusSchema),
  checkPrivilege(RESOURCES.SOCIAL_LINK, OPERATIONS.EDIT),
  SocialLink.updateStatusCategory
);

module.exports = router;