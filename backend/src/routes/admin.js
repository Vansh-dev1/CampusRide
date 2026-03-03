const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, toggleBan, getAllRides, getAllBookings, deleteRide } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/users/:id/ban', toggleBan);
router.get('/rides', getAllRides);
router.delete('/rides/:id', deleteRide);
router.get('/bookings', getAllBookings);

module.exports = router;
