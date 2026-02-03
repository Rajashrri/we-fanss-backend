// controllers/userManagementController.js
const User = require("../models/user-model");
const Role = require("../models/role-model");
const createHttpError = require("http-errors");
const { logActivity } = require("../utils/activityLogger");
const {
  ACTIVITY_ACTIONS,
  ACTIVITY_RESOURCES,
  ACTIVITY_STATUS,
} = require("../constants/activityLogConstants");

/**
 * Get all users with pagination, filtering, and search
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query;

    // Build filter object
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ✅ Get users with populated role
    const users = await User.find(filter)
      .select("-password -totpSecret -emailOtp -passwordResetOtp -refreshTokens")
      .populate({
        path: "role",
        select: "name is_system slug",
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // ✅ FILTER: Keep only users where role.is_system = false
    const filteredUsers = users.filter(user => 
      user.role && user.role.is_system === false
    );

    // ✅ Get total count of users with is_system = false roles
    const allUsersWithRoles = await User.find(filter)
      .populate({
        path: "role",
        select: "is_system",
      })
      .lean();
    
    const totalFilteredUsers = allUsersWithRoles.filter(user => 
      user.role && user.role.is_system === false
    ).length;

    // Log activity
    await logActivity({
      userId: req.user.userId,
      performedByRole: req.user.roleName,
      action: ACTIVITY_ACTIONS.READ,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User List",
        id: null,
        name: "User Management",
      },
      activity: `Viewed user list (page ${page})`,
      req,
      status: ACTIVITY_STATUS.SUCCESS,
    });

    return res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: {
        users: filteredUsers, // ✅ Return filtered users
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalFilteredUsers / parseInt(limit)),
          totalUsers: totalFilteredUsers, // ✅ Count of filtered users
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("❌ Get all users error:", error);

    await logActivity({
      userId: req.user?.userId,
      performedByRole: req.user?.roleName,
      action: ACTIVITY_ACTIONS.READ,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User List",
        id: null,
        name: "User Management",
      },
      activity: "Failed to retrieve user list",
      req,
      status: ACTIVITY_STATUS.FAILED,
    });

    next(error);
  }
};

/**
 * Get single user by ID
 */
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || !require("mongoose").Types.ObjectId.isValid(id)) {
      throw createHttpError(400, "Invalid user ID format");
    }

    const user = await User.findById(id)
      .select("-password -totpSecret -emailOtp -passwordResetOtp -refreshTokens")
      .populate({
        path: "role",
        select: "name is_system slug",
      })
      .lean();

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    await logActivity({
      userId: req.user.userId,
      performedByRole: req.user.roleName,
      action: ACTIVITY_ACTIONS.READ,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User",
        id: user._id,
        name: user.name,
      },
      activity: `Viewed user profile: ${user.email}`,
      req,
      status: ACTIVITY_STATUS.SUCCESS,
    });

    return res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    console.error("❌ Get user by ID error:", error);
    next(error);
  }
};

/**
 * Update user role
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;

    // Validate IDs
    if (!id || !require("mongoose").Types.ObjectId.isValid(id)) {
      throw createHttpError(400, "Invalid user ID format");
    }

    if (!roleId || !require("mongoose").Types.ObjectId.isValid(roleId)) {
      throw createHttpError(400, "Invalid role ID format");
    }

    // Prevent self-role modification
    if (id === req.user.userId.toString()) {
      throw createHttpError(403, "You cannot change your own role");
    }

    // Verify role exists
    const role = await Role.findById(roleId).select("name is_system").lean();
    if (!role) {
      throw createHttpError(404, "Role not found");
    }

    const user = await User.findById(id)
      .populate("role", "name")
      .lean();

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    const oldRoleName = user.role?.name || "Unknown";

    // Update user role
    await User.findByIdAndUpdate(id, { role: roleId });

    await logActivity({
      userId: req.user.userId,
      performedByRole: req.user.roleName,
      action: ACTIVITY_ACTIONS.UPDATE,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User Role",
        id: user._id,
        name: user.name,
      },
      activity: `Changed user role from ${oldRoleName} to ${role.name} for ${user.email}`,
      req,
      status: ACTIVITY_STATUS.SUCCESS,
    });

    return res.status(200).json({
      success: true,
      message: "User role updated successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: {
          _id: roleId,
          name: role.name,
        },
      },
    });
  } catch (error) {
    console.error("❌ Update user role error:", error);

    await logActivity({
      userId: req.user?.userId,
      performedByRole: req.user?.roleName,
      action: ACTIVITY_ACTIONS.UPDATE,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User Role",
        id: req.params.id,
        name: "Unknown",
      },
      activity: `Failed to update user role`,
      req,
      status: ACTIVITY_STATUS.FAILED,
    });

    next(error);
  }
};

/**
 * Update user status (activate/deactivate)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    // Validate ID
    if (!id || !require("mongoose").Types.ObjectId.isValid(id)) {
      throw createHttpError(400, "Invalid user ID format");
    }

    // Validate isActive
    if (typeof isActive !== "boolean") {
      throw createHttpError(400, "isActive must be a boolean value");
    }

    // Prevent self-deactivation
    if (id === req.user.userId.toString()) {
      throw createHttpError(403, "You cannot deactivate your own account");
    }

    const user = await User.findById(id).lean();

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    // Update status
    await User.findByIdAndUpdate(id, { isActive });

    await logActivity({
      userId: req.user.userId,
      performedByRole: req.user.roleName,
      action: ACTIVITY_ACTIONS.UPDATE,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User Status",
        id: user._id,
        name: user.name,
      },
      activity: `${isActive ? "Activated" : "Deactivated"} user: ${user.email}`,
      req,
      status: ACTIVITY_STATUS.SUCCESS,
    });

    return res.status(200).json({
      success: true,
      message: `User ${isActive ? "activated" : "deactivated"} successfully`,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: isActive,
      },
    });
  } catch (error) {
    console.error("❌ Update user status error:", error);
    next(error);
  }
};

/**
 * Delete user
 */
const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!id || !require("mongoose").Types.ObjectId.isValid(id)) {
      throw createHttpError(400, "Invalid user ID format");
    }

    // Prevent self-deletion
    if (id === req.user.userId.toString()) {
      throw createHttpError(403, "You cannot delete your own account");
    }

    const user = await User.findById(id).lean();

    if (!user) {
      throw createHttpError(404, "User not found");
    }

    const userName = user.name;
    const userEmail = user.email;

    await User.findByIdAndDelete(id);

    await logActivity({
      userId: req.user.userId,
      performedByRole: req.user.roleName,
      action: ACTIVITY_ACTIONS.DELETE,
      resource: ACTIVITY_RESOURCES.USER,
      item: {
        type: "User",
        id: id,
        name: userName,
      },
      activity: `Deleted user: ${userEmail}`,
      req,
      status: ACTIVITY_STATUS.SUCCESS,
    });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete user error:", error);
    next(error);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateUserRole,
  updateUserStatus,
  deleteUser,
};