// middleware/require-role.middleware.js
const { STATIC_ROLES } = require("../utils/constant/role-constant");

/**
 * ✅ Middleware: Check if user has one of the required roles
 * Usage: requireRole([STATIC_ROLES.SUPER_ADMIN, 'Admin', 'Manager'])
 * Use cases: login history, activity logs, specific module access
 */
const requireRole = (allowedRoles = []) => {
  return async (req, res, next) => {
    try {
      // ✅ Changed: Use roleName instead of role
      const { roleName } = req.user;

      console.log(req.user);

      if (!roleName) {
        return res.status(403).json({
          success: false,
          message: "Role not found"
        });
      }

      console.log(allowedRoles, roleName);
      
     
      if (!allowedRoles.includes(roleName)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required roles: ${allowedRoles.join(", ")}`
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error checking role requirements",
        error: error.message
      });
    }
  };
};

module.exports = { requireRole };