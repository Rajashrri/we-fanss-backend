// middleware/privilege.middleware.js
const Privilege = require("../models/previlege-model");
const { STATIC_ROLES } = require("../config/role-config");

/**
 * ✅ Middleware: Check if user has permission for specific resource and operation
 * Usage: checkPrivilege(RESOURCES.CELEBRITY, OPERATIONS.ADD)
 */
const checkPrivilege = (resource, operation) => {
  return async (req, res, next) => {
    try {
      const { roleName, roleId } = req.user;

      console.log("🔍 Checking privilege for:", { roleName, roleId, resource, operation });

      // ✅ Super Admin has access to everything
      if (roleName === STATIC_ROLES.SUPER_ADMIN) {
        console.log("✅ Super Admin - Full access granted");
        return next();
      }

      // ✅ Find privilege for the user's role
      const privilege = await Privilege.findOne({
        roleId: roleId,
        isActive: true
      }).lean();

      console.log("📋 Privilege found:", privilege);

      if (!privilege) {
        return res.status(403).json({
          success: false,
          message: "No privileges found for your role"
        });
      }

      // ✅ Check if permission exists for resource
      const permission = privilege.permissions.find(
        (perm) => perm.resource === resource
      );

      console.log("🔑 Permission for resource:", permission);

      if (!permission) {
        return res.status(403).json({
          success: false,
          message: `You don't have access to ${resource}`
        });
      }

      // ✅ Check if operation is allowed
      const operations = permission.operations;
      
      // 🔥 IMPROVED: More defensive checks
      if (!operations || typeof operations !== 'object') {
        return res.status(403).json({
          success: false,
          message: `Invalid permission configuration for ${resource}`
        });
      }

      // 🔥 IMPROVED: Explicit true check
      if (operations[operation] !== true) {
        // Get list of enabled operations for better error message
        const enabledOps = Object.entries(operations)
          .filter(([_, enabled]) => enabled === true)
          .map(([op, _]) => op);
        
        return res.status(403).json({
          success: false,
          message: `You don't have permission to ${operation} ${resource}. Available operations: ${enabledOps.join(', ') || 'none'}`
        });
      }

      console.log("✅ Permission granted");
      next();
    } catch (error) {
      console.error("❌ Privilege check error:", error);
      return res.status(500).json({
        success: false,
        message: "Error checking privileges",
        error: error.message
      });
    }
  };
};

module.exports = { checkPrivilege };