const express = require("express");
const router = express.Router();
const {
  submitReview,
  getUserReviews,
} = require("../controllers/review.controller");
const { protect } = require("../middleware/auth.middleware");

router.post("/", protect, submitReview);
router.get("/user/:userId", protect, getUserReviews);

module.exports = router;