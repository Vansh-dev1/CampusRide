const express = require("express");
const router = express.Router();
const {
  getUserProfile,
  updateProfile,
  updateAvatar,
} = require("../controllers/user.controller");
const { protect } = require("../middleware/auth.middleware");
const { upload } = require("../config/cloudinary");

router.get("/:id", protect, getUserProfile);
router.patch("/profile", protect, updateProfile);
router.patch("/avatar", protect, upload.single("avatar"), updateAvatar);

module.exports = router;