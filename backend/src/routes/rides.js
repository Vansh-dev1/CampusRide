const express = require('express');
const router = express.Router();
const { createRide, getRides, getMyRides, getRideById, updateRide, cancelRide } = require('../controllers/rideController');
const { protect, riderOnly } = require('../middleware/auth');

router.get('/', protect, getRides);
router.get('/my', protect, riderOnly, getMyRides);
router.get('/:id', protect, getRideById);
router.post('/', protect, riderOnly, createRide);
router.put('/:id', protect, updateRide);
router.delete('/:id', protect, cancelRide);

module.exports = router;
