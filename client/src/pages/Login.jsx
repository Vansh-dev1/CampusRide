import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import styles from "./Auth.module.css";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/auth/login", form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name.split(" ")[0]}! 🎉`);
      navigate("/dashboard");
    } catch (err) {
      const status = err.response?.status;
      if (status === 403) {
        toast.error("Email not verified. Check your inbox.");
        navigate("/verify-otp", {
          state: { userId: err.response.data.userId, email: form.email },
        });
      } else {
        toast.error(err.response?.data?.message || "Invalid email or password");
      }
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
          Ride smarter,<br />spend less.
        </h1>
        <p className={styles.leftSub}>
          Connect with fellow students heading your way. Split the fare and save ₹100+ on every trip out of campus.
        </p>
        <div className={styles.leftFeatures}>
          <div className={styles.leftFeature}>
            <div className={styles.leftFeatureIcon}>✓</div>
            University verified students only
          </div>
          <div className={styles.leftFeature}>
            <div className={styles.leftFeatureIcon}>💬</div>
            Real-time chat with your rider
          </div>
          <div className={styles.leftFeature}>
            <div className={styles.leftFeatureIcon}>💵</div>
            Pay cash at pickup — zero fees
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          <div className={styles.formLogo}>🚗 CampusRide</div>
          <h2 className={styles.title}>Welcome back</h2>
          <p className={styles.subtitle}>
            Login with your university email to continue
          </p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label">University email</label>
              <input
                className="form-input"
                type="email"
                placeholder="you@university.ac.in"
                value={form.email}
                onChange={set("email")}
                required
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-input"
                type="password"
                placeholder="Your password"
                value={form.password}
                onChange={set("password")}
                required
              />
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "Login to CampusRide →"}
            </button>
          </form>

          <p className={styles.switchLink}>
            No account yet? <Link to="/signup">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}