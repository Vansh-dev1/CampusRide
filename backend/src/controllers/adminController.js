const User = require('../models/User');
const Ride = require('../models/Ride');
const Booking = require('../models/Booking');

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalRides, totalBookings, activeRides, completedRides, cancelledRides] = await Promise.all([
      User.countDocuments(),
      Ride.countDocuments(),
      Booking.countDocuments(),
      Ride.countDocuments({ status: 'active' }),
      Ride.countDocuments({ status: 'completed' }),
      Ride.countDocuments({ status: 'cancelled' }),
    ]);
    const riders = await User.countDocuments({ role: 'rider' });
    const passengers = await User.countDocuments({ role: 'passenger' });
    res.json({ totalUsers, totalRides, totalBookings, activeRides, completedRides, cancelledRides, riders, passengers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/ban
const toggleBan = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ message: 'Cannot ban admin' });
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ message: `User ${user.isBanned ? 'banned' : 'unbanned'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/rides
const getAllRides = async (req, res) => {
  try {
    const rides = await Ride.find()
      .populate('rider', 'name email phone college')
      .sort({ createdAt: -1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/bookings
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate('passenger', 'name email phone')
      .populate({ path: 'ride', populate: { path: 'rider', select: 'name email phone' } })
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/rides/:id
const deleteRide = async (req, res) => {
  try {
    await Ride.findByIdAndDelete(req.params.id);
    await Booking.deleteMany({ ride: req.params.id });
    res.json({ message: 'Ride deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getStats, getAllUsers, toggleBan, getAllRides, getAllBookings, deleteRide };
