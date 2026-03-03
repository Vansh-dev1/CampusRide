const express = require('express');
const router = express.Router();
const { createBooking, getMyBookings, getBookingsForRide, updateBookingStatus, rateBooking } = require('../controllers/bookingController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/ride/:rideId', protect, getBookingsForRide);
router.put('/:id/status', protect, updateBookingStatus);
router.post('/:id/rate', protect, rateBooking);

module.exports = router;
