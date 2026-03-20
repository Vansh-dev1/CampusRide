const express = require("express");
const router = express.Router();
const {
  getMessages,
  sendMessage,
  getUnreadCount,
} = require("../controllers/message.controller");
const { protect } = require("../middleware/auth.middleware");

router.get("/unread-count", protect, getUnreadCount);
router.get("/:rideId", protect, getMessages);
router.post("/:rideId", protect, sendMessage);

module.exports = router;