const { User } = require("../models/user-model");
const { Role } = require("../models/role-model");
const bcrypt = require("bcryptjs");

function createCleanUrl(title) {
  return title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}

// ✅ Helper function for date formatting
const formatDateDMY = (date) => {
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = String(d.getFullYear());
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  const seconds = String(d.getSeconds()).padStart(2, "0");
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

// ✅ Fetch Roles
const categoryOptions = async (req, res) => {
  try {
    const roles = await Role.find({ status: 1 });
    if (!roles.length) {
      return res.status(404).json({ msg: "No roles found" });
    }
    res.status(200).json({ msg: roles });
  } catch (error) {
    console.error("Category fetch error:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

// ✅ Add Employee (No emp_id)
const addemployee = async (req, res) => {
  try {
    const { name, email, password, role_name, role_id, createdBy } = req.body;
    const username = name;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exist" });
    }

    const url = createCleanUrl(username);
    const now = new Date();
    const createdAt = formatDateDMY(now);
    const updatedAt = formatDateDMY(now);

    const newUser = await User.create({
      username,
      email,
      password,
      role_id,
      role_name,
      createdBy,
      url,
      status: "1",
      createdAt,
      updatedAt,
    });

    res.status(201).json({
      status: true,
      msg: "Employee created successfully",
      data: newUser,
    });
  } catch (error) {
    console.error("Add employee error:", error);
    res.status(500).json({ msg: "Internal Server Error", error });
  }
};


// ✅ Update Employee
const updateemployee = async (req, res) => {
  try {
    const { username, email, password, role_name, role_id } = req.body;
    const id = req.params.id;

    // Check duplicate email excluding same ID
    const existingUser = await User.findOne({ email, _id: { $ne: id } });
    if (existingUser) {
      return res.status(400).json({ msg: "Email already exist" });
    }

    const url = createCleanUrl(username);
    const updatedAt = formatDateDMY(new Date());

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ msg: "Employee not found" });
    }

    // Prepare update object
    const updateData = {
      username,
      email,
      role_name,
      role_id,
      url,
      updatedAt,
    };

    // Only update password if provided
    if (password && password.trim() !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateData.password = hashedPassword;
    }

    const updatedUser = await User.findByIdAndUpdate(id, { $set: updateData }, { new: true });

    res.status(200).json({
      status: true,
      msg: "Employee updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Update employee error:", error);
    res.status(500).json({ msg: "Internal Server Error", error });
  }
};


// ✅ Update Status
const updateStatus = async (req, res) => {
  try {
    const { id, status } = req.body;
    await User.updateOne({ _id: id }, { $set: { status } });
    res.status(200).json({ msg: "Status updated successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// ✅ Get All Employees
const getdata = async (req, res) => {
  try {
    const users = await User.find();
    if (!users.length) return res.status(404).json({ msg: "No Data Found" });
    res.status(200).json({ msg: users });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// ✅ Get Employee by ID
const getemployeeByid = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ msg: "No Data Found" });
    res.status(200).json({ msg: user });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// ✅ Delete Employee
const deleteemployee = async (req, res) => {
  try {
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ msg: "No Data Found" });
    res.status(200).json({ msg: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ msg: "Internal Server Error", error });
  }
};

// ✅ Fetch Role list for Table
const getRoleOptionsTable = async (req, res) => {
  try {
    const roles = await Role.find({}, "_id name");
    res.status(200).json({
      success: true,
      msg: roles,
    });
  } catch (error) {
    console.error("Error fetching role options:", error);
    res.status(500).json({
      success: false,
      msg: "Internal Server Error",
    });
  }
};

module.exports = {
  addemployee,
  updateStatus,
  updateemployee,
  getdata,
  deleteemployee,
  getemployeeByid,
  categoryOptions,
  getRoleOptionsTable,
};
