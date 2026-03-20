const express = require("express");
const router = express.Router();
const {
  postRide,
  getRides,
  getRideById,
  getMyPostedRides,
  updateRideStatus,
  cancelRide,
} = require("../controllers/ride.controller");
const { protect } = require("../middleware/auth.middleware");

// IMPORTANT: specific routes before param routes to avoid conflicts
router.get("/my/posted", protect, getMyPostedRides);

router.get("/", protect, getRides);
router.post("/", protect, postRide);

router.get("/:id", protect, getRideById);
router.patch("/:id/status", protect, updateRideStatus);
router.delete("/:id", protect, cancelRide);

module.exports = router;