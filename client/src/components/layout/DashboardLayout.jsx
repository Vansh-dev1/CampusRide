import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useSocket } from "../../context/SocketContext";
import Avatar from "../common/Avatar";
import styles from "./DashboardLayout.module.css";

const navItems = [
  { to: "/dashboard", icon: "⊞", label: "Dashboard" },
  { to: "/post-ride", icon: "+", label: "Post a ride" },
  { to: "/find-ride", icon: "⌕", label: "Find a ride" },
  { to: "/my-rides", icon: "≡", label: "My rides" },
];

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");   // ← goes to landing page on logout
  };

  return (
    <div className={styles.layout}>
      <aside className={styles.sidebar}>
        {/* Brand — click to go to landing page */}
        <button className={styles.brand} onClick={() => navigate("/")}>
          <span className={styles.brandIcon}>🚗</span>
          <span className={styles.brandName}>CampusRide</span>
        </button>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
              {item.label === "My rides" && unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount}</span>
              )}
            </NavLink>
          ))}

          {/* Chat shown as separate nav item with badge */}
          <NavLink
            to="/my-rides"
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.navItemActive : ""}`
            }
            style={{ display: "none" }}
          />
        </nav>

        {/* Divider */}
        <div className={styles.navDivider} />

        {/* Back to home link */}
        <button className={styles.homeLink} onClick={() => navigate("/")}>
          ← Back to home
        </button>

        {/* User footer */}
        <div className={styles.sidebarFooter}>
          <div
            className={styles.userRow}
            onClick={() => navigate("/profile")}
          >
            <Avatar user={user} size="sm" />
            <div className={styles.userInfo}>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}