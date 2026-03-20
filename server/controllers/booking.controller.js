const Booking = require("../models/Booking");
const Ride = require("../models/Ride");
const User = require("../models/User");

// POST /api/bookings  — book a ride
const bookRide = async (req, res) => {
  try {
    const { rideId, seatsBooked } = req.body;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    // Can't book own ride
    if (ride.rider.toString() === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot book your own ride" });
    }

    if (ride.status !== "active") {
      return res
        .status(400)
        .json({ success: false, message: `Ride is ${ride.status}` });
    }

    if (ride.availableSeats < seatsBooked) {
      return res
        .status(400)
        .json({ success: false, message: "Not enough seats available" });
    }

    // Check for duplicate booking
    const existingBooking = await Booking.findOne({
      ride: rideId,
      passenger: req.user._id,
    });
    if (existingBooking) {
      return res
        .status(400)
        .json({ success: false, message: "You already booked this ride" });
    }

    const totalFare = ride.fare * seatsBooked;

    const booking = await Booking.create({
      ride: rideId,
      passenger: req.user._id,
      seatsBooked,
      farePerSeat: ride.fare,
      totalFare,
    });

    // Update ride available seats and passengers list
    ride.availableSeats -= seatsBooked;
    ride.passengers.push(req.user._id);
    if (ride.availableSeats === 0) ride.status = "full";
    await ride.save();

    // Update user's rides taken count
    await User.findByIdAndUpdate(req.user._id, { $inc: { ridesTaken: 1 } });

    await booking.populate([
      { path: "ride", populate: { path: "rider", select: "name avatar phone" } },
      { path: "passenger", select: "name avatar" },
    ]);

    // Notify rider via socket
    req.io.to(ride.rider.toString()).emit("booking_alert", {
      message: `${req.user.name} booked ${seatsBooked} seat(s) on your ride`,
      booking,
    });

    // Also notify ride room
    req.io.to(rideId).emit("seats_updated", {
      rideId,
      availableSeats: ride.availableSeats,
      status: ride.status,
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "You already booked this ride" });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/my  — bookings made by logged-in user
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({
        path: "ride",
        populate: { path: "rider", select: "name avatar rating phone" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/bookings/ride/:rideId  — all bookings for a ride (rider only)
const getRideBookings = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    if (ride.rider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    const bookings = await Booking.find({ ride: req.params.rideId })
      .populate("passenger", "name avatar phone college")
      .sort({ createdAt: 1 });

    res.json({ success: true, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/bookings/:id/mark-paid  — rider marks a booking as cash paid
const markPaid = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("ride");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    // Only the rider of the ride can mark it paid
    if (booking.ride.rider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    booking.paymentStatus = "paid";
    booking.paidAt = new Date();
    booking.status = "completed";
    await booking.save();

    // Notify passenger
    req.io
      .to(booking.passenger.toString())
      .emit("payment_confirmed", { bookingId: booking._id });

    res.json({ success: true, booking });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/bookings/:id/cancel  — cancel a booking (passenger only)
const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("ride");

    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    if (booking.passenger.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    if (booking.status === "cancelled") {
      return res
        .status(400)
        .json({ success: false, message: "Already cancelled" });
    }

    booking.status = "cancelled";
    booking.paymentStatus = "cancelled";
    await booking.save();

    // Restore seats on the ride
    const ride = await Ride.findById(booking.ride._id);
    if (ride && ride.status !== "cancelled") {
      ride.availableSeats += booking.seatsBooked;
      ride.passengers = ride.passengers.filter(
        (p) => p.toString() !== req.user._id.toString()
      );
      if (ride.status === "full") ride.status = "active";
      await ride.save();
    }

    res.json({ success: true, message: "Booking cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  bookRide,
  getMyBookings,
  getRideBookings,
  markPaid,
  cancelBooking,
};