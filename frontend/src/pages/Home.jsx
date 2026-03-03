import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Bike, Users, Shield, Star, ArrowRight, CheckCircle } from 'lucide-react';
import './Home.css';

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="home">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content container">
          <div className="hero-badge">
            <Bike size={16} />
            Affordable Campus Travel
          </div>
          <h1 className="hero-title">
            Share Rides, <span>Save Money</span>
            <br />Travel Together
          </h1>
          <p className="hero-subtitle">
            CampusRide connects college students who need a ride with fellow students heading the same way.
            No more overpriced auto-rickshaws — travel smarter, together.
          </p>
          <div className="hero-actions">
            {!user ? (
              <>
                <Link to="/register" className="btn btn-primary hero-btn">
                  Get Started <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary hero-btn">
                  Login
                </Link>
              </>
            ) : user.role === 'rider' ? (
              <Link to="/rider" className="btn btn-primary hero-btn">
                Go to Rider Dashboard <ArrowRight size={18} />
              </Link>
            ) : user.role === 'admin' ? (
              <Link to="/admin" className="btn btn-primary hero-btn">
                Admin Panel <ArrowRight size={18} />
              </Link>
            ) : (
              <Link to="/browse" className="btn btn-primary hero-btn">
                Browse Available Rides <ArrowRight size={18} />
              </Link>
            )}
          </div>
        </div>
        <div className="hero-illustration">
          <div className="hero-bike-icon"><Bike size={120} /></div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container stats-grid">
          <div className="stat-card">
            <span className="stat-num">₹0</span>
            <span className="stat-label">Platform Fee</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">50%</span>
            <span className="stat-label">Cheaper than autos</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">Safe</span>
            <span className="stat-label">Verified students only</span>
          </div>
          <div className="stat-card">
            <span className="stat-num">24/7</span>
            <span className="stat-label">Available anytime</span>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section container">
        <h2 className="section-center-title">How It Works</h2>
        <div className="how-grid">
          <div className="how-card">
            <div className="how-icon rider-icon"><Bike size={28} /></div>
            <h3>For Riders</h3>
            <ul>
              {['Register as a Rider', 'Post your ride with route & time', 'Set seats available & optional fare', 'Confirm or reject booking requests', 'Travel together, earn trust'].map(s => (
                <li key={s}><CheckCircle size={14} />{s}</li>
              ))}
            </ul>
            {!user && (
              <Link to="/register" className="btn btn-success btn-sm how-btn">
                Join as Rider
              </Link>
            )}
          </div>

          <div className="how-card">
            <div className="how-icon passenger-icon"><Users size={28} /></div>
            <h3>For Passengers</h3>
            <ul>
              {['Register as a Passenger', 'Browse available rides near you', 'Check rider profile & ratings', 'Book a seat instantly', 'Get to campus affordably'].map(s => (
                <li key={s}><CheckCircle size={14} />{s}</li>
              ))}
            </ul>
            {!user && (
              <Link to="/register" className="btn btn-primary btn-sm how-btn">
                Join as Passenger
              </Link>
            )}
          </div>

          <div className="how-card">
            <div className="how-icon admin-icon"><Shield size={28} /></div>
            <h3>Admin Oversight</h3>
            <ul>
              {['Monitor all rides & bookings', 'View user activity', 'Ban inappropriate users', 'Maintain platform safety', 'Platform-wide statistics'].map(s => (
                <li key={s}><CheckCircle size={14} />{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-center-title">Why CampusRide?</h2>
          <div className="features-grid">
            {[
              { icon: '💰', title: 'Affordable', desc: 'Split fuel costs or ride free. Much cheaper than auto-rickshaws.' },
              { icon: '🎓', title: 'Students Only', desc: 'Exclusively for college students. Same campus, same community.' },
              { icon: '⭐', title: 'Ratings & Trust', desc: 'Rate riders and passengers after every ride for a safe community.' },
              { icon: '🔒', title: 'Safe & Secure', desc: 'Admin moderation ensures fair usage and safety for everyone.' },
              { icon: '📱', title: 'Easy to Use', desc: 'Post or find a ride in under a minute from any device.' },
              { icon: '🌿', title: 'Eco Friendly', desc: 'Fewer vehicles on road means less pollution around campus.' },
            ].map(f => (
              <div key={f.title} className="feature-card">
                <span className="feature-emoji">{f.icon}</span>
                <h4>{f.title}</h4>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      {!user && (
        <section className="cta-section">
          <div className="container cta-inner">
            <h2>Ready to ditch expensive autos?</h2>
            <p>Join hundreds of college students already saving money with CampusRide.</p>
            <Link to="/register" className="btn btn-primary hero-btn">
              Create Free Account <ArrowRight size={18} />
            </Link>
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="container">
          <div className="footer-brand"><Bike size={18} /> CampusRide</div>
          <p>© 2024 CampusRide. Made for students, by students.</p>
        </div>
      </footer>
    </div>
  );
}
