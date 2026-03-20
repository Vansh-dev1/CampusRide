const Message = require("../models/Message");
const Booking = require("../models/Booking");
const Ride = require("../models/Ride");

// Check if user is allowed in a ride room (rider or confirmed passenger)
const isRideParticipant = async (userId, rideId) => {
  const ride = await Ride.findById(rideId);
  if (!ride) return false;
  if (ride.rider.toString() === userId.toString()) return true;

  const booking = await Booking.findOne({
    ride: rideId,
    passenger: userId,
    status: "confirmed",
  });
  return !!booking;
};

// GET /api/messages/:rideId  — fetch chat history for a ride
const getMessages = async (req, res) => {
  try {
    const { rideId } = req.params;

    const allowed = await isRideParticipant(req.user._id, rideId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Only the rider and confirmed passengers can view this chat",
      });
    }

    const messages = await Message.find({ ride: rideId })
      .populate("sender", "name avatar")
      .sort({ createdAt: 1 });

    // Mark all messages as read for this user
    await Message.updateMany(
      { ride: rideId, receiver: req.user._id, read: false },
      { read: true }
    );

    res.json({ success: true, messages });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/messages/:rideId  — send a message (REST fallback, socket is primary)
const sendMessage = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { text, receiverId } = req.body;

    const allowed = await isRideParticipant(req.user._id, rideId);
    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to send messages in this ride",
      });
    }

    const message = await Message.create({
      ride: rideId,
      sender: req.user._id,
      receiver: receiverId || null,
      text,
    });

    await message.populate("sender", "name avatar");

    // Emit to ride room via socket
    req.io.to(rideId).emit("new_message", message);

    res.status(201).json({ success: true, message });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/messages/unread-count  — total unread messages for logged-in user
const getUnreadCount = async (req, res) => {
  try {
    const count = await Message.countDocuments({
      receiver: req.user._id,
      read: false,
    });

    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getMessages, sendMessage, getUnreadCount };