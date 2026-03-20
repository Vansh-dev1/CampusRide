const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Message = require("../models/Message");
const Booking = require("../models/Booking");
const Ride = require("../models/Ride");

// Verify JWT from socket handshake
const authenticateSocket = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return next(new Error("User not found"));

    socket.user = user;
    next();
  } catch {
    next(new Error("Token invalid"));
  }
};

const initSocket = (io) => {
  // Apply auth middleware to all socket connections
  io.use(authenticateSocket);

  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.user.name} (${socket.id})`);

    // Join a personal room using userId (for direct notifications)
    socket.join(socket.user._id.toString());

    // ─── JOIN RIDE ROOM ─────────────────────────────────────────────
    socket.on("join_ride_room", async ({ rideId }) => {
      try {
        const ride = await Ride.findById(rideId);
        if (!ride) return socket.emit("error", { message: "Ride not found" });

        const isRider =
          ride.rider.toString() === socket.user._id.toString();

        const booking = await Booking.findOne({
          ride: rideId,
          passenger: socket.user._id,
          status: "confirmed",
        });

        if (!isRider && !booking) {
          return socket.emit("error", {
            message: "Not authorized to join this chat",
          });
        }

        socket.join(rideId);
        socket.emit("joined_room", { rideId });

        // Notify others in the room
        socket.to(rideId).emit("user_joined", {
          userId: socket.user._id,
          name: socket.user.name,
        });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ─── LEAVE RIDE ROOM ────────────────────────────────────────────
    socket.on("leave_ride_room", ({ rideId }) => {
      socket.leave(rideId);
    });

    // ─── SEND MESSAGE ────────────────────────────────────────────────
    socket.on("send_message", async ({ rideId, text, receiverId }) => {
      try {
        const ride = await Ride.findById(rideId);
        if (!ride) return socket.emit("error", { message: "Ride not found" });

        const isRider =
          ride.rider.toString() === socket.user._id.toString();
        const booking = await Booking.findOne({
          ride: rideId,
          passenger: socket.user._id,
          status: "confirmed",
        });

        if (!isRider && !booking) {
          return socket.emit("error", { message: "Not authorized" });
        }

        const message = await Message.create({
          ride: rideId,
          sender: socket.user._id,
          receiver: receiverId || null,
          text: text.trim(),
        });

        await message.populate("sender", "name avatar");

        // Broadcast to everyone in the ride room
        io.to(rideId).emit("new_message", message);

        // If direct message, also notify receiver's personal room
        if (receiverId) {
          io.to(receiverId).emit("new_message_notification", {
            rideId,
            from: socket.user.name,
            preview: text.slice(0, 60),
          });
        }
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ─── TYPING INDICATORS ──────────────────────────────────────────
    socket.on("typing", ({ rideId }) => {
      socket.to(rideId).emit("user_typing", {
        userId: socket.user._id,
        name: socket.user.name,
      });
    });

    socket.on("stop_typing", ({ rideId }) => {
      socket.to(rideId).emit("user_stop_typing", {
        userId: socket.user._id,
      });
    });

    // ─── MARK MESSAGES READ ─────────────────────────────────────────
    socket.on("mark_read", async ({ rideId }) => {
      try {
        await Message.updateMany(
          { ride: rideId, receiver: socket.user._id, read: false },
          { read: true }
        );
        socket.emit("messages_marked_read", { rideId });
      } catch (err) {
        socket.emit("error", { message: err.message });
      }
    });

    // ─── DISCONNECT ─────────────────────────────────────────────────
    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = { initSocket };