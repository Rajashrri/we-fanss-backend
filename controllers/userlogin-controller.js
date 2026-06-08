const Userlogin = require("../models/userlogin-model");

const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendResendOTPEmail,
  sendRegisterOTPEmail,
  sendForgotPasswordOTPEmail,
  sendResendForgotPasswordOTPEmail
} = require("../config/useremail.config");
const { OAuth2Client } = require("google-auth-library");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// ================= OTP =================
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { name, email, picture } = payload;
console.log("Google Email:", payload.email);

    // ❌ ONLY CHECK USER (NO AUTO CREATE)
    let user = await Userlogin.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        needRegister: true,
        message: "Please register first",
      });
    }

    // OPTIONAL: if user exists but not verified
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    // JWT
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET_KEY4,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "Google login successful",
      token,
      user,
    });

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Google Login Failed",
    });
  }
};
// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await Userlogin.findOne({ email });

    const otp = generateOtp();

    // VERIFIED USER
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    // UNVERIFIED USER UPDATE
    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = password;

      existingUser.emailOtp = {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        resendCount: 0,
      };

      await existingUser.save();

      sendRegisterOTPEmail(email, name, otp)
        .catch(err => console.log("EMAIL FAILED:", err.message));

      return res.status(200).json({
        success: true,
        message: "OTP resent successfully",
      });
    }

    // NEW USER
    const user = new Userlogin({
      name,
      email,
      password,
      isVerified: false,
      emailOtp: {
        code: otp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        attempts: 0,
        resendCount: 0,
      },
    });

    await user.save();

    sendRegisterOTPEmail(email, name, otp)
      .catch(err => console.log("EMAIL FAILED:", err.message));

    return res.status(201).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
// ================= VERIFY OTP =================

const verifyRegisterOtp = async (req, res) => {
  try {

    const { email, otp } = req.body;

    // ================= FIND USER =================
    const user = await Userlogin.findOne({ email }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= ALREADY VERIFIED =================
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

    // ================= CHECK OTP EXISTS =================
    if (!user.emailOtp?.code) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    // ================= OTP EXPIRE =================
    if (
      user.emailOtp.expiresAt &&
      user.emailOtp.expiresAt < new Date()
    ) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // ================= INVALID OTP =================
    if (user.emailOtp.code !== otp) {

      user.emailOtp.attempts =
        (user.emailOtp.attempts || 0) + 1;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ================= OTP VERIFIED =================
    user.emailOtp.code = null;
    user.emailOtp.expiresAt = null;
    user.emailOtp.attempts = 0;

    user.isVerified = true;

    // ================= TOKEN =================
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY4,
      {
        expiresIn: "7d",
      }
    );

    // ================= SAVE LOGIN INFO =================
    user.refreshTokens.push({
      token: token,
      device:
        req.headers["user-agent"] ||
        "Unknown Device",
      ip:
        req.ip ||
        req.connection.remoteAddress ||
        "Unknown IP",
      expiresAt: new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000
      ),
    });

    user.lastLogin = new Date();

    user.lastLoginIp =
      req.ip ||
      req.connection.remoteAddress;

    user.lastLoginDevice =
      req.headers["user-agent"];

    await user.save();

    // ================= RESPONSE =================
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        profileImage:user.profileImage
      },
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};
const resendRegisterOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // ================= FIND USER =================
    const user = await Userlogin.findOne({
      email,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= ALREADY VERIFIED =================
    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "User already verified",
      });
    }

    // ================= INIT OTP OBJECT =================
    if (!user.emailOtp) {
      user.emailOtp = {};
    }

    // ================= INIT RESEND COUNT =================
    user.emailOtp.resendCount =
      user.emailOtp.resendCount || 0;

    // ================= LIMIT CHECK =================
    if (user.emailOtp.resendCount >= 3) {
      return res.status(400).json({
        success: false,
        message: "Resend OTP limit exceeded",
      });
    }

    // ================= GENERATE OTP =================
    const otp =
      process.env.ENABLE_STATIC_OTP_PROD === "true"
        ? process.env.STATIC_OTP
        : Math.floor(
            100000 + Math.random() * 900000
          ).toString();

    // ================= UPDATE OTP =================
    user.emailOtp.code = otp;

    user.emailOtp.expiresAt = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.emailOtp.attempts = 0;

    user.emailOtp.resendCount += 1;

    await user.save();

    // ================= SEND RESEND OTP EMAIL =================
    await sendResendOTPEmail(
      user.email,
      user.name,
      otp
    );

    return res.status(200).json({
      success: true,
      message: `OTP resent successfully (${user.emailOtp.resendCount}/3)`,
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Userlogin.findOne({
      email,
    }).select("+password");

    // ================= USER NOT FOUND =================
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= VERIFY CHECK =================
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        verifyRequired: true,
        message:
          "Please complete registration and OTP verification",
      });
    }

    // ================= PASSWORD CHECK =================
    const isPasswordMatch =
      await bcrypt.compare(
        password,
        user.password
      );

    if (!isPasswordMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid password",
      });
    }

    // ================= ACCESS TOKEN =================
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
      },
      process.env.JWT_SECRET_KEY4,
      {
        expiresIn: "7d",
      }
    );

    // ================= SAVE TOKEN =================
    user.refreshTokens.push({
      token: token,
      device:
        req.headers["user-agent"] ||
        "Unknown Device",
      ip:
        req.ip ||
        req.connection.remoteAddress ||
        "Unknown IP",
      expiresAt: new Date(
        Date.now() +
          7 * 24 * 60 * 60 * 1000
      ),
    });

    // ================= LAST LOGIN =================
  await Userlogin.updateOne(
  { _id: user._id },
  {
    $set: {
      lastLogin: new Date(),
      lastLoginIp:
        req.ip ||
        req.connection.remoteAddress,
      lastLoginDevice:
        req.headers["user-agent"],
    },

    $push: {
      refreshTokens: {
        token: token,
        device:
          req.headers["user-agent"] ||
          "Unknown Device",
        ip:
          req.ip ||
          req.connection.remoteAddress ||
          "Unknown IP",
        expiresAt: new Date(
          Date.now() +
            7 * 24 * 60 * 60 * 1000
        ),
      },
    },
  }
);
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

//forgot 

// ================= FORGOT PASSWORD =================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // ================= EMAIL VALIDATION =================
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // ================= USER CHECK =================
    const user = await Userlogin.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Email does not exist",
      });
    }

    // ================= VERIFIED CHECK =================
    if (!user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    // ================= OTP GENERATE =================
    const otp =
      process.env.ENABLE_STATIC_OTP_PROD === "true"
        ? process.env.STATIC_OTP
        : generateOtp();

    // ================= SAVE OTP =================
    user.forgotOtp = {
      code: otp,
      expiresAt: new Date(
        Date.now() + 10 * 60 * 1000
      ),
      attempts: 0,
    };

    await user.save();

    // ================= EMAIL SEND =================
    try {
      await sendForgotPasswordOTPEmail(
        user.email,
        user.name,
        otp
      );

      console.log("✅ Forgot OTP email sent");

    } catch (mailError) {

      console.log(
        "❌ EMAIL ERROR:",
        mailError.message
      );

      // EMAIL FAIL HO TAB BHI OTP SAVE RAHEGA
      // USER FLOW CONTINUE HOGA
    }

    // ================= SUCCESS RESPONSE =================
    return res.status(200).json({
      success: true,
      message:
        "OTP generated successfully",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });

  }
};
const verifyForgotOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // ================= CHECK USER =================
    const user = await Userlogin.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= CHECK OTP EXISTS =================
    if (!user.forgotOtp?.code) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    }

    // ================= CHECK OTP EXPIRY =================
    if (user.forgotOtp.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // ================= CHECK OTP MATCH =================
    if (user.forgotOtp.code !== otp) {

      user.forgotOtp.attempts += 1;

      await user.save();

      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ================= SUCCESS =================
    user.forgotOtp.code = null;
    user.forgotOtp.expiresAt = null;
    user.forgotOtp.attempts = 0;

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

// ================= RESET PASSWORD =================
const resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;

    // ================= VALIDATION =================
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    // ================= FIND USER =================
    const user = await Userlogin.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

 // ================= UPDATE PASSWORD =================

user.password = password;

// clear OTP if exists
if (user.resetOtp) {
  user.resetOtp.code = null;
  user.resetOtp.expiresAt = null;
  user.resetOtp.attempts = 0;
}

await user.save();

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
const resendForgotOtp = async (req, res) => {
  try {
    const { email } = req.body;

    // ================= EMAIL VALIDATION =================
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // ================= USER CHECK =================
    const user = await Userlogin.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= OTP GENERATE =================
    const otp =
      process.env.ENABLE_STATIC_OTP_PROD === "true"
        ? process.env.STATIC_OTP
        : generateOtp();

    // ================= SAVE OTP =================
    user.forgotOtp = {
      code: otp,
      expiresAt: new Date(
        Date.now() + 10 * 60 * 1000
      ),
      attempts: 0,
    };

    await user.save();

    // ================= EMAIL SEND =================
    try {

      await sendResendForgotPasswordOTPEmail(
        user.email,
        user.name,
        otp
      );

      console.log(
        "✅ Forgot resend OTP email sent"
      );

    } catch (mailError) {

      console.log(
        "❌ EMAIL ERROR:",
        mailError.message
      );

      // EMAIL FAIL HO TAB BHI FLOW CONTINUE HOGA
    }

    // ================= SUCCESS RESPONSE =================
    return res.status(200).json({
      success: true,
      message:
        "OTP resent successfully",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });

  }
};



// ================= CHANGE PASSWORD =================
// ================= CHANGE PASSWORD =================
const changePassword = async (req, res) => {
  try {

    const {
      email,
      currentPassword,
      newPassword,
      confirmPassword,
    } = req.body;

    // ================= REQUIRED =================
    if (
      !email ||
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // ================= PASSWORD MATCH =================
    if (
      newPassword !== confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "New password and confirm password do not match",
      });
    }

    // ================= USER =================
    const user =
      await Userlogin.findOne({
        email,
      }).select("+password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ================= CURRENT PASSWORD CHECK =================
    const isMatch =
      await bcrypt.compare(
        currentPassword,
        user.password
      );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Current password not match",
      });
    }

    // ================= SAME PASSWORD CHECK =================
    const isSamePassword =
      await bcrypt.compare(
        newPassword,
        user.password
      );

    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be different from current password",
      });
    }

    // ================= SAVE PASSWORD =================
    // REGISTER JAISA DIRECT SAVE
    user.password = newPassword;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Password changed successfully",
    });

  } catch (error) {

    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Server Error",
    });

  }
};


// ----------------------------------------------------------- login flow complete --------------------------------------------------



// ----------------------------------user dashboard ----------------------------------------------------

const getSavedCelebrityCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const collections = await Collection.find({ userId });

    let totalSaved = 0;

    collections.forEach((collection) => {
      totalSaved += collection.celebrities.length;
    });

    res.status(200).json({
      success: true,
      totalSaved,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};
const getFollowedCount = async (req, res) => {
  try {
    const { userId } = req.params;

    const count = await Follow.countDocuments({
      userId,
    });

    res.status(200).json({
      success: true,
      totalFollowed: count,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};


module.exports = {
  register,
  verifyRegisterOtp,
  resendRegisterOtp,
    login,
  googleLogin, // 👈 ADD THIS
  forgotPassword,
  verifyForgotOtp,
    resetPassword,
    resendForgotOtp,
changePassword,



};