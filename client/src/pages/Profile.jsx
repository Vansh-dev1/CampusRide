import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Avatar from "../components/common/Avatar";
import StarRating from "../components/common/StarRating";
import styles from "./Profile.module.css";

export default function Profile() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  const [form, setForm] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    college: user?.college || "",
  });

  const fileRef = useRef(null);

  useEffect(() => {
    if (!user?._id) return;
    api
      .get(`/reviews/user/${user._id}`)
      .then((res) => setReviews(res.data.reviews))
      .catch(() => {})
      .finally(() => setLoadingReviews(false));
  }, [user?._id]);

  const set = (field) => (e) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.patch("/users/profile", form);
      updateUser(res.data.user);
      setEditing(false);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error("Image must be under 5MB");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("avatar", file);
      const res = await api.patch("/users/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      updateUser({ avatar: res.data.avatar });
      toast.success("Profile photo updated!");
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <h1 className={styles.title}>Profile</h1>

      <div className={styles.grid}>
        {/* ── Left column ── */}
        <div className={styles.left}>

          {/* Avatar + stats card */}
          <div className="card">
            <div className={styles.avatarSection}>
              <div style={{ position: "relative", display: "inline-block" }}>
                <Avatar user={user} size="lg" />
                <button
                  className={styles.avatarEditBtn}
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                  title="Change photo"
                >
                  {uploading ? "…" : "✏"}
                </button>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleAvatarChange}
              />
              <div>
                <h2 className={styles.profileName}>{user?.name}</h2>
                <p className="text-muted">{user?.email}</p>
                {user?.college && <p className="text-muted">{user.college}</p>}
              </div>
            </div>

            {user?.rating?.count > 0 && (
              <div className={styles.ratingRow}>
                <StarRating value={Math.round(user.rating.average)} readOnly />
                <span className="text-muted">
                  {user.rating.average} · {user.rating.count} reviews
                </span>
              </div>
            )}

            <hr className="divider" />

            <div className={styles.stats}>
              <div className={styles.stat}>
                <span className={styles.statVal}>{user?.ridesPosted || 0}</span>
                <span className={styles.statLbl}>Rides posted</span>
              </div>
              <div className={styles.stat}>
                <span className={styles.statVal}>{user?.ridesTaken || 0}</span>
                <span className={styles.statLbl}>Rides taken</span>
              </div>
            </div>
          </div>

          {/* Edit info card */}
          <div className="card">
            <div className={styles.editHeader}>
              <h2 className={styles.sectionTitle}>Personal info</h2>
              {!editing && (
                <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>
                  Edit
                </button>
              )}
            </div>

            {editing ? (
              <form onSubmit={handleSave} className={styles.form}>
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input className="form-input" value={form.name} onChange={set("name")} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone number</label>
                  <input className="form-input" type="tel" placeholder="10-digit number" value={form.phone} onChange={set("phone")} />
                </div>
                <div className="form-group">
                  <label className="form-label">College / department</label>
                  <input className="form-input" value={form.college} onChange={set("college")} />
                </div>
                <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                  <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner" /> : "Save changes"}
                  </button>
                </div>
              </form>
            ) : (
              <div className={styles.infoList}>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Email</span>
                  <span className={styles.infoValue}>{user?.email}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Phone</span>
                  <span className={styles.infoValue}>{user?.phone || "Not added"}</span>
                </div>
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>College</span>
                  <span className={styles.infoValue}>{user?.college || "Not added"}</span>
                </div>
              </div>
            )}

            <hr className="divider" />
            <button
              className="btn btn-danger btn-sm"
              onClick={() => { logout(); navigate("/"); }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* ── Right column: reviews ── */}
        <div className={styles.right}>
          <div className="card">
            <h2 className={styles.sectionTitle} style={{ marginBottom: 20 }}>
              Reviews received{" "}
              {reviews.length > 0 && (
                <span className="badge badge-gray">{reviews.length}</span>
              )}
            </h2>

            {loadingReviews ? (
              <div className="flex-center" style={{ padding: 40 }}>
                <span className="spinner spinner-dark" />
              </div>
            ) : reviews.length === 0 ? (
              <div className={styles.emptyReviews}>
                <p>No reviews yet.</p>
                <p className="text-muted">Complete rides to start collecting ratings.</p>
              </div>
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
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}