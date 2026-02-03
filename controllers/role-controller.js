const RoleModel = require("../models/role-model");
const Privilege = require("../models/previlege-model");
const createHttpError = require("http-errors");

const { OPERATIONS, RESOURCES , PRIVILEGE_RESOURCES } = require('../utils/constant/privilege-constant');




// Get default operations based on resource type
const getDefaultOperations = (resource) => {
  const operations = {};
  
  if (resource === PRIVILEGE_RESOURCES.CELEBRITY) {
    operations[OPERATIONS.ADD] = false;
    operations[OPERATIONS.EDIT] = false;
    operations[OPERATIONS.DELETE] = false;
    operations[OPERATIONS.PUBLISH] = false;
  } else {
    // Other resources get only ADD, EDIT, DELETE (no PUBLISH)
    operations[OPERATIONS.ADD] = false;
    operations[OPERATIONS.EDIT] = false;
    operations[OPERATIONS.DELETE] = false;
  }
  
  return operations;
};

// Create a new role
const createRole = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const createdBy = req?.user?.userId;

    // Validation
    if (!name || !name.trim()) {
      throw createHttpError(400, "Role name is required");
    }

    const roleExists = await RoleModel.findOne({ name: name.trim() });
    if (roleExists) {
      throw createHttpError(400, "Role already exists");
    }

    const newRole = await RoleModel.create({ 
      name: name.trim(),
      description: description?.trim() || "",
      createdBy,
      status: 1,
      is_system: false 
    });

    // ✅ Create default permissions using PRIVILEGE_RESOURCES
    const defaultPermissions = Object.values(PRIVILEGE_RESOURCES).map(resource => ({
      resource,
      operations: getDefaultOperations(resource)
    }));

    await Privilege.create({
      role: name.trim(),
      roleId: newRole._id,
      permissions: defaultPermissions,
      isActive: true,
      isLocked: false
    });

    return res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: {
        role: newRole,
        roleId: newRole._id.toString()
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all roles (excluding system roles)
const getAllRoles = async (req, res, next) => {
  try {
    const roles = await RoleModel.find({
      is_system: { $ne: true } // Only non-system roles
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .sort({ createdAt: -1 });

    // ✅ Always return 200 with empty array if no roles found
    return res.status(200).json({
      success: true,
      message: "Roles retrieved successfully",
      data: roles,
      count: roles.length
    });

  } catch (error) {
    next(error);
  }
};

// Get role by ID (excluding system roles)
const getRoleById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw createHttpError(400, "Invalid role ID format");
    }
    
    const role = await RoleModel.findOne({
      _id: id,
      is_system: { $ne: true }
    })
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');
    
    if (!role) {
      throw createHttpError(404, "Role not found");
    }
    
    return res.status(200).json({ 
      success: true,
      message: "Role retrieved successfully", 
      data: role 
    });
  } catch (error) {
    next(error);
  }
};

// Update role details (system roles silently blocked)
const updateRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const updatedBy = req?.user?.userId;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw createHttpError(400, "Invalid role ID format");
    }

    const existingRole = await RoleModel.findById(id);
    if (!existingRole) {
      throw createHttpError(404, "Role not found");
    }

    // Silently block system role updates - user thinks role doesn't exist
    if (existingRole.is_system) {
      throw createHttpError(404, "Role not found");
    }

    // Check if new name already exists
    if (name && name.trim() !== existingRole.name) {
      const nameExists = await RoleModel.findOne({ 
        name: name.trim(), 
        _id: { $ne: id } 
      });
      if (nameExists) {
        throw createHttpError(400, "Role name already exists");
      }
    }

    const updateData = { updatedBy };
    if (name && name.trim()) {
      updateData.name = name.trim();
      updateData.slug = name.trim()
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-");
    }
    if (description !== undefined) {
      updateData.description = description?.trim() || "";
    }

    const updatedRole = await RoleModel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    // Update privilege role name if role name changed
    if (name && name.trim() !== existingRole.name) {
      await Privilege.updateOne(
        { roleId: id },
        { $set: { role: name.trim() } }
      );
    }

    return res.status(200).json({ 
      success: true,
      message: "Role updated successfully",
      data: updatedRole
    });
  } catch (error) {
    next(error);
  }
};

// Update role status (system roles silently blocked)
const updateRoleStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updatedBy = req?.user?.userId;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw createHttpError(400, "Invalid role ID format");
    }

    if (status === undefined || ![0, 1].includes(Number(status))) {
      throw createHttpError(400, "Status must be 0 (inactive) or 1 (active)");
    }

    const role = await RoleModel.findById(id);
    if (!role) {
      throw createHttpError(404, "Role not found");
    }

    // Silently block system role status updates
    if (role.is_system) {
      throw createHttpError(404, "Role not found");
    }

    const updatedRole = await RoleModel.findByIdAndUpdate(
      id,
      { 
        $set: { 
          status: Number(status),
          updatedBy 
        } 
      },
      { new: true, runValidators: true }
    )
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    // Update privilege active status
    await Privilege.updateOne(
      { roleId: id },
      { $set: { isActive: Number(status) === 1 } }
    );

    return res.status(200).json({
      success: true,
      message: "Role status updated successfully",
      data: updatedRole
    });
  } catch (error) {
    next(error);
  }
};

// Delete role (system roles silently blocked)
const deleteRole = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      throw createHttpError(400, "Invalid role ID format");
    }

    const role = await RoleModel.findById(id);
    if (!role) {
      throw createHttpError(404, "Role not found");
    }

    // Silently block system role deletion
    if (role.is_system) {
      throw createHttpError(404, "Role not found");
    }

    // Delete associated privileges first
    await Privilege.deleteOne({ roleId: id });
    
    // Delete the role
    await RoleModel.findByIdAndDelete(id);

    return res.status(200).json({ 
      success: true,
      message: "Role and its privileges deleted successfully",
      data: {
        deletedRoleId: id,
        deletedRoleName: role.name
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  updateRoleStatus,
  deleteRole,
};