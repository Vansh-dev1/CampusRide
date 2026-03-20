const Ride = require("../models/Ride");

// POST /api/rides  — post a new ride
const postRide = async (req, res) => {
  try {
    const { from, to, departureTime, totalSeats, fare, vehicle, description } =
      req.body;

    const ride = await Ride.create({
      rider: req.user._id,
      from,
      to,
      departureTime,
      totalSeats,
      availableSeats: totalSeats,
      fare,
      vehicle,
      description,
    });

    await ride.populate("rider", "name avatar rating college");

    // Notify via socket (optional real-time feed)
    req.io.emit("new_ride_posted", ride);

    res.status(201).json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rides  — search/list active rides
const getRides = async (req, res) => {
  try {
    const { from, to, date, minSeats } = req.query;

    const filter = { status: "active" };

    if (from) filter.from = { $regex: from, $options: "i" };
    if (to) filter.to = { $regex: to, $options: "i" };
    if (minSeats) filter.availableSeats = { $gte: Number(minSeats) };

    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      filter.departureTime = { $gte: start, $lte: end };
    } else {
      // default: only future rides
      filter.departureTime = { $gte: new Date() };
    }

    const rides = await Ride.find(filter)
      .populate("rider", "name avatar rating college")
      .sort({ departureTime: 1 })
      .limit(50);

    res.json({ success: true, count: rides.length, rides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rides/:id  — single ride detail
const getRideById = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate("rider", "name avatar rating college phone")
      .populate("passengers", "name avatar");

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    res.json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/rides/my/posted  — rides posted by logged-in user
const getMyPostedRides = async (req, res) => {
  try {
    const rides = await Ride.find({ rider: req.user._id })
      .populate("passengers", "name avatar")
      .sort({ createdAt: -1 });

    res.json({ success: true, rides });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/rides/:id/status  — update ride status (rider only)
const updateRideStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    if (ride.rider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    ride.status = status;
    await ride.save();

    // Notify everyone in this ride's room
    req.io.to(ride._id.toString()).emit("ride_status_update", {
      rideId: ride._id,
      status,
    });

    res.json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/rides/:id  — cancel ride (rider only)
const cancelRide = async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });
    }

    if (ride.rider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    ride.status = "cancelled";
    await ride.save();

    req.io.to(ride._id.toString()).emit("ride_status_update", {
      rideId: ride._id,
      status: "cancelled",
    });

    res.json({ success: true, message: "Ride cancelled" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  postRide,
  getRides,
  getRideById,
  getMyPostedRides,
  updateRideStatus,
  cancelRide,
};