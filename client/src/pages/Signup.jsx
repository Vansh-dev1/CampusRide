import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import styles from "./Auth.module.css";

export default function Signup() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", college: "",
  });

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error("Password must be at least 6 characters");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", form);
      toast.success("OTP sent to your university email!");
      navigate("/verify-otp", { state: { userId: res.data.userId, email: form.email } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left branding panel */}
      <div className={styles.left}>
        <div className={styles.leftGlow} />
        <div className={styles.leftLogo}>🚗 CampusRide</div>
        <h1 className={styles.leftTagline}>
          Your campus,<br />your community.
        </h1>
        <p className={styles.leftSub}>
          Stop overpaying for transport. Join thousands of students who share rides and save money every single day.
        </p>
        <div className={styles.leftFeatures}>
          <div className={styles.leftFeature}>
            <div className={styles.leftFeatureIcon}>🎓</div>
            Only university email addresses accepted
          </div>
          <div className={styles.leftFeature}>
            <div className={styles.leftFeatureIcon}>🔒</div>
            OTP-verified for your safety
          </div>
          <div className={styles.leftFeature}>
            <div className={styles.leftFeatureIcon}>🚗</div>
            Post or book rides — be both
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          <div className={styles.formLogo}>🚗 CampusRide</div>
          <h2 className={styles.title}>Create your account</h2>
          <p className={styles.subtitle}>
            Use your university email to get started
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Full name</label>
              <input
                className="form-input"
                placeholder="Your full name"
                value={form.name}
                onChange={set("name")}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">University email</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@university.ac.in"
                value={form.email}
                onChange={set("email")}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Min. 6 characters"
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div className="form-group">
                <label className="form-label">Phone <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional)</span></label>
                <input
                  className="form-input"
                  type="tel"
                  placeholder="10-digit number"
                  value={form.phone}
                  onChange={set("phone")}
                />
              </div>
              <div className="form-group">
                <label className="form-label">College <span style={{ color: "var(--gray-400)", fontWeight: 400 }}>(optional)</span></label>
                <input
                  className="form-input"
                  placeholder="e.g. CSPIT, CSE"
                  value={form.college}
                  onChange={set("college")}
                />
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "Create account →"}
            </button>
          </form>

          <p className={styles.switchLink}>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}