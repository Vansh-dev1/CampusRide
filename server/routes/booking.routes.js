const express = require("express");
const router = express.Router();
const {
  bookRide,
  getMyBookings,
  getRideBookings,
  markPaid,
  cancelBooking,
} = require("../controllers/booking.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, bookRide);
router.get("/my", protect, getMyBookings);
router.get("/ride/:rideId", protect, getRideBookings);
router.patch("/:id/mark-paid", protect, markPaid);
router.patch("/:id/cancel", protect, cancelBooking);

module.exports = router;