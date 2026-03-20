import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import styles from "./Auth.module.css";

export default function VerifyOTP() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { login } = useAuth();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const userId = state?.userId;
  const email = state?.email;

  if (!userId) {
    navigate("/signup");
    return null;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error("Enter the 6-digit OTP");
    setLoading(true);
    try {
      const res = await api.post("/auth/verify-otp", { userId, otp });
      login(res.data.token, res.data.user);
      toast.success("Email verified! Welcome to CampusRide 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await api.post("/auth/resend-otp", { userId });
      toast.success("New OTP sent to your email");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Left branding panel */}
      <div className={styles.left}>
        <div className={styles.leftGlow} />
        <div className={styles.leftLogo}>🚗 CampusRide</div>
        <h1 className={styles.leftTagline}>
          One step<br />away!
        </h1>
        <p className={styles.leftSub}>
          We sent a 6-digit OTP to your university email. Enter it to verify and start saving on your rides.
        </p>
        <div className={styles.leftFeatures}>
          <div className={styles.leftFeature}>
            <div className={styles.leftFeatureIcon}>📧</div>
            Check your university inbox
          </div>
          <div className={styles.leftFeature}>
            <div className={styles.leftFeatureIcon}>⏱</div>
            OTP expires in 10 minutes
          </div>
          <div className={styles.leftFeature}>
            <div className={styles.leftFeatureIcon}>🔄</div>
            Can resend if you didn't receive it
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className={styles.right}>
        <div className={styles.formWrap}>
          <div className={styles.formLogo}>🚗 CampusRide</div>
          <h2 className={styles.title}>Check your inbox</h2>
          <p className={styles.subtitle}>
            We sent a 6-digit OTP to <strong style={{ color: "var(--gray-800)" }}>{email}</strong>
          </p>

          <form onSubmit={handleVerify} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Enter OTP</label>
              <input
                className={`form-input ${styles.otpInput}`}
                placeholder="000000"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
                autoFocus
                autoComplete="one-time-code"
              />
              <p className={styles.otpHint}>Check spam folder if you don't see it</p>
            </div>

            <button
              type="submit"
              className={`btn btn-primary w-full ${styles.submitBtn}`}
              disabled={loading || otp.length !== 6}
            >
              {loading ? <span className="spinner" /> : "Verify & continue →"}
            </button>
          </form>

          <p className={styles.switchLink}>
            Didn't receive it?{" "}
            <button
              onClick={handleResend}
              disabled={resending}
              style={{
                background: "none", border: "none",
                color: "var(--primary)", fontWeight: 600,
                cursor: "pointer", fontSize: 14, padding: 0,
              }}
            >
              {resending ? "Sending..." : "Resend OTP"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}