const express = require("express");
const router = express.Router();
const {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  updateRoleStatus,
  deleteRole,
} = require("../controllers/role-controller");
const {requireRole} = require("../middlewares/require-role-middleware")
const validate = require("../middlewares/validate.middleware");
const {
  createRoleSchema,
  updateRoleSchema,
  updateRoleStatusSchema,
} = require("../shared/schema/role-schema");

const authMiddleware = require("../middlewares/auth-middleware");
const { STATIC_ROLES } = require("../config/role-config");

/**
 * @route   POST /api/roles
 * @desc    Create a new role with default privileges
 * @access  Private - Requires authentication
 * @body    { name: string, description?: string }
 */
router.post(
  "/",
  authMiddleware,
  validate(createRoleSchema),
   requireRole([STATIC_ROLES.SUPER_ADMIN , STATIC_ROLES.ADMIN]),
  createRole
);

/**
 * @route   GET /api/roles
 * @desc    Get all non-system roles
 * @access  Private - Requires SUPER_ADMIN role
 * @returns Array of roles with creator/updater details
 */
router.get(
  "/",
  authMiddleware,
  requireRole([STATIC_ROLES.SUPER_ADMIN , STATIC_ROLES.ADMIN]),
  getAllRoles
);

/**
 * @route   GET /api/roles/:id
 * @desc    Get a specific role by ID (non-system roles only)
 * @access  Private - Requires SUPER_ADMIN or ADMIN role
 * @params  id: string - Role ID
 * @returns Single role object with creator/updater details
 */
router.get(
  "/:id",
  authMiddleware,
   requireRole([STATIC_ROLES.SUPER_ADMIN , STATIC_ROLES.ADMIN]),
  getRoleById
);

/**
 * @route   PUT /api/roles/:id
 * @desc    Update role details (name and/or description)
 * @access  Private - Requires authentication
 * @params  id: string - Role ID
 * @body    { name?: string, description?: string }
 * @note    System roles are protected - returns 404 if attempted
 */
router.put(
  "/:id",
  authMiddleware,
  validate(updateRoleSchema),
  updateRole
);

/**
 * @route   PATCH /api/roles/:id/status
 * @desc    Update role status (active/inactive)
 * @access  Private - Requires authentication
 * @params  id: string - Role ID
 * @body    { status: number - 0 (inactive) or 1 (active) }
 * @note    System roles are protected - returns 404 if attempted
 */
router.patch(
  "/:id/status",
  authMiddleware,
  validate(updateRoleStatusSchema),
  updateRoleStatus
);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Delete a role and its associated privileges
 * @access  Private - Requires authentication
 * @params  id: string - Role ID
 * @note    System roles are protected - returns 404 if attempted
 */
router.delete(
  "/:id",
  authMiddleware,
  deleteRole
);

module.exports = router;