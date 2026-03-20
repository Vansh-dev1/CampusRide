import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import styles from "./Landing.module.css";

const stats = [
  { value: "₹150+", label: "saved per trip" },
  { value: "100%", label: "university verified" },
  { value: "0", label: "platform fees" },
];

const features = [
  {
    icon: "💸",
    title: "Split the fare",
    desc: "Stop overpaying rickshaw drivers. Share a ride with fellow students and split costs equally.",
  },
  {
    icon: "🎓",
    title: "Campus verified",
    desc: "Only students with a valid university email can join. Safe, trusted, campus-only.",
  },
  {
    icon: "💬",
    title: "In-app chat",
    desc: "Coordinate pickup spots and timing directly with your rider — no need to share phone numbers.",
  },
  {
    icon: "💵",
    title: "Cash at pickup",
    desc: "Zero payment gateway fees. Hand the fare to your rider when you meet. Simple as that.",
  },
];

const steps = [
  { n: "01", title: "Sign up", desc: "Register with your university email and verify via OTP" },
  { n: "02", title: "Find or post", desc: "Search for rides heading your way, or post your own with empty seats" },
  { n: "03", title: "Book & chat", desc: "Confirm your seat and chat with the rider to coordinate pickup" },
  { n: "04", title: "Pay at pickup", desc: "Hand the agreed fare in cash — no app payments, no hassle" },
];

export default function Landing() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className={styles.page}>

      {/* ─── Navbar ─── */}
      <header className={styles.nav}>
        <div className={styles.navInner}>
          <div className={styles.navBrand}>
            <span className={styles.navLogo}>🚗</span>
            <span className={styles.navName}>CampusRide</span>
          </div>
          <div className={styles.navActions}>
            {user ? (
              <>
                <span className={styles.navGreet}>Hey, {user.name.split(" ")[0]} 👋</span>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate("/dashboard")}>
                  Dashboard
                </button>
                <button className="btn btn-sm" style={{ background: "var(--danger-light)", color: "var(--danger)", border: "none" }} onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary btn-sm" onClick={() => navigate("/login")}>
                  Login
                </button>
                <button className="btn btn-primary btn-sm" onClick={() => navigate("/signup")}>
                  Sign up free
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.heroInner}>
          <div className={styles.heroLeft}>
            <div className={styles.heroPill}>
              <span className={styles.pillDot} />
              For university students · GIDC & beyond
            </div>

            <h1 className={styles.heroTitle}>
              Tired of paying<br />
              <span className={styles.heroAccent}>₹100 just to</span><br />
              leave campus?
            </h1>

            <p className={styles.heroSubtitle}>
              CampusRide connects students heading the same direction.
              Share a seat, split the fare — everyone saves.
            </p>

            <div className={styles.heroCta}>
              <button
                className="btn btn-primary btn-xl"
                onClick={() => navigate(user ? "/find-ride" : "/signup")}
              >
                Find a ride →
              </button>
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => navigate(user ? "/post-ride" : "/signup")}
              >
                Post your ride
              </button>
            </div>

            <p className={styles.heroMicro}>
              Free to use · Verified students only · Pay cash at pickup
            </p>

            {/* Stats */}
            <div className={styles.heroStats}>
              {stats.map((s) => (
                <div key={s.label} className={styles.heroStat}>
                  <span className={styles.heroStatValue}>{s.value}</span>
                  <span className={styles.heroStatLabel}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Mock ride card */}
          <div className={styles.heroRight}>
            <div className={styles.mockCard}>
              <div className={styles.mockHeader}>
                <span className={styles.mockHeaderLabel}>Available now</span>
                <span className="badge badge-success">2 seats</span>
              </div>

              <div className={styles.mockRoute}>
                <div className={styles.mockStop}>
                  <span className={styles.mockDot} style={{ background: "#22c55e" }} />
                  <div>
                    <p className={styles.mockStopName}>GIDC Main Gate</p>
                    <p className={styles.mockStopSub}>Departure point</p>
                  </div>
                </div>
                <div className={styles.mockLine} />
                <div className={styles.mockStop}>
                  <span className={styles.mockDot} style={{ background: "var(--primary)" }} />
                  <div>
                    <p className={styles.mockStopName}>City Bus Stand</p>
                    <p className={styles.mockStopSub}>Drop-off point</p>
                  </div>
                </div>
              </div>

              <div className={styles.mockMeta}>
                <div className={styles.mockMetaItem}>
                  <span className={styles.mockMetaIcon}>🕐</span>
                  <span>Today, 6:30 PM</span>
                </div>
                <div className={styles.mockMetaItem}>
                  <span className={styles.mockMetaIcon}>💺</span>
                  <span>2 of 4 seats left</span>
                </div>
              </div>

              <div className={styles.mockDivider} />

              <div className={styles.mockRider}>
                <div className="avatar avatar-sm">RK</div>
                <div className={styles.mockRiderInfo}>
                  <p className={styles.mockRiderName}>Raj K.</p>
                  <p className={styles.mockRiderRating}>★ 4.8 · 24 rides</p>
                </div>
                <div className={styles.mockFare}>
                  <span className={styles.mockFareAmount}>₹25</span>
                  <span className={styles.mockFarePer}>/seat</span>
                </div>
              </div>

              <button
                className="btn btn-primary w-full"
                style={{ marginTop: 16 }}
                onClick={() => navigate(user ? "/find-ride" : "/signup")}
              >
                Book this ride
              </button>
            </div>

            <div className={styles.mockBadge}>
              <span>🎉</span>
              <span>Students saved <strong>₹75</strong> on this route today</span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className={styles.features}>
        <div className="container">
          <div className={styles.sectionHead}>
            <p className={styles.sectionTag}>Why students love it</p>
            <h2 className={styles.sectionTitle}>Everything you need,<br />nothing you don't</h2>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIconWrap}>{f.icon}</div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How it works ─── */}
      <section className={styles.how}>
        <div className="container">
          <div className={styles.sectionHead}>
            <p className={styles.sectionTag}>Simple by design</p>
            <h2 className={styles.sectionTitle}>Ready in 4 steps</h2>
          </div>
          <div className={styles.stepsGrid}>
            {steps.map((s, i) => (
              <div key={s.n} className={styles.stepCard}>
                <div className={styles.stepNum}>{s.n}</div>
                {i < steps.length - 1 && <div className={styles.stepConnector} />}
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaGlow} />
          <h2 className={styles.ctaTitle}>
            Cut your commute costs<br />starting today
          </h2>
          <p className={styles.ctaSubtitle}>
            Join your campus community. No fees, no waiting — just affordable rides.
          </p>
          <button
            className="btn btn-xl"
            style={{ background: "#fff", color: "var(--primary)", fontWeight: 700 }}
            onClick={() => navigate(user ? "/dashboard" : "/signup")}
          >
            {user ? "Go to dashboard →" : "Get started free →"}
          </button>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>🚗 CampusRide</div>
          <p className={styles.footerText}>Built for students, by students · © 2025</p>
        </div>
      </footer>
    </div>
  );
}