import { useNavigate } from "react-router-dom";
import { format, isValid } from "date-fns";
import Avatar from "./Avatar";
import styles from "./RideCard.module.css";

const statusBadge = {
  active:    "badge-success",
  full:      "badge-warning",
  departed:  "badge-gray",
  cancelled: "badge-danger",
};

export default function RideCard({ ride }) {
  const navigate = useNavigate();

  // Guard — don't render cards with missing required fields
  if (!ride?.from || !ride?.to || !ride?.fare) return null;

  const departure = ride.departureTime ? new Date(ride.departureTime) : null;
  const dateValid = departure && isValid(departure);
  const isToday = dateValid && new Date().toDateString() === departure.toDateString();

  const seats = ride.availableSeats ?? 0;

  return (
    <div
      className={styles.card}
      onClick={() => navigate(`/rides/${ride._id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && navigate(`/rides/${ride._id}`)}
    >
      {/* Route */}
      <div className={styles.header}>
        <div className={styles.route}>
          <span className={styles.from}>{ride.from}</span>
          <span className={styles.arrow}>→</span>
          <span className={styles.to}>{ride.to}</span>
        </div>
        <span className={`badge ${statusBadge[ride.status] || "badge-gray"}`}>
          {ride.status}
        </span>
      </div>

      {/* Meta */}
      <div className={styles.meta}>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>🕐</span>
          <span>
            {dateValid
              ? (isToday ? "Today, " : "") + format(departure, isToday ? "h:mm a" : "dd MMM, h:mm a")
              : "Time TBD"}
          </span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>💺</span>
          <span>{seats} seat{seats !== 1 ? "s" : ""} left</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.fare}>₹{ride.fare} / seat</span>
        </div>
      </div>

      {/* Rider */}
      {ride.rider && (
        <div className={styles.rider}>
          <Avatar user={ride.rider} size="sm" />
          <div>
            <p className={styles.riderName}>{ride.rider.name}</p>
            {ride.rider.rating?.count > 0 && (
              <p className={styles.riderRating}>
                ★ {ride.rider.rating.average} ({ride.rider.rating.count})
              </p>
            )}
          </div>
          {ride.rider.college && (
            <span className={styles.college}>{ride.rider.college}</span>
          )}
        </div>
      )}

      {ride.description && (
        <p className={styles.description}>{ride.description}</p>
      )}
    </div>
  );
}