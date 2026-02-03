const Privilege = require("../models/previlege-model");
const RoleModel = require("../models/role-model");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const { OPERATIONS, RESOURCES } = require('../utils/constant/privilege-constant');
const { STATIC_MODULE_ROLE } = require("../config/role-config");

/**
 * Get current user's privileges
 */

const getUserPrivileges = async (req, res, next) => {

  const EXCLUDE_MODULE = ["profession"]
  try {
    const { roleId, roleName, isSystemRole } = req.user;

    // Validate roleId
    if (!roleId || !mongoose.Types.ObjectId.isValid(roleId)) {
      throw createHttpError(400, "Invalid role ID format");
    }

    const role = {
      _id: roleId,
      name: roleName,
      is_system: isSystemRole
    };

    const privilegeData = await Privilege.findOne({
      roleId,
      isActive: true
    }).select("permissions isActive").lean();

    // ✅ Get static modules for system roles - SIMPLE!
    let staticModules = [];
    if (role.is_system && STATIC_MODULE_ROLE[roleName]) {
      staticModules = STATIC_MODULE_ROLE[roleName];
    }

    // ✅ If no privilege record found or permissions empty
    if (!privilegeData || !privilegeData.permissions || privilegeData.permissions.length === 0) {
      return res.status(200).json({
        success: true,
        message: role.is_system 
          ? "System role with default modules" 
          : "No privileges assigned to this role",
        data: {
          role,
          hasPermissions: staticModules.length > 0,
          isActive: privilegeData?.isActive || false,
          accessibleModules: staticModules,
          permissions: []
        }
      });
    }

    // ✅ Convert Map operations to plain objects for response
    const formattedPermissions = privilegeData.permissions.map(perm => ({
      resource: perm.resource,
      operations: perm.operations ? Object.fromEntries(Object.entries(perm.operations)) : {}
    }));

    // ✅ Only include modules where at least one operation is true
    const dynamicModules = privilegeData.permissions
      .filter(p => {
        if (!p.operations) return false;
        return Object.values(p.operations).some(Boolean);
      })
      .map(p => p.resource);

    // ✅ Merge static modules (for system roles) with dynamic modules
    const accessibleModules = [...new Set([...staticModules, ...dynamicModules])];

    return res.status(200).json({
      success: true,
      message: "User privileges retrieved successfully",
      data: {
        role,
        hasPermissions: true,
        isActive: privilegeData.isActive,
        accessibleModules,
        permissions: formattedPermissions
      }
    });

  } catch (error) {
    console.error("❌ Error in getUserPrivileges:", error);
    next(error);
  }
};


/**
 * Get privileges by role ID
 * ✅ Same response structure as getUserPrivileges
 */
const getPrivilegesByRoleId = async (req, res, next) => {
  const EXCLUDE_MODULES = ["profession"];
  
  try {
    const { id } = req.params;

    console.log("📥 Fetching privileges for roleId:", id);

    // Validate ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError(400, "Invalid role ID format");
    }

    // Get role info
    const role = await RoleModel.findById(id)
      .select("name slug status")
      .lean();

    console.log("👤 Role found:", role);

    if (!role) {
      throw createHttpError(404, "Role not found");
    }

    // Get privilege data
    const privilegeData = await Privilege.findOne({ roleId: id })
      .select("permissions isActive isLocked")
      .lean();

    console.log("🔐 Privilege data:", privilegeData);

    // ✅ If no privilege record found or permissions empty
    if (!privilegeData || !privilegeData.permissions || privilegeData.permissions.length === 0) {
      const response = {
        success: true,
        message: "No privileges assigned to this role",
        data: {
          role,
          hasPermissions: false,
          isActive: privilegeData?.isActive || false,
          isLocked: privilegeData?.isLocked || false,
          accessibleModules: [],
          permissions: []
        }
      };
      
      console.log("📤 Sending response (no permissions):", JSON.stringify(response, null, 2));
      return res.status(200).json(response);
    }

    // ✅ Filter out excluded modules
    const filteredPermissions = privilegeData.permissions.filter(perm => {
      if (!perm?.resource) return false;
      return !EXCLUDE_MODULES.includes(perm.resource.toLowerCase());
    });

    // ✅ Format ALL permissions - send everything to frontend
    const formattedPermissions = filteredPermissions.map(perm => {
      let operations = {};
      
      if (perm.operations instanceof Map) {
        operations = Object.fromEntries(perm.operations);
      } else if (perm.operations && typeof perm.operations === 'object') {
        operations = { ...perm.operations };
      }
      
      // Check if at least one operation is true
      const hasActiveOperation = Object.values(operations).some(value => value === true);
      
      return {
        resource: perm.resource,
        operations,
        isActive: hasActiveOperation // Frontend ke liye flag
      };
    });

    // ✅ Get only modules with active permissions (for accessibleModules list)
    const accessibleModules = formattedPermissions
      .filter(perm => perm.isActive)
      .map(perm => perm.resource);

    const response = {
      success: true,
      message: "Privileges retrieved successfully",
      data: {
        role,
        hasPermissions: formattedPermissions.length > 0,
        isActive: privilegeData.isActive,
        isLocked: privilegeData.isLocked,
        accessibleModules, // Only active modules
        permissions: formattedPermissions, // ALL permissions with isActive flag
        totalPermissions: formattedPermissions.length,
        activePermissions: accessibleModules.length
      }
    };

    console.log("📤 Sending final response:", JSON.stringify(response, null, 2));
    return res.status(200).json(response);
    
  } catch (error) {
    console.error("❌ Error in getPrivilegesByRoleId:", error);
    next(error);
  }
};
/**
 * Set/Update privileges for a role
 * ✅ Same response structure as getUserPrivileges
 */
const setPrivileges = async (req, res, next) => {
  try {
    const { id } = req.params; // roleId
    const { permissions } = req.body;

    console.log("📥 Updating privileges for roleId:", id);
    console.log("📥 Permissions payload:", JSON.stringify(permissions, null, 2));

    // Validate ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError(400, "Invalid role ID format");
    }

    // Validate permissions array
    if (!Array.isArray(permissions)) {
      throw createHttpError(400, "Permissions must be an array");
    }

    // Validate each permission structure
    for (const perm of permissions) {
      if (!perm.resource || !Object.values(RESOURCES).includes(perm.resource)) {
        throw createHttpError(400, `Invalid resource: ${perm.resource}`);
      }

      if (!perm.operations || typeof perm.operations !== 'object') {
        throw createHttpError(400, `Operations must be an object for resource: ${perm.resource}`);
      }

      // Validate operation keys and values
      for (const [operation, value] of Object.entries(perm.operations)) {
        if (!Object.values(OPERATIONS).includes(operation)) {
          throw createHttpError(400, `Invalid operation: ${operation} for resource: ${perm.resource}`);
        }
        if (typeof value !== 'boolean') {
          throw createHttpError(400, `Operation values must be boolean for resource: ${perm.resource}`);
        }
      }

      // Validate PUBLISH operation only for CELEBRITY
      if (perm.operations.publish === true && perm.resource !== RESOURCES.CELEBRITY) {
        throw createHttpError(400, 'PUBLISH operation is only allowed for CELEBRITY resource');
      }
    }

    // Get role info
    const role = await RoleModel.findById(id)
      .select("name slug status")
      .lean();

    console.log("👤 Role found:", role);

    if (!role) {
      throw createHttpError(404, "Role not found");
    }

    // Get privilege data
    const privilege = await Privilege.findOne({ roleId: id });

    console.log("🔐 Current privilege:", privilege);

    if (!privilege) {
      throw createHttpError(404, "Privilege document not found for this role");
    }

    // Check if privilege is locked (system role)
    if (privilege.isLocked) {
      throw createHttpError(403, "Cannot modify privileges for system-protected role");
    }

    // Update permissions
    privilege.permissions = permissions;
    await privilege.save();

    console.log("✅ Privileges updated successfully");

    // ✅ Convert Map operations to plain objects for response
    const formattedPermissions = privilege.permissions.map(perm => ({
      resource: perm.resource,
      operations: perm.operations ? Object.fromEntries(perm.operations.entries()) : {}
    }));

    // ✅ Fast module-level access list
    const accessibleModules = permissions.length > 0 
      ? permissions.map(p => p.resource) 
      : [];

    // ✅ Same response structure
    const response = {
      success: true,
      message: permissions.length > 0 
        ? "Privileges updated successfully" 
        : "All privileges removed from this role", 
      data: {
        role,
        hasPermissions: permissions.length > 0,
        isActive: privilege.isActive,
        isLocked: privilege.isLocked,
        accessibleModules,
        permissions: formattedPermissions
      }
    };

    console.log("📤 Sending response:", JSON.stringify(response, null, 2));
    return res.status(200).json(response);
    
  } catch (error) {
    console.error("❌ Error in setPrivileges:", error);
    next(error);
  }
};

module.exports = {
  getUserPrivileges,
  getPrivilegesByRoleId,
  setPrivileges
};