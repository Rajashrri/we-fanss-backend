const express = require("express");
const router = express.Router();

const {
  register,
  verifyRegisterOtp,resendRegisterOtp,login,  googleLogin, // 👈 ADD

} = require("../controllers/user-controller");

router.post("/register", register);
router.post("/verify-register-otp", verifyRegisterOtp);
router.post(
  "/resend-register-otp",
  resendRegisterOtp
);
router.post("/google-login", googleLogin);
router.post("/login", login);
module.exports = router;