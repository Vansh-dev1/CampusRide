const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// One review per reviewer per ride
reviewSchema.index({ ride: 1, reviewer: 1 }, { unique: true });

// After saving a review, update the reviewee's average rating
reviewSchema.post("save", async function () {
  const Review = this.constructor;
  const User = mongoose.model("User");

  const stats = await Review.aggregate([
    { $match: { reviewee: this.reviewee } },
    {
      $group: {
        _id: "$reviewee",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(this.reviewee, {
      "rating.average": Math.round(stats[0].avgRating * 10) / 10,
      "rating.count": stats[0].count,
    });
  }
});

module.exports = mongoose.model("Review", reviewSchema);