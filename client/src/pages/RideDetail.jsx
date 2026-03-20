import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/common/Avatar";
import styles from "./RideDetail.module.css";

const statusBadge = {
  active: "badge-success",
  full: "badge-warning",
  departed: "badge-gray",
  cancelled: "badge-danger",
};

export default function RideDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [ride, setRide] = useState(null);
  const [myBooking, setMyBooking] = useState(null);
  const [rideBookings, setRideBookings] = useState([]);
  const [seats, setSeats] = useState(1);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const rideRes = await api.get(`/rides/${id}`);
        const r = rideRes.data.ride;
        setRide(r);

        // Check if current user already has a booking
        const bookRes = await api.get("/bookings/my");
        const found = bookRes.data.bookings.find(
          (b) => (b.ride?._id === id || b.ride === id) && b.status === "confirmed"
        );
        setMyBooking(found || null);

        // If current user is the rider, load all passenger bookings
        if (r.rider._id === user._id) {
          const rbRes = await api.get(`/bookings/ride/${id}`);
          setRideBookings(rbRes.data.bookings);
        }
      } catch {
        toast.error("Ride not found");
        navigate("/find-ride");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, user._id, navigate]);

  const handleBook = async () => {
    setBooking(true);
    try {
      const res = await api.post("/bookings", { rideId: id, seatsBooked: seats });
      setMyBooking(res.data.booking);
      setRide((r) => ({
        ...r,
        availableSeats: r.availableSeats - seats,
        status: r.availableSeats - seats === 0 ? "full" : r.status,
      }));
      toast.success("Ride booked! Pay cash to rider at pickup.");
    } catch (err) {
      toast.error(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  const handleCancelBooking = async () => {
    if (!window.confirm("Cancel your booking?")) return;
    try {
      await api.patch(`/bookings/${myBooking._id}/cancel`);
      setRide((r) => ({ ...r, availableSeats: r.availableSeats + myBooking.seatsBooked }));
      setMyBooking(null);
      toast.success("Booking cancelled");
    } catch {
      toast.error("Failed to cancel booking");
    }
  };

  const handleMarkPaid = async (bookingId) => {
    try {
      await api.patch(`/bookings/${bookingId}/mark-paid`);
      setRideBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, paymentStatus: "paid", status: "completed" } : b
        )
      );
      toast.success("Marked as paid");
    } catch {
      toast.error("Failed");
    }
  };

  const handleCancelRide = async () => {
    if (!window.confirm("Cancel this ride? All passengers will be notified.")) return;
    try {
      await api.delete(`/rides/${id}`);
      toast.success("Ride cancelled");
      navigate("/my-rides");
    } catch {
      toast.error("Failed to cancel ride");
    }
  };

  const handleStatusUpdate = async (status) => {
    try {
      await api.patch(`/rides/${id}/status`, { status });
      setRide((r) => ({ ...r, status }));
      toast.success(`Ride marked as ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex-center" style={{ height: 300 }}>
        <span className="spinner spinner-dark" />
      </div>
    );
  }
  if (!ride) return null;

  const isRider = ride.rider._id === user._id;
  const isPassenger = !!myBooking;
  const canBook =
    !isRider && !isPassenger && ride.status === "active" && ride.availableSeats > 0;

  return (
    <div>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Back</button>

      {/* Route heading */}
      <div className={styles.header}>
        <div className={styles.route}>
          <h1 className={styles.routeText}>{ride.from}</h1>
          <span className={styles.arrow}>→</span>
          <h1 className={styles.routeText}>{ride.to}</h1>
        </div>
        <span className={`badge ${statusBadge[ride.status] || "badge-gray"}`}>
          {ride.status}
        </span>
      </div>

      <div className={styles.grid}>
        {/* ── Left: details ── */}
        <div className={styles.details}>

          {/* Core info */}
          <div className="card">
            <h2 className={styles.cardTitle}>Ride details</h2>
            <div className={styles.detailsList}>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Departure</span>
                <span className={styles.detailValue}>
                  {format(new Date(ride.departureTime), "dd MMM yyyy, h:mm a")}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Seats available</span>
                <span className={styles.detailValue}>
                  {ride.availableSeats} / {ride.totalSeats}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Fare per seat</span>
                <span className={styles.detailValue} style={{ color: "var(--primary)", fontWeight: 700 }}>
                  ₹{ride.fare}
                </span>
              </div>
              <div className={styles.detailRow}>
                <span className={styles.detailLabel}>Payment</span>
                <span className={styles.detailValue}>Cash at pickup</span>
              </div>
              {ride.vehicle?.type && (
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Vehicle</span>
                  <span className={styles.detailValue}>
                    {ride.vehicle.type}
                    {ride.vehicle.model ? ` · ${ride.vehicle.model}` : ""}
                    {ride.vehicle.number ? ` · ${ride.vehicle.number}` : ""}
                  </span>
                </div>
              )}
            </div>
            {ride.description && (
              <p className={styles.description}>{ride.description}</p>
            )}
          </div>

          {/* Rider info */}
          <div
            className={`card ${styles.riderCard}`}
            onClick={() => navigate(`/users/${ride.rider._id}`)}
            style={{ cursor: "pointer" }}
          >
            <Avatar user={ride.rider} size="md" />
            <div>
              <p className={styles.riderName}>{ride.rider.name}</p>
              {ride.rider.college && (
                <p className="text-muted">{ride.rider.college}</p>
              )}
              {ride.rider.rating?.count > 0 && (
                <p style={{ color: "#f59e0b", fontSize: 13 }}>
                  ★ {ride.rider.rating.average} ({ride.rider.rating.count} reviews)
                </p>
              )}
            </div>
            <span style={{ marginLeft: "auto", color: "var(--primary)", fontSize: 13 }}>
              View profile →
            </span>
          </div>

          {/* Rider: passenger list */}
          {isRider && rideBookings.length > 0 && (
            <div className="card">
              <h2 className={styles.cardTitle}>
                Passengers ({rideBookings.length})
              </h2>
              <div className={styles.passengerList}>
                {rideBookings.map((b) => (
                  <div key={b._id} className={styles.passengerRow}>
                    <Avatar user={b.passenger} size="sm" />
                    <div className={styles.passengerInfo}>
                      <p className={styles.passengerName}>{b.passenger.name}</p>
                      <p className="text-muted">
                        {b.seatsBooked} seat · ₹{b.totalFare} cash
                      </p>
                    </div>
                    <div className={styles.passengerActions}>
                      <span
                        className={`badge ${
                          b.paymentStatus === "paid" ? "badge-success" : "badge-warning"
                        }`}
                      >
                        {b.paymentStatus === "paid" ? "Paid" : "Pending"}
                      </span>
                      {b.paymentStatus !== "paid" && b.status !== "cancelled" && (
                        <button
                          className="btn btn-success btn-sm"
                          onClick={() => handleMarkPaid(b._id)}
                        >
                          Mark paid
                        </button>
                      )}
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/chat/${id}`)}
                      >
                        Chat
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: action panel ── */}
        <div className={styles.actionPanel}>

          {/* Already booked */}
          {isPassenger && (
            <div className="card">
              <h2 className={styles.cardTitle}>Your booking</h2>
              <div className={styles.bookingSummary}>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Seats booked</span>
                  <span className={styles.detailValue}>{myBooking.seatsBooked}</span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Total fare</span>
                  <span style={{ fontWeight: 700, color: "var(--primary)", fontSize: 20 }}>
                    ₹{myBooking.totalFare}
                  </span>
                </div>
                <div className={styles.detailRow}>
                  <span className={styles.detailLabel}>Payment</span>
                  <span
                    className={`badge ${
                      myBooking.paymentStatus === "paid" ? "badge-success" : "badge-warning"
                    }`}
                  >
                    {myBooking.paymentStatus === "paid" ? "Paid" : "Pay cash at pickup"}
                  </span>
                </div>
              </div>
              <div className={styles.actionBtns}>
                <button
                  className="btn btn-primary w-full"
                  onClick={() => navigate(`/chat/${id}`)}
                >
                  💬 Chat with rider
                </button>
                <button
                  className="btn btn-secondary w-full"
                  onClick={handleCancelBooking}
                >
                  Cancel booking
                </button>
              </div>
            </div>
          )}

          {/* Book now */}
          {canBook && (
            <div className="card">
              <h2 className={styles.cardTitle}>Book this ride</h2>
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label className="form-label">Number of seats</label>
                <select
                  className="form-input"
                  value={seats}
                  onChange={(e) => setSeats(Number(e.target.value))}
                >
                  {Array.from({ length: ride.availableSeats }, (_, i) => i + 1).map(
                    (n) => (
                      <option key={n} value={n}>
                        {n} seat{n > 1 ? "s" : ""}
                      </option>
                    )
                  )}
                </select>
              </div>
              <div className={styles.fareBreakdown}>
                <span className={styles.fareLabel}>Total (pay cash at pickup)</span>
                <span className={styles.fareTotal}>₹{ride.fare * seats}</span>
              </div>
              <button
                className="btn btn-primary w-full"
                style={{ marginTop: 14 }}
                onClick={handleBook}
                disabled={booking}
              >
                {booking ? <span className="spinner" /> : `Confirm booking — ₹${ride.fare * seats}`}
              </button>
              <p className="text-muted" style={{ marginTop: 8, textAlign: "center", fontSize: 12 }}>
                You'll be added to the ride chat after booking.
              </p>
            </div>
          )}

          {/* Rider controls */}
          {isRider && (
            <div className="card">
              <h2 className={styles.cardTitle}>Manage your ride</h2>
              <p className="text-muted" style={{ marginBottom: 16 }}>
                {rideBookings.length} passenger{rideBookings.length !== 1 ? "s" : ""} booked
              </p>
              <div className={styles.actionBtns}>
                <button
                  className="btn btn-primary w-full"
                  onClick={() => navigate(`/chat/${id}`)}
                >
                  💬 Open group chat
                </button>
                {ride.status === "active" && (
                  <button
                    className="btn btn-secondary w-full"
                    onClick={() => handleStatusUpdate("departed")}
                  >
                    Mark as departed
                  </button>
                )}
                {["active", "full"].includes(ride.status) && (
                  <button className="btn btn-danger w-full" onClick={handleCancelRide}>
                    Cancel this ride
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Ride full — not rider or passenger */}
          {!isRider && !isPassenger && ride.status === "full" && (
            <div className="card" style={{ textAlign: "center", color: "var(--gray-500)" }}>
              <p style={{ marginBottom: 12 }}>This ride is full.</p>
              <button className="btn btn-secondary w-full" onClick={() => navigate("/find-ride")}>
                Find another ride
              </button>
            </div>
          )}

          {/* Cancelled */}
          {!isRider && ride.status === "cancelled" && (
            <div className="card" style={{ textAlign: "center", color: "var(--gray-500)" }}>
              <p style={{ marginBottom: 12 }}>This ride has been cancelled.</p>
              <button className="btn btn-secondary w-full" onClick={() => navigate("/find-ride")}>
                Find another ride
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}