const Review = require("../models/Review");
const Booking = require("../models/Booking");

// POST /api/reviews  — submit a review after a completed ride
const submitReview = async (req, res) => {
  try {
    const { rideId, revieweeId, rating, comment } = req.body;

    // Only allow review if user has a completed booking for this ride
    const booking = await Booking.findOne({
      ride: rideId,
      passenger: req.user._id,
      status: "completed",
    });

    // Also allow rider to review passenger (check if they are the rider)
    const Ride = require("../models/Ride");
    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ success: false, message: "Ride not found" });
    }

    const isRider = ride.rider.toString() === req.user._id.toString();
    if (!booking && !isRider) {
      return res.status(403).json({
        success: false,
        message: "You can only review after completing a ride",
      });
    }

    const review = await Review.create({
      ride: rideId,
      reviewer: req.user._id,
      reviewee: revieweeId,
      rating,
      comment,
    });

    await review.populate("reviewer", "name avatar");

    res.status(201).json({ success: true, review });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "You already reviewed this ride" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/reviews/user/:userId  — get all reviews for a user
const getUserReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.userId })
      .populate("reviewer", "name avatar")
      .populate("ride", "from to departureTime")
      .sort({ createdAt: -1 });

    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { submitReview, getUserReviews };