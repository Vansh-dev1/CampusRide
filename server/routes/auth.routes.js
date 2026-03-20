const express = require("express");
const router = express.Router();
const {
  signup,
  verifyOTP,
  resendOTP,
  login,
  getMe,
} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { validateUniversityEmail } = require("../middleware/university.middleware");

router.post("/signup", validateUniversityEmail, signup);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", validateUniversityEmail, login);
router.get("/me", protect, getMe);

module.exports = router;