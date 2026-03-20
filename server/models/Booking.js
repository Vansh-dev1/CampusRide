const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    passenger: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    seatsBooked: {
      type: Number,
      required: true,
      min: 1,
    },
    farePerSeat: {
      type: Number,
      required: true,
    },
    totalFare: {
      type: Number,
      required: true,
    },
    // Offline payment flow
    paymentMethod: {
      type: String,
      enum: ["offline"],
      default: "offline",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "cancelled"],
      default: "pending",
    },
    // Booking lifecycle
    status: {
      type: String,
      enum: ["confirmed", "cancelled", "completed"],
      default: "confirmed",
    },
    // Rider marks paid after cash is received
    paidAt: {
      type: Date,
    },
    // For future Razorpay integration — add fields here without schema breakage
    // razorpayOrderId: String,
    // razorpayPaymentId: String,
  },
  { timestamps: true }
);

// Prevent a user from double-booking the same ride
bookingSchema.index({ ride: 1, passenger: 1 }, { unique: true });

module.exports = mongoose.model("Booking", bookingSchema);