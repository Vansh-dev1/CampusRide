const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  rider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  seatsAvailable: { type: Number, required: true, min: 1, max: 8 },
  seatsTotal: { type: Number, required: true, min: 1, max: 8 },
  fare: { type: Number, default: 0 },
  vehicleType: { type: String, enum: ['bike', 'car', 'scooty', 'auto'], required: true },
  vehicleNumber: { type: String, required: true },
  description: { type: String, default: '' },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  college: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Ride', rideSchema);
