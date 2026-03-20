import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../common/Avatar";
import styles from "./Navbar.module.css";

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/post-ride", label: "Post a ride" },
  { to: "/find-ride", label: "Find a ride" },
  { to: "/my-rides", label: "My rides" },
  { to: "/profile", label: "Profile" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        <button className={styles.brand} onClick={() => navigate("/dashboard")}>
          🚗 <span>CampusRide</span>
        </button>

        {/* Desktop links */}
        <nav className={styles.desktopNav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.link} ${isActive ? styles.linkActive : ""}`
              }
            >
              {item.label}
              {item.label === "My rides" && unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Desktop user avatar */}
        <button
          className={styles.avatarBtn}
          onClick={() => navigate("/profile")}
        >
          <Avatar user={user} size="sm" />
        </button>

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
        >
          <span className={`${styles.bar} ${open ? styles.bar1Open : ""}`} />
          <span className={`${styles.bar} ${open ? styles.bar2Open : ""}`} />
          <span className={`${styles.bar} ${open ? styles.bar3Open : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <nav className={styles.mobileMenu}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.mobileLink} ${isActive ? styles.mobileLinkActive : ""}`
              }
              onClick={() => setOpen(false)}
            >
              {item.label}
              {item.label === "My rides" && unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </NavLink>
          ))}
          <button className={styles.mobileLogout} onClick={handleLogout}>
            Logout
          </button>
        </nav>
      )}
    </header>
  );
}