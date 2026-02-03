// routes/userManagementRoutes.js
const express = require("express");
const router = express.Router();

// Middleware
const authenticate = require("../middlewares/auth-middleware");
const validate = require("../middlewares/validate.middleware");

// Schemas
const {
  getUsersSchema,
  getUserByIdSchema,
  updateUserRoleSchema,
  updateUserStatusSchema,
  deleteUserSchema,
} = require("../shared/schema/usermanagement-schema");

// Controllers
const {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
} = require("../controllers/usermanagement-controller");

// All routes require authentication
router.use(authenticate);

/**
 * @route   GET /api/users
 * @desc    Get all users with pagination and filters
 * @access  Admin only
 */
router.get(
  "/",
  validate(getUsersSchema),
  getAllUsers
);

/**
 * @route   GET /api/users/:id
 * @desc    Get single user by ID
 * @access  Admin only
 */
router.get(
  "/:id",
//   validate(getUserByIdSchema),
  getUserById
);

/**
 * @route   PATCH /api/users/:id/role
 * @desc    Update user role
 * @access  Admin only
 */
router.patch(
  "/:id/role",
  // validate(updateUserRoleSchema),
  updateUserRole
);

/**
 * @route   PATCH /api/users/:id/status
 * @desc    Activate/Deactivate user
 * @access  Admin only
 */
router.patch(
  "/:id/status",
  validate(updateUserStatusSchema),
  updateUserStatus
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user
 * @access  Admin only
 */
router.delete(
  "/:id",
  deleteUser
);

module.exports = router;