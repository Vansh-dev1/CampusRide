const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role, college, phone } = req.body;
    if (!name || !email || !password || !college || !phone)
      return res.status(400).json({ message: 'All fields are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already registered' });

    const allowedRoles = ['passenger', 'rider'];
    const userRole = allowedRoles.includes(role) ? role : 'passenger';

    const user = await User.create({ name, email, password, role: userRole, college, phone });
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, college: user.college, phone: user.phone,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: 'Invalid email or password' });
    if (user.isBanned) return res.status(403).json({ message: 'Your account has been banned' });

    res.json({
      _id: user._id, name: user.name, email: user.email,
      role: user.role, college: user.college, phone: user.phone,
      rating: user.rating, totalRatings: user.totalRatings,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  res.json(user);
};

module.exports = { register, login, getMe };
