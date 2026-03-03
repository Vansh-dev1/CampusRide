import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import {
  PlusCircle, Bike, MapPin, Calendar, Clock, Users, DollarSign,
  ChevronDown, ChevronUp, CheckCircle, XCircle, Star, Trash2,
} from 'lucide-react';
import './RiderDashboard.css';

const VEHICLE_TYPES = ['bike', 'scooty', 'car', 'auto'];

function RideForm({ onCreated, onCancel }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    from: '', to: '', date: '', time: '', seatsAvailable: 1,
    fare: 0, vehicleType: 'bike', vehicleNumber: '', description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'seatsAvailable' || name === 'fare' ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.from || !form.to || !form.date || !form.time || !form.vehicleNumber)
      return toast.error('Please fill all required fields');
    setLoading(true);
    try {
      const { data } = await api.post('/rides', form);
      toast.success('Ride posted successfully!');
      onCreated(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post ride');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ride-form card">
      <h3 className="form-title"><PlusCircle size={18} /> Post a New Ride</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-row-2">
          <div className="form-group">
            <label>From *</label>
            <input name="from" value={form.from} onChange={handleChange} placeholder="Pickup location" />
          </div>
          <div className="form-group">
            <label>To *</label>
            <input name="to" value={form.to} onChange={handleChange} placeholder="Drop location" />
          </div>
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label>Date *</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
          </div>
          <div className="form-group">
            <label>Time *</label>
            <input type="time" name="time" value={form.time} onChange={handleChange} />
          </div>
          <div className="form-group">
            <label>Seats Available</label>
            <input type="number" name="seatsAvailable" value={form.seatsAvailable} onChange={handleChange} min={1} max={8} />
          </div>
        </div>
        <div className="form-row-3">
          <div className="form-group">
            <label>Vehicle Type *</label>
            <select name="vehicleType" value={form.vehicleType} onChange={handleChange}>
              {VEHICLE_TYPES.map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Vehicle Number *</label>
            <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="DL 01 AB 1234" />
          </div>
          <div className="form-group">
            <label>Fare per seat (₹)</label>
            <input type="number" name="fare" value={form.fare} onChange={handleChange} min={0} placeholder="0 = Free" />
          </div>
        </div>
        <div className="form-group">
          <label>Description (optional)</label>
          <textarea name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Any notes for passengers..." />
        </div>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? <span className="spinner" /> : <PlusCircle size={16} />}
            {loading ? 'Posting...' : 'Post Ride'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

function BookingItem({ booking, onStatusChange }) {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status) => {
    setLoading(true);
    try {
      await api.put(`/bookings/${booking._id}/status`, { status });
      toast.success(`Booking ${status}`);
      onStatusChange(booking._id, status);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-item">
      <div className="booking-passenger">
        <div className="passenger-avatar">{booking.passenger?.name?.[0]}</div>
        <div>
          <strong>{booking.passenger?.name}</strong>
          <span>{booking.passenger?.phone}</span>
          <span>{booking.passenger?.college}</span>
        </div>
      </div>
      <div className="booking-meta">
        <span>{booking.seats} seat{booking.seats > 1 ? 's' : ''}</span>
        {booking.fare > 0 && <span>₹{booking.fare}</span>}
        {booking.message && <span className="booking-msg">"{booking.message}"</span>}
        <span className={`badge ${booking.status}`}>{booking.status}</span>
        {booking.passenger?.rating > 0 && (
          <span className="rating-small"><Star size={12} /> {booking.passenger.rating.toFixed(1)}</span>
        )}
      </div>
      {booking.status === 'pending' && (
        <div className="booking-actions">
          <button className="btn btn-success btn-sm" onClick={() => updateStatus('confirmed')} disabled={loading}>
            <CheckCircle size={14} /> Confirm
          </button>
          <button className="btn btn-danger btn-sm" onClick={() => updateStatus('rejected')} disabled={loading}>
            <XCircle size={14} /> Reject
          </button>
        </div>
      )}
      {booking.status === 'confirmed' && (
        <button className="btn btn-primary btn-sm" onClick={() => updateStatus('completed')} disabled={loading}>
          Mark Complete
        </button>
      )}
    </div>
  );
}

function RideCard({ ride, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = async () => {
    if (expanded) { setExpanded(false); return; }
    setExpanded(true);
    setLoadingBookings(true);
    try {
      const { data } = await api.get(`/bookings/ride/${ride._id}`);
      setBookings(data);
    } catch {
      toast.error('Failed to load bookings');
    } finally {
      setLoadingBookings(false);
    }
  };

  const handleBookingStatusChange = (bookingId, newStatus) => {
    setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: newStatus } : b));
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this ride? All bookings will be cancelled.')) return;
    setCancelling(true);
    try {
      await api.delete(`/rides/${ride._id}`);
      toast.success('Ride cancelled');
      onCancel(ride._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className={`ride-card card ${ride.status}`}>
      <div className="ride-card-header">
        <div className="ride-route">
          <MapPin size={15} className="pin-from" />
          <span className="route-text">{ride.from}</span>
          <span className="route-arrow">→</span>
          <MapPin size={15} className="pin-to" />
          <span className="route-text">{ride.to}</span>
        </div>
        <span className={`badge ${ride.status}`}>{ride.status}</span>
      </div>

      <div className="ride-card-meta">
        <span><Calendar size={14} />{new Date(ride.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
        <span><Clock size={14} />{ride.time}</span>
        <span><Users size={14} />{ride.seatsAvailable}/{ride.seatsTotal} seats left</span>
        <span><Bike size={14} />{ride.vehicleType} · {ride.vehicleNumber}</span>
        {ride.fare > 0 && <span><DollarSign size={14} />₹{ride.fare}/seat</span>}
      </div>

      {ride.description && <p className="ride-desc">{ride.description}</p>}

      <div className="ride-card-footer">
        {ride.status === 'active' && (
          <>
            <button className="btn btn-secondary btn-sm" onClick={loadBookings}>
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Booking Requests
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleCancel} disabled={cancelling}>
              <Trash2 size={14} /> Cancel Ride
            </button>
          </>
        )}
      </div>

      {expanded && (
        <div className="bookings-list">
          {loadingBookings ? (
            <div className="loading-state">Loading bookings...</div>
          ) : bookings.length === 0 ? (
            <div className="empty-bookings">No booking requests yet</div>
          ) : (
            bookings.map(b => (
              <BookingItem key={b._id} booking={b} onStatusChange={handleBookingStatusChange} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default function RiderDashboard() {
  const { user } = useAuth();
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async () => {
    try {
      const { data } = await api.get('/rides/my');
      setRides(data);
    } catch {
      toast.error('Failed to load your rides');
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (newRide) => {
    setRides([newRide, ...rides]);
    setShowForm(false);
  };

  const handleCancel = (rideId) => {
    setRides(prev => prev.map(r => r._id === rideId ? { ...r, status: 'cancelled' } : r));
  };

  const filtered = filter === 'all' ? rides : rides.filter(r => r.status === filter);

  const stats = {
    active: rides.filter(r => r.status === 'active').length,
    completed: rides.filter(r => r.status === 'completed').length,
    cancelled: rides.filter(r => r.status === 'cancelled').length,
  };

  return (
    <div className="page-wrapper rider-page">
      <div className="container">
        <div className="page-header">
          <div>
            <h1 className="section-title">Rider Dashboard</h1>
            <p className="page-subtitle">Welcome, {user?.name}! Manage your rides below.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <PlusCircle size={18} />
            {showForm ? 'Cancel' : 'Post New Ride'}
          </button>
        </div>

        {/* Stats */}
        <div className="rider-stats">
          <div className="rstat-card active-stat">
            <span className="rstat-num">{stats.active}</span>
            <span className="rstat-label">Active Rides</span>
          </div>
          <div className="rstat-card">
            <span className="rstat-num">{stats.completed}</span>
            <span className="rstat-label">Completed</span>
          </div>
          <div className="rstat-card">
            <span className="rstat-num">{stats.cancelled}</span>
            <span className="rstat-label">Cancelled</span>
          </div>
          <div className="rstat-card">
            <Star size={20} className="star-icon" />
            <span className="rstat-num">{user?.rating > 0 ? user.rating.toFixed(1) : '—'}</span>
            <span className="rstat-label">Your Rating</span>
          </div>
        </div>

        {showForm && (
          <RideForm onCreated={handleCreated} onCancel={() => setShowForm(false)} />
        )}

        {/* Filter tabs */}
        <div className="filter-tabs">
          {['all', 'active', 'completed', 'cancelled'].map(f => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f !== 'all' && <span className="tab-count">{rides.filter(r => r.status === f).length}</span>}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">Loading your rides...</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Bike size={48} />
            <h3>No rides found</h3>
            <p>Post your first ride to get started!</p>
            <button className="btn btn-primary" onClick={() => setShowForm(true)}>
              <PlusCircle size={16} /> Post a Ride
            </button>
          </div>
        ) : (
          <div className="rides-list">
            {filtered.map(ride => (
              <RideCard key={ride._id} ride={ride} onCancel={handleCancel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
