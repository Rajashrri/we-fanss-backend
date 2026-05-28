const Userlogin = require("../models/userlogin-model");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  sendResendOTPEmail,
  sendRegisterOTPEmail,
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

    const existingUser = await Userlogin.findOne({
      email,
    });

    // ================= VERIFIED USER =================
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const otp =
      process.env.ENABLE_STATIC_OTP_PROD === "true"
        ? process.env.STATIC_OTP
        : generateOtp();

    // ================= UNVERIFIED USER =================
    if (existingUser && !existingUser.isVerified) {
      existingUser.name = name;
      existingUser.password = password;

      existingUser.emailOtp = {
        code: otp,
        expiresAt: new Date(
          Date.now() + 10 * 60 * 1000
        ),
        attempts: 0,
        resendCount: 0,
      };

      await existingUser.save();

      // ✅ SEND EMAIL
      await sendRegisterOTPEmail(
        email,
        name,
        otp
      );

      return res.status(200).json({
        success: true,
        message:
          "OTP resent to existing user",
      });
    }

    // ================= NEW USER =================
  // ================= NEW USER =================
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

// ================= SEND EMAIL (NON-BLOCKING) =================
try {
  await sendRegisterOTPEmail(email, name, otp);
} catch (emailError) {
  console.log("Email failed but user created:", emailError.message);
}

return res.status(201).json({
  success: true,
  message: "OTP sent successfully (check email or resend OTP)",
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

// ================= VERIFY OTP =================
const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // ================= FIND USER =================
    const user = await Userlogin.findOne({ email });

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

    // ================= SUCCESS =================
    user.emailOtp.code = null;
    user.emailOtp.expiresAt = null;
    user.emailOtp.attempts = 0;

    user.isVerified = true;

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
    user.lastLogin = new Date();

    user.lastLoginIp =
      req.ip ||
      req.connection.remoteAddress;

    user.lastLoginDevice =
      req.headers["user-agent"];

    await user.save();

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
module.exports = {
  register,
  verifyRegisterOtp,
  resendRegisterOtp,
    login,
  googleLogin, // 👈 ADD THIS

};