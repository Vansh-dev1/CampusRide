import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import RideCard from "../components/common/RideCard";
import styles from "./Dashboard.module.css";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [ridesRes, bookRes] = await Promise.all([
          api.get("/rides"),
          api.get("/bookings/my"),
        ]);

        // Filter out any corrupt/test rides missing required fields
        const validRides = ridesRes.data.rides.filter(
          (r) => r.from?.trim() && r.to?.trim() && r.fare != null && r.departureTime
        );

        setRides(validRides.slice(0, 4));
        setBookings(bookRes.data.bookings.slice(0, 3));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const firstName = user?.name?.split(" ")[0] || "there";

  return (
    <div>
      {/* Greeting */}
      <div className={styles.greeting}>
        <div>
          <h1 className={styles.greetingTitle}>Hey, {firstName} 👋</h1>
          <p className={styles.greetingSubtitle}>Where are you headed today?</p>
        </div>
        <div className={styles.greetingActions}>
          <button className="btn btn-primary" onClick={() => navigate("/post-ride")}>
            + Post a ride
          </button>
          <button className="btn btn-secondary" onClick={() => navigate("/find-ride")}>
            Find a ride
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Rides posted</span>
          <span className={styles.statValue}>{user?.ridesPosted || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Rides taken</span>
          <span className={styles.statValue}>{user?.ridesTaken || 0}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statLabel}>Your rating</span>
          <span className={styles.statValue}>
            {user?.rating?.count > 0 ? `★ ${user.rating.average}` : "—"}
          </span>
        </div>
      </div>

      {/* Available rides */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Available rides</h2>
          <button className={styles.seeAll} onClick={() => navigate("/find-ride")}>
            See all →
          </button>
        </div>

        {loading ? (
          <div className="flex-center" style={{ padding: 48 }}>
            <span className="spinner spinner-dark" />
          </div>
        ) : rides.length === 0 ? (
          <div className={styles.empty}>
            <span style={{ fontSize: 36 }}>🚗</span>
            <p>No rides available right now.</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate("/post-ride")}>
              Be the first to post one
            </button>
          </div>
        ) : (
          <div className={styles.ridesGrid}>
            {rides.map((r) => <RideCard key={r._id} ride={r} />)}
          </div>
        )}
      </section>

      {/* Recent bookings */}
      {bookings.length > 0 && (
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Your recent bookings</h2>
            <button className={styles.seeAll} onClick={() => navigate("/my-rides")}>
              See all →
            </button>
          </div>
          <div className={styles.bookingList}>
            {bookings.map((b) => (
              <div key={b._id} className={styles.bookingRow}>
                <div>
                  <p className={styles.bookingRoute}>
                    {b.ride?.from} → {b.ride?.to}
                  </p>
                  <p className="text-muted">
                    {b.ride?.departureTime &&
                      format(new Date(b.ride.departureTime), "dd MMM, h:mm a")}{" "}
                    · {b.seatsBooked} seat · ₹{b.totalFare} cash
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <span
                    className={`badge ${
                      b.paymentStatus === "paid" ? "badge-success" : "badge-warning"
                    }`}
                  >
                    {b.paymentStatus === "paid" ? "Paid" : "Pay at pickup"}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/chat/${b.ride?._id}`)}
                  >
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}