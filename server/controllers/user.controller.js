const User = require("../models/User");
const { cloudinary } = require("../config/cloudinary");

// GET /api/users/:id  — public profile
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "name avatar college rating ridesPosted ridesTaken createdAt"
    );

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/users/profile  — update own profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, college } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, college },
      { new: true, runValidators: true }
    );

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/users/avatar  — upload profile photo
const updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image provided" });
    }

    const user = await User.findById(req.user._id);

    // Delete old avatar from Cloudinary if exists
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId);
    }

    user.avatar = req.file.path;
    user.avatarPublicId = req.file.filename;
    await user.save();

    res.json({ success: true, avatar: user.avatar });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getUserProfile, updateProfile, updateAvatar };