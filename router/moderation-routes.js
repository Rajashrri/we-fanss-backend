const express = require("express");
const router = express.Router();
const moderationController = require("../controllers/generic-moderation-controller");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { PRIVILEGE_RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const checkModerationPrivilege = require("../middlewares/checkModerationPrivilege");

// ✅ Apply authentication to all moderation routes
router.use(authenticate);


/**
 * @route   GET /api/moderation/celebrity/:id/pending-summary
 * @desc    Get all pending counts per module for a specific celebrity
 * @access  Private - Requires EDIT permission (Reviewer/Admin)
 * @params  id - Celebrity ID
 * 
 * @example GET /api/moderation/celebrity/507f1f77bcf86cd799439011/pending-summary
 * @response {
 *   "celebrityId": "507f1f77bcf86cd799439011",
 *   "pendingCounts": {
 *     "timeline": 3,
 *     "trivia": 5,
 *     "movie": 2
 *   }
 * }
 */
router.get(
  "/celebrity/:id/pending-summary",
  checkPrivilege(PRIVILEGE_RESOURCES.CELEBRITY_PROFESSION_SECTIONS, OPERATIONS.VIEW),
  moderationController.getCelebrityPendingSummary
);



/**
 * @route   GET /api/moderation/:module/pending
 * @desc    Get all pending items for review (works for any module)
 * @access  Private - Requires EDIT permission (Reviewer/Admin)
 * @params  module - Module name (celebrity, movie, series, timeline, trivia, etc.)
 * @query   { page?, limit?, search?, celebrity? }
 * 
 * @example GET /api/moderation/movie/pending?page=1&limit=10
 * @example GET /api/moderation/timeline/pending?celebrity=507f1f77bcf86cd799439011
 */
router.get(
  "/:module/pending",
  checkPrivilege(PRIVILEGE_RESOURCES.CELEBRITY_PROFESSION_SECTIONS, OPERATIONS.EDIT),
  moderationController.getPendingItems
);

/**
 * @route   GET /api/moderation/:module/stats
 * @desc    Get moderation statistics (PENDING, PUBLISHED, REJECTED counts)
 * @access  Private - Requires EDIT permission (Reviewer/Admin)
 * @params  module - Module name (celebrity, movie, series, timeline, trivia, etc.)
 * 
 * @example GET /api/moderation/movie/stats
 * @example GET /api/moderation/trivia/stats
 */
router.get(
  "/:module/stats",
  checkPrivilege(PRIVILEGE_RESOURCES.CELEBRITY_PROFESSION_SECTIONS, OPERATIONS.EDIT),
  moderationController.getModerationStats
);

/**
 * @route   GET /api/moderation/:module/all
 * @desc    Get all items with optional moderation state filter
 * @access  Private - Requires EDIT permission (Reviewer/Admin)
 * @params  module - Module name (celebrity, movie, series, timeline, trivia, etc.)
 * @query   { page?, limit?, search?, celebrity?, moderationState? }
 * 
 * @example GET /api/moderation/movie/all?moderationState=PUBLISHED
 * @example GET /api/moderation/timeline/all?moderationState=REJECTED
 */
router.get(
  "/:module/all",
  checkPrivilege(PRIVILEGE_RESOURCES.CELEBRITY_PROFESSION_SECTIONS, OPERATIONS.EDIT),
  moderationController.getAllItems
);

/**
 * @route   PATCH /api/moderation/:module/publish/:id
 * @desc    Publish an item (approve and make it live)
 * @access  Private - Requires EDIT permission (Reviewer/Admin)
 * @params  module - Module name (celebrity, movie, series, timeline, trivia, etc.)
 * @params  id - Item ID
 * 
 * @example PATCH /api/moderation/movie/publish/507f1f77bcf86cd799439011
 * @example PATCH /api/moderation/timeline/publish/507f1f77bcf86cd799439012
 */
router.patch(
  "/:module/publish/:id",
  checkModerationPrivilege(OPERATIONS.PUBLISH),
  moderationController.publishItem
);

/**
 * @route   PATCH /api/moderation/:module/reject/:id
 * @desc    Reject an item with optional reason
 * @access  Private - Requires EDIT permission (Reviewer/Admin)
 * @params  module - Module name (celebrity, movie, series, timeline, trivia, etc.)
 * @params  id - Item ID
 * @body    { rejectionReason? }
 * 
 * @example PATCH /api/moderation/movie/reject/507f1f77bcf86cd799439011
 *          Body: { "rejectionReason": "Incomplete information" }
 */
router.patch(
  "/:module/reject/:id",
  checkPrivilege(OPERATIONS.PUBLISH),
  moderationController.rejectItem
);

module.exports = router;