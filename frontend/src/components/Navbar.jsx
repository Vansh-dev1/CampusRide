import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Bike, Menu, X, LogOut, User, LayoutDashboard, Search, Shield } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return { to: '/admin', label: 'Admin Panel', icon: <Shield size={16} /> };
    if (user.role === 'rider') return { to: '/rider', label: 'My Rides', icon: <LayoutDashboard size={16} /> };
    return { to: '/passenger', label: 'My Bookings', icon: <LayoutDashboard size={16} /> };
  };

  const dashLink = getDashboardLink();
  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="navbar-brand">
          <Bike size={26} />
          <span>CampusRide</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          {user && user.role !== 'rider' && (
            <Link
              to="/browse"
              className={`nav-link ${isActive('/browse') ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              <Search size={16} />
              Browse Rides
            </Link>
          )}

          {dashLink && (
            <Link
              to={dashLink.to}
              className={`nav-link ${isActive(dashLink.to) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {dashLink.icon}
              {dashLink.label}
            </Link>
          )}

          {user ? (
            <div className="nav-user">
              <span className="nav-username">
                <User size={15} />
                {user.name.split(' ')[0]}
                <span className={`role-pill ${user.role}`}>{user.role}</span>
              </span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                <LogOut size={15} />
                Logout
              </button>
            </div>
          ) : (
            <div className="nav-auth">
              <Link to="/login" className="btn btn-secondary btn-sm" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={() => setMenuOpen(false)}>
                Register
              </Link>
            </div>
          )}
        </div>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </nav>
  );
}
