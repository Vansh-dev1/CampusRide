const mongoose = require("mongoose");

const rideSchema = new mongoose.Schema(
  {
    rider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    from: {
      type: String,
      required: [true, "Starting location is required"],
      trim: true,
    },
    to: {
      type: String,
      required: [true, "Destination is required"],
      trim: true,
    },
    departureTime: {
      type: Date,
      required: [true, "Departure time is required"],
    },
    totalSeats: {
      type: Number,
      required: [true, "Total seats is required"],
      min: 1,
      max: 6,
    },
    availableSeats: {
      type: Number,
      required: true,
    },
    fare: {
      type: Number,
      required: [true, "Fare is required"],
      min: 0,
    },
    vehicle: {
      type: { type: String, trim: true }, // bike, car, auto, etc.
      model: { type: String, trim: true },
      number: { type: String, trim: true },
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
    },
    status: {
      type: String,
      enum: ["active", "full", "departed", "cancelled"],
      default: "active",
    },
    // passengers who have booked
    passengers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Auto set availableSeats = totalSeats on create
rideSchema.pre("save", function (next) {
  if (this.isNew) {
    this.availableSeats = this.totalSeats;
  }
  next();
});

// Index for fast search queries
rideSchema.index({ from: "text", to: "text" });
rideSchema.index({ departureTime: 1, status: 1 });

module.exports = mongoose.model("Ride", rideSchema);