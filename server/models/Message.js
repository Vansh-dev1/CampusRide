const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // Chat is scoped to a ride room
    ride: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Ride",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Optional: for direct message within a ride room
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    text: {
      type: String,
      required: [true, "Message text is required"],
      trim: true,
      maxlength: 1000,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for fast retrieval of a ride's chat history
messageSchema.index({ ride: 1, createdAt: 1 });

module.exports = mongoose.model("Message", messageSchema);