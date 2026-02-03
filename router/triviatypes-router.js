const express = require("express");
const router = express.Router();
const TriviaTypes = require("../controllers/triviatypes-controller");
const authenticate = require("../middlewares/auth-middleware");
const { checkPrivilege } = require("../middlewares/privilege-middleware");
const { RESOURCES, OPERATIONS } = require("../utils/constant/privilege-constant");
const  validate  = require("../middlewares/validate.middleware");
const {
  createTriviaTypeSchema,
  updateTriviaTypeSchema,
  updateStatusSchema,
  getTriviaTypeByIdSchema,
  deleteTriviaTypeSchema,
  getAllTriviaTypesSchema
} = require("../validations/trivia-type.validation");


router.use(authenticate);

/**
 * @route   POST /api/triviatypes/addTriviaTypes
 * @desc    Create a new trivia type
 * @access  Private - Requires ADD permission on TRIVIA_TYPES resource
 * @body    { name }
 */
router.post(
  "/addTriviaTypes",
  validate(createTriviaTypeSchema),
  checkPrivilege(RESOURCES.TRIVIA_TYPE, OPERATIONS.ADD),
  TriviaTypes.addTriviaTypes
);

/**
 * @route   GET /api/triviatypes/getdataTriviaTypes
 * @desc    Get all trivia types
 * @access  Private - Anyone with access to trivia types resource
 * @query   { page?, limit?, search? }
 */
router.get(
  "/getdataTriviaTypes",
  validate(getAllTriviaTypesSchema),
  checkPrivilege(RESOURCES.TRIVIA_TYPE, OPERATIONS.ADD), // ✅ ADD permission includes read access
  TriviaTypes.getdataTriviaTypes
);

/**
 * @route   GET /api/triviatypes/getTriviaTypesByid/:id
 * @desc    Get a single trivia type by ID
 * @access  Private - Anyone with access to trivia types resource
 * @params  id - Trivia Type ID
 */
router.get(
  "/getTriviaTypesByid/:id",
  validate(getTriviaTypeByIdSchema),
  checkPrivilege(RESOURCES.TRIVIA_TYPE, OPERATIONS.ADD), // ✅ ADD permission includes read access
  TriviaTypes.getTriviaTypesByid
);

/**
 * @route   PATCH /api/triviatypes/updateTriviaTypes/:id
 * @desc    Update an existing trivia type
 * @access  Private - Requires EDIT permission on TRIVIA_TYPES resource
 * @params  id - Trivia Type ID
 * @body    { name?, status? }
 */
router.patch(
  "/updateTriviaTypes/:id",
  validate(updateTriviaTypeSchema),
  checkPrivilege(RESOURCES.TRIVIA_TYPE, OPERATIONS.EDIT),
  TriviaTypes.updateCategory
);

/**
 * @route   DELETE /api/triviatypes/deleteTriviaTypes/:id
 * @desc    Delete a trivia type
 * @access  Private - Requires DELETE permission on TRIVIA_TYPES resource
 * @params  id - Trivia Type ID
 */
router.delete(
  "/deleteTriviaTypes/:id",
  validate(deleteTriviaTypeSchema),
  checkPrivilege(RESOURCES.TRIVIA_TYPE, OPERATIONS.DELETE),
  TriviaTypes.deleteTriviaTypes
);

/**
 * @route   PATCH /api/triviatypes/update-statusTriviaTypes
 * @desc    Update trivia type status (active/inactive)
 * @access  Private - Requires EDIT permission on TRIVIA_TYPES resource
 * @body    { id, status }
 */
router.patch(
  "/update-statuscategory",
  validate(updateStatusSchema),
  checkPrivilege(RESOURCES.TRIVIA_TYPE, OPERATIONS.EDIT),
  TriviaTypes.updateStatusCategory
);

/**
 * @route   GET /api/triviatypes/categoryOptions
 * @desc    Get active trivia types for dropdown options
 * @access  Private - Anyone with access to trivia types resource
 */
router.get(
  "/categoryOptions",
  checkPrivilege(RESOURCES.TRIVIA_TYPE, OPERATIONS.ADD), 
  TriviaTypes.categoryOptions
);

module.exports = router;