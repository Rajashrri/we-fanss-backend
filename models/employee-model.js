const { Schema, model } = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const employeeSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  role_name: { type: String },
  role_id: { type: String },
  password: { type: String, required: true },
  phone: { type: String },
  emp_id: { type: String },
  profile_pic: { type: String },
  url: { type: String },
  status: { type: String },
  createdAt: { type: String },
  createdBy: { type: String },
  resetToken: { type: String },
  tokenExpire: { type: Date }, // ✅ Use Date type
  authkey: { type: String }, // ✅ If you're storing base32 secret
  otp: { type: String },
  loginotpcount: { type: Number, default: 0 },
});

// employeeSchema.pre('save', async function (next) {
//   const user = this;
//   if (!user.isModified('password')) return next();

//   try {
//     const salt = await bcrypt.genSalt(10);
//     user.password = await bcrypt.hash(user.password, salt);
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

employeeSchema.methods.comparePassword = async function (password) {
  return password === this.password; // Plain-text comparison
};

employeeSchema.methods.generateToken = async function () {
  try {
    return jwt.sign(
      {
        userId: this._id.toString(),
        email: this.email,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "30d" }
    );
  } catch (error) {
    console.error("Token generation error:", error);
    throw error;
  }
};

const Employee = model("Employee", employeeSchema);
module.exports = { Employee };
