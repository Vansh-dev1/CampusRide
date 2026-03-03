const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  ride: { type: mongoose.Schema.Types.ObjectId, ref: 'Ride', required: true },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  seats: { type: Number, required: true, default: 1 },
  status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'cancelled', 'completed'], default: 'pending' },
  message: { type: String, default: '' },
  fare: { type: Number, default: 0 },
  riderRating: { type: Number, min: 1, max: 5 },
  passengerRating: { type: Number, min: 1, max: 5 },
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
