import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Search, MapPin, Calendar, Clock, Users, Bike, DollarSign, Star,
  Phone, BookOpen, ChevronRight,
} from 'lucide-react';
import './BrowseRides.css';

function RideCard({ ride, onBook }) {
  const [showBooking, setShowBooking] = useState(false);
  const [seats, setSeats] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBook = async () => {
    setLoading(true);
    try {
      await api.post('/bookings', { rideId: ride._id, seats, message });
      toast.success('Booking request sent!');
      setShowBooking(false);
      onBook(ride._id);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="browse-ride-card card">
      <div className="brc-header">
        <div className="brc-route">
          <MapPin size={15} className="pin-from" />
          <span>{ride.from}</span>
          <ChevronRight size={14} className="arrow" />
          <MapPin size={15} className="pin-to" />
          <span>{ride.to}</span>
        </div>
        <span className="fare-pill">
          {ride.fare > 0 ? `₹${ride.fare}/seat` : 'FREE'}
        </span>
      </div>

      <div className="brc-meta">
        <span><Calendar size={13} />{new Date(ride.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
        <span><Clock size={13} />{ride.time}</span>
        <span><Users size={13} />{ride.seatsAvailable} seat{ride.seatsAvailable !== 1 ? 's' : ''} left</span>
        <span><Bike size={13} />{ride.vehicleType}</span>
      </div>

      {ride.description && (
        <p className="brc-desc">"{ride.description}"</p>
      )}

      <div className="brc-rider">
        <div className="rider-avatar">{ride.rider?.name?.[0]}</div>
        <div className="rider-info">
          <strong>{ride.rider?.name}</strong>
          <span>{ride.rider?.college}</span>
        </div>
        <div className="rider-rating">
          {ride.rider?.totalRatings > 0 ? (
            <>
              <Star size={14} fill="#f59e0b" color="#f59e0b" />
              <span>{ride.rider.rating.toFixed(1)}</span>
              <small>({ride.rider.totalRatings})</small>
            </>
          ) : (
            <span className="no-rating">New Rider</span>
          )}
        </div>
        <a href={`tel:${ride.rider?.phone}`} className="contact-btn">
          <Phone size={14} />
        </a>
      </div>

      {!showBooking ? (
        <button className="btn btn-primary brc-book-btn" onClick={() => setShowBooking(true)}>
          <BookOpen size={16} /> Request Booking
        </button>
      ) : (
        <div className="booking-form">
          <div className="booking-inputs">
            <div className="form-group">
              <label>Seats needed</label>
              <input
                type="number" min={1} max={ride.seatsAvailable}
                value={seats} onChange={e => setSeats(Number(e.target.value))}
              />
            </div>
            <div className="form-group">
              <label>Message (optional)</label>
              <input
                type="text" value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Say hi to the rider..."
              />
            </div>
          </div>
          {ride.fare > 0 && (
            <div className="fare-estimate">
              Total fare estimate: <strong>₹{ride.fare * seats}</strong>
            </div>
          )}
          <div className="booking-btns">
            <button className="btn btn-primary btn-sm" onClick={handleBook} disabled={loading}>
              {loading ? <span className="spinner" /> : null}
              {loading ? 'Sending...' : 'Send Request'}
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowBooking(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BrowseRides() {
  const [rides, setRides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ from: '', to: '', date: '' });
  const [booked, setBooked] = useState(new Set());

  useEffect(() => {
    fetchRides();
  }, []);

  const fetchRides = async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/rides', { params });
      setRides(data);
    } catch {
      toast.error('Failed to load rides');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = {};
    if (filters.from) params.from = filters.from;
    if (filters.to)   params.to   = filters.to;
    if (filters.date) params.date = filters.date;
    fetchRides(params);
  };

  const handleClear = () => {
    setFilters({ from: '', to: '', date: '' });
    fetchRides();
  };

  const handleBooked = (rideId) => {
    setBooked(prev => new Set([...prev, rideId]));
  };

  const availableRides = rides.filter(r => !booked.has(r._id));

  return (
    <div className="page-wrapper browse-page">
      <div className="container">
        <h1 className="section-title">Find a Ride</h1>

        {/* Search bar */}
        <form className="search-bar card" onSubmit={handleSearch}>
          <div className="search-fields">
            <div className="search-field">
              <MapPin size={16} className="search-icon" />
              <input
                placeholder="From..."
                value={filters.from}
                onChange={e => setFilters({ ...filters, from: e.target.value })}
              />
            </div>
            <div className="search-field">
              <MapPin size={16} className="search-icon red" />
              <input
                placeholder="To..."
                value={filters.to}
                onChange={e => setFilters({ ...filters, to: e.target.value })}
              />
            </div>
            <div className="search-field">
              <Calendar size={16} className="search-icon" />
              <input
                type="date"
                value={filters.date}
                onChange={e => setFilters({ ...filters, date: e.target.value })}
              />
            </div>
          </div>
          <div className="search-btns">
            <button type="submit" className="btn btn-primary">
              <Search size={16} /> Search
            </button>
            <button type="button" className="btn btn-secondary" onClick={handleClear}>
              Clear
            </button>
          </div>
        </form>

        {loading ? (
          <div className="loading-state">Searching for rides...</div>
        ) : availableRides.length === 0 ? (
          <div className="empty-state">
            <Bike size={48} />
            <h3>No rides found</h3>
            <p>Try different search filters or check back later.</p>
          </div>
        ) : (
          <>
            <p className="results-count">{availableRides.length} ride{availableRides.length !== 1 ? 's' : ''} available</p>
            <div className="browse-grid">
              {availableRides.map(ride => (
                <RideCard key={ride._id} ride={ride} onBook={handleBooked} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
