import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import { MapPin, Calendar, Clock, Bike, DollarSign, Star, ChevronRight, XCircle, CheckCircle } from 'lucide-react';
import './PassengerDashboard.css';

function BookingCard({ booking, onCancel, onRate }) {
  const [ratingMode, setRatingMode] = useState(false);
  const [rating, setRating] = useState(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const ride = booking.ride;
  const rider = ride?.rider;

  const handleCancel = async () => {
    if (!window.confirm('Cancel this booking?')) return;
    setCancelling(true);
    try {
      await api.put(`/bookings/${booking._id}/status`, { status: 'cancelled' });
      toast.success('Booking cancelled');
      onCancel(booking._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setCancelling(false);
    }
  };

  const submitRating = async () => {
    if (!rating) return toast.error('Please select a rating');
    setRatingLoading(true);
    try {
      await api.post(`/bookings/${booking._id}/rate`, { ratingFor: 'rider', rating });
      toast.success('Rating submitted!');
      setRatingMode(false);
      onRate(booking._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setRatingLoading(false);
    }
  };

  return (
    <div className={`passenger-booking-card card ${booking.status}`}>
      <div className="pbc-header">
        <div className="pbc-route">
          <MapPin size={14} className="pin-from" />
          <span>{ride?.from}</span>
          <ChevronRight size={13} />
          <MapPin size={14} className="pin-to" />
          <span>{ride?.to}</span>
        </div>
        <span className={`badge ${booking.status}`}>{booking.status}</span>
      </div>

      <div className="pbc-meta">
        <span><Calendar size={13} />{ride?.date ? new Date(ride.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</span>
        <span><Clock size={13} />{ride?.time}</span>
        <span><Bike size={13} />{ride?.vehicleType} · {ride?.vehicleNumber}</span>
        <span>Seats: {booking.seats}</span>
        {booking.fare > 0 && <span><DollarSign size={13} />₹{booking.fare} total</span>}
      </div>

      {/* Rider info */}
      {rider && (
        <div className="pbc-rider">
          <div className="rider-avatar-sm">{rider.name?.[0]}</div>
          <div>
            <strong>{rider.name}</strong>
            <span>{rider.phone}</span>
          </div>
          {rider.totalRatings > 0 && (
            <span className="rider-rating-sm">
              <Star size={12} fill="#f59e0b" color="#f59e0b" />
              {rider.rating?.toFixed(1)}
            </span>
          )}
        </div>
      )}

      {booking.message && (
        <p className="pbc-message">Your message: "{booking.message}"</p>
      )}

      <div className="pbc-actions">
        {(booking.status === 'pending' || booking.status === 'confirmed') && (
          <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling}>
            <XCircle size={14} /> Cancel
          </button>
        )}
        {booking.status === 'completed' && !booking.riderRating && !ratingMode && (
          <button className="btn btn-secondary btn-sm" onClick={() => setRatingMode(true)}>
            <Star size={14} /> Rate Rider
          </button>
        )}
        {booking.riderRating && (
          <span className="rated-badge">
            <CheckCircle size={14} /> Rated {booking.riderRating}/5
          </span>
        )}
      </div>

      {ratingMode && (
        <div className="rating-panel">
          <p>How was your ride with <strong>{rider?.name}</strong>?</p>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                className={`star-btn ${rating >= n ? 'filled' : ''}`}
                onClick={() => setRating(n)}
                type="button"
              >
                <Star size={24} fill={rating >= n ? '#f59e0b' : 'none'} color={rating >= n ? '#f59e0b' : '#cbd5e1'} />
              </button>
            ))}
          </div>
          <div className="rating-actions">
            <button className="btn btn-primary btn-sm" onClick={submitRating} disabled={ratingLoading}>
              {ratingLoading ? <span className="spinner" /> : null} Submit
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setRatingMode(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PassengerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = (id) => {
    setBookings(prev => prev.map(b => b._id === id ? { ...b, status: 'cancelled' } : b));
  };

  const handleRate = (id) => {
    fetchBookings();
  };

  const filtered = filter === 'all' ? bookings : bookings.filter(b => b.status === filter);

  const stats = {
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    completed: bookings.filter(b => b.status === 'completed').length,
  };

  return (
    <div className="page-wrapper passenger-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="section-title">My Bookings</h1>
            <p className="page-subtitle">Welcome, {user?.name}! Track your ride bookings here.</p>
          </div>
        </div>

        {/* Stats */}
        <div className="passenger-stats">
          <div className="pstat-card">
            <span className="pstat-num">{stats.pending}</span>
            <span className="pstat-label">Pending</span>
          </div>
          <div className="pstat-card confirmed-stat">
            <span className="pstat-num">{stats.confirmed}</span>
            <span className="pstat-label">Confirmed</span>
          </div>
          <div className="pstat-card completed-stat">
            <span className="pstat-num">{stats.completed}</span>
            <span className="pstat-label">Completed</span>
          </div>
          <div className="pstat-card">
            <span className="pstat-num">{bookings.length}</span>
            <span className="pstat-label">Total Bookings</span>
          </div>
        </div>

        {/* Filters */}
        <div className="filter-tabs">
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">Loading your bookings...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Bike size={48} />
            <h3>No bookings {filter !== 'all' ? `with status "${filter}"` : 'yet'}</h3>
            <p>Browse available rides and book your first one!</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {filtered.map(booking => (
              <BookingCard
                key={booking._id}
                booking={booking}
                onCancel={handleCancel}
                onRate={handleRate}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
