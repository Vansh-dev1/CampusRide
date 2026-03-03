const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

// POST /api/rides - create ride (rider only)
const createRide = async (req, res) => {
  try {
    const { from, to, date, time, seatsAvailable, fare, vehicleType, vehicleNumber, description } = req.body;
    const ride = await Ride.create({
      rider: req.user._id,
      from, to, date, time,
      seatsAvailable, seatsTotal: seatsAvailable,
      fare: fare || 0, vehicleType, vehicleNumber,
      description: description || '',
      college: req.user.college,
    });
    await ride.populate('rider', 'name email phone rating college');
    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/rides - get all active rides
const getRides = async (req, res) => {
  try {
    const { from, to, date, college } = req.query;
    const filter = { status: 'active', seatsAvailable: { $gt: 0 } };
    if (from) filter.from = { $regex: from, $options: 'i' };
    if (to) filter.to = { $regex: to, $options: 'i' };
    if (date) filter.date = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };
    if (college) filter.college = { $regex: college, $options: 'i' };

    const rides = await Ride.find(filter)
      .populate('rider', 'name email phone rating totalRatings college profilePic')
      .sort({ date: 1, createdAt: -1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/rides/my - get rides posted by logged-in rider
const getMyRides = async (req, res) => {
  try {
    const rides = await Ride.find({ rider: req.user._id }).sort({ createdAt: -1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/rides/:id
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('rider', 'name email phone rating totalRatings college profilePic');
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/rides/:id - update ride
const updateRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.rider.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    const updated = await Ride.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('rider', 'name email phone rating college');
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/rides/:id - cancel ride
const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ message: 'Ride not found' });
    if (ride.rider.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    ride.status = 'cancelled';
    await ride.save();

    // cancel all pending bookings
    await Booking.updateMany({ ride: ride._id, status: 'pending' }, { status: 'cancelled' });
    await Booking.updateMany({ ride: ride._id, status: 'confirmed' }, { status: 'cancelled' });

    res.json({ message: 'Ride cancelled' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { createRide, getRides, getMyRides, getRideById, updateRide, cancelRide };
