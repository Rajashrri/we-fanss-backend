const express = require("express");
const router = express.Router();

const {
  register,
  verifyRegisterOtp,resendRegisterOtp,login,  googleLogin, // 👈 ADD
  forgotPassword,
    verifyForgotOtp,
    resendForgotOtp,
  resetPassword,
  changePassword,

} = require("../controllers/userlogin-controller");

router.post("/register", register);
router.post("/verify-register-otp", verifyRegisterOtp);
router.post(
  "/resend-register-otp",
  resendRegisterOtp
);
router.post("/google-login", googleLogin);
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
// ================= FORGOT PASSWORD =================
router.post("/forgot-password", forgotPassword);

// ================= VERIFY FORGOT OTP =================
router.post("/verify-forgot-otp", verifyForgotOtp);
router.post("/resend-forgot-otp", resendForgotOtp);

// ================= RESET PASSWORD =================
router.post("/reset-password", resetPassword);

router.post(
  "/change-password",
  changePassword
);

// ---------------------------------- login complete ----------------------------------------------------------------------



module.exports = router;