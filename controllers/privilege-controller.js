const Privilege = require("../models/previlege-model");
const RoleModel = require("../models/role-model");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const { OPERATIONS, PRIVILEGE_RESOURCES } = require('../utils/constant/privilege-constant');

/**
 * Get current user's privileges
 */
const getUserPrivileges = async (req, res, next) => {
  try {
    const { roleId } = req.user;

    // Validate roleId
    if (!roleId || !mongoose.Types.ObjectId.isValid(roleId)) {
      throw createHttpError(400, "Invalid role ID format");
    }

    const privilegeData = await Privilege.findOne({
      roleId,
      isActive: true
    }).lean();

    if (!privilegeData) {
      return res.status(200).json({
        success: true,
        message: "No privileges found",
        data: null
      });
    }

    return res.status(200).json({
      success: true,
      message: "Privileges retrieved successfully",
      data: privilegeData
    });

  } catch (error) {
    console.error("❌ Error in getUserPrivileges:", error);
    next(error);
  }
};

/**
 * Get privileges by role ID
 */
const getPrivilegesByRoleId = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      throw createHttpError(400, "Invalid role ID format");
    }

    // Get role info
    const role = await RoleModel.findById(id)
      .select("name slug status")
      .lean();

    if (!role) {
      throw createHttpError(404, "Role not found");
    }

    // Get privilege data
    const privilegeData = await Privilege.findOne({ roleId: id }).lean();

    if (!privilegeData) {
      return res.status(200).json({
        success: true,
        message: "No privileges found",
        data: {
          role,
          privilege: null
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Privileges retrieved successfully",
      data: {
        role,
        privilege: privilegeData
      }
    });
    
  } catch (error) {
    console.error("❌ Error in getPrivilegesByRoleId:", error);
    next(error);
  }
};

/**
 * Set/Update privileges for a role
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

    // ✅ Validate each permission structure
    for (const perm of permissions) {
      // Check if resource is valid
      if (!perm.resource || !Object.values(PRIVILEGE_RESOURCES).includes(perm.resource)) {
        throw createHttpError(400, `Invalid resource: ${perm.resource}`);
      }

      // Check operations object
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

      // ✅ FIX: PUBLISH operation allowed for all celebrity.* resources
      if (perm.operations.publish === true && !perm.resource.startsWith('celebrity')) {
        throw createHttpError(400, 'PUBLISH operation is only allowed for celebrity resources');
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

    // ✅ Update permissions - DB will handle it
    privilege.permissions = permissions;
    await privilege.save();

    console.log("✅ Privileges updated successfully");

    // ✅ Fetch fresh data and return as-is
    const updatedPrivilege = await Privilege.findOne({ roleId: id }).lean();

    const response = {
      success: true,
      message: "Privileges updated successfully",
      data: {
        role,
        privilege: updatedPrivilege
      }
    };

    console.log("📤 Sending response");
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