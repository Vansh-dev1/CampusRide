const Booking = require('../models/Booking');
const Ride = require('../models/Ride');
const User = require('../models/User');

// POST /api/bookings - book a ride (passenger)
const createBooking = async (req, res) => {
  try {
    const { rideId, seats, message } = req.body;
    const ride = await Ride.findById(rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.status !== 'active') return res.status(400).json({ message: 'Ride is not active' });
    if (ride.rider.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'You cannot book your own ride' });
    if (ride.seatsAvailable < seats)
      return res.status(400).json({ message: 'Not enough seats available' });

    const existing = await Booking.findOne({ ride: rideId, passenger: req.user._id, status: { $in: ['pending', 'confirmed'] } });
    if (existing) return res.status(400).json({ message: 'You already have a booking for this ride' });

    const booking = await Booking.create({
      ride: rideId, passenger: req.user._id,
      seats: seats || 1, message: message || '',
      fare: ride.fare * (seats || 1),
    });
    await booking.populate([
      { path: 'ride', populate: { path: 'rider', select: 'name email phone' } },
      { path: 'passenger', select: 'name email phone' }
    ]);
    res.status(201).json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/my - passenger's own bookings
const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ passenger: req.user._id })
      .populate({ path: 'ride', populate: { path: 'rider', select: 'name email phone rating' } })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings/ride/:rideId - rider sees bookings for their ride
const getBookingsForRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.rider.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const bookings = await Booking.find({ ride: req.params.rideId })
      .populate('passenger', 'name email phone rating totalRatings college')
      .sort({ createdAt: 1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/status - rider confirms/rejects booking
const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findById(req.params.id).populate('ride');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const ride = booking.ride;
    const isRider = ride.rider.toString() === req.user._id.toString();
    const isPassenger = booking.passenger.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (status === 'confirmed' || status === 'rejected') {
      if (!isRider && !isAdmin) return res.status(403).json({ message: 'Only the rider can confirm/reject' });
      if (status === 'confirmed') {
        if (ride.seatsAvailable < booking.seats)
          return res.status(400).json({ message: 'Not enough seats' });
        ride.seatsAvailable -= booking.seats;
        await ride.save();
      }
    } else if (status === 'cancelled') {
      if (!isPassenger && !isAdmin) return res.status(403).json({ message: 'Only the passenger can cancel' });
      if (booking.status === 'confirmed') {
        ride.seatsAvailable += booking.seats;
        await ride.save();
      }
    } else if (status === 'completed') {
      if (!isRider && !isAdmin) return res.status(403).json({ message: 'Only the rider can mark complete' });
    }

    booking.status = status;
    await booking.save();
    await booking.populate([
      { path: 'ride', populate: { path: 'rider', select: 'name email phone' } },
      { path: 'passenger', select: 'name email phone' }
    ]);
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings/:id/rate - rate after ride
const rateBooking = async (req, res) => {
  try {
    const { ratingFor, rating } = req.body; // ratingFor: 'rider' | 'passenger'
    const booking = await Booking.findById(req.params.id).populate('ride');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.status !== 'completed') return res.status(400).json({ message: 'Can only rate completed rides' });

    if (ratingFor === 'rider' && booking.passenger.toString() === req.user._id.toString()) {
      booking.riderRating = rating;
      await booking.save();
      const rider = await User.findById(booking.ride.rider);
      const allBookings = await Booking.find({ ride: { $in: await Ride.find({ rider: rider._id }).distinct('_id') }, riderRating: { $exists: true } });
      rider.totalRatings = allBookings.length;
      rider.rating = allBookings.reduce((sum, b) => sum + b.riderRating, 0) / allBookings.length;
      await rider.save();
    } else if (ratingFor === 'passenger' && booking.ride.rider.toString() === req.user._id.toString()) {
      booking.passengerRating = rating;
      await booking.save();
      const passenger = await User.findById(booking.passenger);
      const allBookings = await Booking.find({ passenger: passenger._id, passengerRating: { $exists: true } });
      passenger.totalRatings = allBookings.length;
      passenger.rating = allBookings.reduce((sum, b) => sum + b.passengerRating, 0) / allBookings.length;
      await passenger.save();
    } else {
      return res.status(403).json({ message: 'Not authorized to rate' });
    }

    res.json({ message: 'Rating submitted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createBooking, getMyBookings, getBookingsForRide, updateBookingStatus, rateBooking };
