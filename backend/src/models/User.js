const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['passenger', 'rider', 'admin'], default: 'passenger' },
  college: { type: String, required: true },
  phone: { type: String, required: true },
  profilePic: { type: String, default: '' },
  isVerified: { type: Boolean, default: false },
  isBanned: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  totalRatings: { type: Number, default: 0 },
}, { timestamps: true });

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
