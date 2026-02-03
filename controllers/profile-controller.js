const bcrypt = require("bcryptjs");
const User = require("../models/user-model");

/**
 * @route   GET /api/profile
 * @desc    Get current user profile
 * @access  Private
 */
const getProfile = async (req, res) => {
  try {

   
    const user = await User.findById(req.user.userId).select("-password -totpSecret -totpQrCode -emailOtp -passwordResetOtp -refreshTokens");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        profilePic: user.profilePic,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        lastLoginIp: user.lastLoginIp,
        lastLoginDevice: user.lastLoginDevice,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("❌ Error in getProfile:", error);
    res.status(500).json({
      success: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/profile
 * @desc    Update user profile
 * @access  Private
 */
const updateProfile = async (req, res) => {
  try {
    const updateData = req.body;

    console.log("📥 User ID from token:", req.user.userId);
    console.log("📦 updateData (from body):", updateData);
    console.log("📸 Uploaded file:", req.file);

    // Prevent updating sensitive/protected fields
    delete updateData.password;
    delete updateData.role;           // ❌ Role cannot be changed by user
    delete updateData.isActive;       // ❌ Only admin can activate/deactivate
    delete updateData.isVerified;     // ❌ Only admin can verify
    delete updateData.totpSecret;     // ❌ Security field
    delete updateData.totpQrCode;     // ❌ Security field
    delete updateData.refreshTokens;  // ❌ Security field
    delete updateData.email;          // ❌ Email change requires separate verification
    delete updateData.emailOtp;       // ❌ Security field
    delete updateData.passwordResetOtp; // ❌ Security field
    delete updateData.lastLogin;      // ❌ System managed
    delete updateData.lastLoginIp;    // ❌ System managed
    delete updateData.lastLoginDevice; // ❌ System managed

    // Only allow updating: name, profilePic (and any other safe fields you add later)
    const allowedFields = ['name'];
    const filteredUpdateData = {};
    
    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        filteredUpdateData[field] = updateData[field];
      }
    });

    // Handle file upload
    if (req.file) {
      filteredUpdateData.profilePic = req.file.filename;
    }

    // Check if there's anything to update
    if (Object.keys(filteredUpdateData).length === 0) {
      return res.status(400).json({
        success: false,
        msg: "No valid fields to update",
      });
    }

    const updatedProfile = await User.findByIdAndUpdate(
      req.user.userId,
      filteredUpdateData,
      {
        new: true,
        runValidators: true,
      }
    ).select("-password -totpSecret -totpQrCode -emailOtp -passwordResetOtp -refreshTokens");

    console.log("🧾 Updated profile:", updatedProfile);

    if (!updatedProfile) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Profile updated successfully",
      user: updatedProfile,
    });
  } catch (error) {
    console.error("❌ Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

/**
 * @route   PUT /api/profile/password
 * @desc    Update user password
 * @access  Private
 */
const updatePassword = async (req, res) => {
  try {
    const { current_password, new_password, confirm_password } = req.body;

    // Validations
    if (!current_password || !new_password || !confirm_password) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required",
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        msg: "New password and confirm password do not match",
      });
    }

    // Password strength validation
    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        msg: "Password must be at least 8 characters long",
      });
    }

    // Get user with password field
    const user = await User.findById(req.user.userId).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // Compare current password
    const isMatch = await bcrypt.compare(current_password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        msg: "Current password is incorrect",
      });
    }

    // Check if new password is same as current
    const isSameAsOld = await bcrypt.compare(new_password, user.password);
    if (isSameAsOld) {
      return res.status(400).json({
        success: false,
        msg: "New password must be different from current password",
      });
    }

    // Update password (will be hashed by pre-save hook)
    user.password = new_password;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "Password updated successfully",
    });
  } catch (error) {
    console.error("❌ Error in updatePassword:", error.message);
    res.status(500).json({
      success: false,
      msg: "Internal Server Error",
      error: error.message,
    });
  }
};

module.exports = { getProfile, updateProfile, updatePassword };