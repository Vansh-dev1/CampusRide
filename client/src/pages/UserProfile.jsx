import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import api from "../services/api";
import Avatar from "../components/common/Avatar";
import StarRating from "../components/common/StarRating";
import styles from "./UserProfile.module.css";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const [uRes, rRes] = await Promise.all([
          api.get(`/users/${id}`),
          api.get(`/reviews/user/${id}`),
        ]);
        setProfile(uRes.data.user);
        setReviews(rRes.data.reviews);
      } catch {
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: 300 }}>
        <span className="spinner spinner-dark" />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className={styles.page}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>
        ← Back
      </button>

      {/* Profile hero */}
      <div className={`card ${styles.heroCard}`}>
        <Avatar user={profile} size="lg" />
        <div className={styles.heroInfo}>
          <h1 className={styles.name}>{profile.name}</h1>
          {profile.college && <p className={styles.college}>{profile.college}</p>}
          <p className="text-muted">
            Member since {format(new Date(profile.createdAt), "MMMM yyyy")}
          </p>
        </div>
        {profile.rating?.count > 0 && (
          <div className={styles.ratingBox}>
            <span className={styles.ratingValue}>★ {profile.rating.average}</span>
            <span className={styles.ratingCount}>
              {profile.rating.count} review{profile.rating.count !== 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{profile.ridesPosted || 0}</span>
          <span className={styles.statLabel}>Rides posted</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{profile.ridesTaken || 0}</span>
          <span className={styles.statLabel}>Rides taken</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {profile.rating?.count > 0 ? `★ ${profile.rating.average}` : "—"}
          </span>
          <span className={styles.statLabel}>Avg rating</span>
        </div>
      </div>

      {/* Reviews */}
      <div className="card">
        <h2 className={styles.reviewsTitle}>
          Reviews{" "}
          {reviews.length > 0 && (
            <span className="badge badge-gray">{reviews.length}</span>
          )}
        </h2>

        {reviews.length === 0 ? (
          <p className="text-muted" style={{ padding: "24px 0" }}>No reviews yet.</p>
        ) : (
          <div className={styles.reviewList}>
            {reviews.map((r) => (
              <div key={r._id} className={styles.reviewItem}>
                <div className={styles.reviewHeader}>
                  <Avatar user={r.reviewer} size="sm" />
                  <div style={{ flex: 1 }}>
                    <p className={styles.reviewerName}>{r.reviewer.name}</p>
                    {r.ride && (
                      <p className="text-muted" style={{ fontSize: 12 }}>
                        {r.ride.from} → {r.ride.to}
                      </p>
                    )}
                  </div>
                  <StarRating value={r.rating} readOnly size="sm" />
                </div>
                {r.comment && (
                  <p className={styles.reviewComment}>{r.comment}</p>
                )}
                <p className={styles.reviewDate}>
                  {format(new Date(r.createdAt), "dd MMM yyyy")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}