const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    profilePic: {
      type: String,
      default: null,
    },

   
     role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Role",
    
  },

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },

    // Google Authenticator (TOTP)
    totpSecret: {
      type: String,
      select: false,
      required: true,
    },
    totpQrCode: {
      type: String,
      select: false,
    },
    
    // Email OTP for login
    emailOtp: {
      code: { type: String },
      expiresAt: { type: Date },
      attempts: { type: Number, default: 0 },
    },

    // Password Reset OTP
    passwordResetOtp: {
      code: { type: String },
      expiresAt: { type: Date },
      attempts: { type: Number, default: 0 },
      verified:{type:Boolean}
    },

    // Refresh Tokens (for JWT rotation)
    refreshTokens: [
      {
        token: { type: String },
        device: { type: String },
        ip: { type: String },
        expiresAt: { type: Date },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Last Login Info
    lastLogin: {
      type: Date,
    },
    lastLoginIp: {
      type: String,
    },
    lastLoginDevice: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password
userSchema.methods.comparePassword = async function (password) {
  if (!this.password) return false;
  return bcrypt.compare(password, this.password);
};

// Generate Access Token
// Generate Access Token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    {
      sub: this._id.toString(),      
      email: this.email,
      name: this.name,
      role: this.role?.toString(),  
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "12h" }
  );
};


// Generate Refresh Token with tracking
userSchema.methods.generateRefreshToken = function (ip, device) {
  const refreshToken = jwt.sign(
    {
      userId: this._id.toString(),
    },
    process.env.JWT_REFRESH_SECRET_KEY || process.env.JWT_SECRET_KEY,
    { expiresIn: "30d" }
  );

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  this.refreshTokens.push({
    token: refreshToken,
    expiresAt,
    ip: ip || "unknown",
    device: device || "unknown",
  });

  return refreshToken;
};

// Clean expired refresh tokens
userSchema.methods.cleanExpiredTokens = function () {
  this.refreshTokens = this.refreshTokens.filter(
    (rt) => rt.expiresAt > new Date()
  );
};

const User = mongoose.model("User", userSchema);



module.exports = User;