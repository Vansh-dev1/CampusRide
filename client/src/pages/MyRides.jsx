import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import toast from "react-hot-toast";
import api from "../services/api";
import styles from "./MyRides.module.css";

function TabBtn({ active, onClick, children }) {
  return (
    <button
      className={`${styles.tab} ${active ? styles.tabActive : ""}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

const rideStatusBadge = (status) => {
  const map = {
    active: "badge-success",
    full: "badge-warning",
    departed: "badge-gray",
    cancelled: "badge-danger",
  };
  return <span className={`badge ${map[status] || "badge-gray"}`}>{status}</span>;
};

const payBadge = (status) => {
  if (status === "paid") return <span className="badge badge-success">Paid</span>;
  if (status === "cancelled") return <span className="badge badge-danger">Cancelled</span>;
  return <span className="badge badge-warning">Pay at pickup</span>;
};

export default function MyRides() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("booked");
  const [booked, setBooked] = useState([]);
  const [posted, setPosted] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const [bookRes, rideRes] = await Promise.all([
          api.get("/bookings/my"),
          api.get("/rides/my/posted"),
        ]);
        setBooked(bookRes.data.bookings);
        setPosted(rideRes.data.rides);
      } catch {
        toast.error("Failed to load rides");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Cancel this booking?")) return;
    try {
      await api.patch(`/bookings/${bookingId}/cancel`);
      setBooked((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled", paymentStatus: "cancelled" } : b
        )
      );
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div>
      <h1 className={styles.title}>My rides</h1>

      <div className={styles.tabs}>
        <TabBtn active={tab === "booked"} onClick={() => setTab("booked")}>
          Booked ({booked.length})
        </TabBtn>
        <TabBtn active={tab === "posted"} onClick={() => setTab("posted")}>
          Posted ({posted.length})
        </TabBtn>
      </div>

      {loading ? (
        <div className="flex-center" style={{ padding: 60 }}>
          <span className="spinner spinner-dark" />
        </div>
      ) : (
        <>
          {/* Booked rides tab */}
          {tab === "booked" && (
            <div className={styles.list}>
              {booked.length === 0 ? (
                <div className={styles.empty}>
                  <span style={{ fontSize: 40 }}>🚗</span>
                  <p>You haven't booked any rides yet.</p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate("/find-ride")}
                  >
                    Find a ride
                  </button>
                </div>
              ) : (
                booked.map((b) => (
                  <div key={b._id} className={styles.row}>
                    <div className={styles.rowMain}>
                      <div>
                        <p className={styles.route}>
                          {b.ride?.from} → {b.ride?.to}
                        </p>
                        <p className="text-muted">
                          {b.ride?.departureTime &&
                            format(new Date(b.ride.departureTime), "dd MMM, h:mm a")}{" "}
                          · {b.seatsBooked} seat{b.seatsBooked > 1 ? "s" : ""} · ₹
                          {b.totalFare}
                        </p>
                      </div>
                      <div className={styles.rowBadges}>
                        {rideStatusBadge(b.ride?.status)}
                        {payBadge(b.paymentStatus)}
                      </div>
                    </div>
                    <div className={styles.rowActions}>
                      {b.ride?._id && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/chat/${b.ride._id}`)}
                        >
                          💬 Chat
                        </button>
                      )}
                      {b.ride?._id && (
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => navigate(`/rides/${b.ride._id}`)}
                        >
                          View ride
                        </button>
                      )}
                      {b.status === "confirmed" && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => cancelBooking(b._id)}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Posted rides tab */}
          {tab === "posted" && (
            <div className={styles.list}>
              {posted.length === 0 ? (
                <div className={styles.empty}>
                  <span style={{ fontSize: 40 }}>📍</span>
                  <p>You haven't posted any rides yet.</p>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => navigate("/post-ride")}
                  >
                    Post a ride
                  </button>
                </div>
              ) : (
                posted.map((r) => (
                  <div key={r._id} className={styles.row}>
                    <div className={styles.rowMain}>
                      <div>
                        <p className={styles.route}>
                          {r.from} → {r.to}
                        </p>
                        <p className="text-muted">
                          {format(new Date(r.departureTime), "dd MMM, h:mm a")} ·{" "}
                          {r.passengers?.length || 0}/{r.totalSeats} passengers · ₹
                          {r.fare}/seat
                        </p>
                      </div>
                      {rideStatusBadge(r.status)}
                    </div>
                    <div className={styles.rowActions}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/chat/${r._id}`)}
                      >
                        💬 Group chat
                      </button>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => navigate(`/rides/${r._id}`)}
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}