import React, { useState, useEffect } from 'react';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import {
  Users, Bike, BookOpen, BarChart2, Shield, Ban, Trash2,
  CheckCircle, XCircle, Star, ChevronDown, ChevronUp,
} from 'lucide-react';
import './AdminDashboard.css';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="admin-stat-card" style={{ borderTopColor: color }}>
      <div className="asc-icon" style={{ background: color + '20', color }}>{icon}</div>
      <div>
        <div className="asc-value">{value}</div>
        <div className="asc-label">{label}</div>
      </div>
    </div>
  );
}

function UsersTab({ users, onToggleBan }) {
  const [search, setSearch] = useState('');
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.college?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        className="admin-search"
        placeholder="Search by name, email or college..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>College</th>
              <th>Rating</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(user => (
              <tr key={user._id} className={user.isBanned ? 'banned-row' : ''}>
                <td><strong>{user.name}</strong></td>
                <td className="muted">{user.email}</td>
                <td><span className={`badge ${user.role}`}>{user.role}</span></td>
                <td className="muted">{user.college}</td>
                <td>
                  {user.totalRatings > 0 ? (
                    <span className="rating-cell">
                      <Star size={12} fill="#f59e0b" color="#f59e0b" /> {user.rating?.toFixed(1)}
                    </span>
                  ) : '—'}
                </td>
                <td>
                  {user.isBanned
                    ? <span className="badge cancelled">Banned</span>
                    : <span className="badge active">Active</span>}
                </td>
                <td>
                  {user.role !== 'admin' && (
                    <button
                      className={`btn btn-sm ${user.isBanned ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => onToggleBan(user._id, user.isBanned)}
                    >
                      {user.isBanned ? <><CheckCircle size={13} /> Unban</> : <><Ban size={13} /> Ban</>}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="table-empty">No users found</div>}
      </div>
    </div>
  );
}

function RidesTab({ rides, onDelete }) {
  const [search, setSearch] = useState('');
  const filtered = rides.filter(r =>
    r.from?.toLowerCase().includes(search.toLowerCase()) ||
    r.to?.toLowerCase().includes(search.toLowerCase()) ||
    r.rider?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        className="admin-search"
        placeholder="Search by route or rider name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Route</th>
              <th>Rider</th>
              <th>Date & Time</th>
              <th>Seats</th>
              <th>Fare</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(ride => (
              <tr key={ride._id}>
                <td><strong>{ride.from}</strong> → <strong>{ride.to}</strong></td>
                <td>
                  <div>{ride.rider?.name}</div>
                  <small className="muted">{ride.rider?.phone}</small>
                </td>
                <td className="muted">
                  {new Date(ride.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  {' '}{ride.time}
                </td>
                <td>{ride.seatsAvailable}/{ride.seatsTotal}</td>
                <td>{ride.fare > 0 ? `₹${ride.fare}` : 'Free'}</td>
                <td><span className={`badge ${ride.status}`}>{ride.status}</span></td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => onDelete(ride._id)}>
                    <Trash2 size={13} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="table-empty">No rides found</div>}
      </div>
    </div>
  );
}

function BookingsTab({ bookings }) {
  const [search, setSearch] = useState('');
  const filtered = bookings.filter(b =>
    b.passenger?.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.ride?.from?.toLowerCase().includes(search.toLowerCase()) ||
    b.ride?.to?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <input
        className="admin-search"
        placeholder="Search by passenger or route..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Passenger</th>
              <th>Route</th>
              <th>Rider</th>
              <th>Seats</th>
              <th>Fare</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(booking => (
              <tr key={booking._id}>
                <td>
                  <div>{booking.passenger?.name}</div>
                  <small className="muted">{booking.passenger?.phone}</small>
                </td>
                <td>{booking.ride?.from} → {booking.ride?.to}</td>
                <td className="muted">{booking.ride?.rider?.name}</td>
                <td>{booking.seats}</td>
                <td>{booking.fare > 0 ? `₹${booking.fare}` : 'Free'}</td>
                <td><span className={`badge ${booking.status}`}>{booking.status}</span></td>
                <td className="muted">{new Date(booking.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="table-empty">No bookings found</div>}
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [rides, setRides] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    try {
      const [statsRes, usersRes, ridesRes, bookingsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/admin/rides'),
        api.get('/admin/bookings'),
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setRides(ridesRes.data);
      setBookings(bookingsRes.data);
    } catch {
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBan = async (userId, isBanned) => {
    if (!window.confirm(`${isBanned ? 'Unban' : 'Ban'} this user?`)) return;
    try {
      await api.put(`/admin/users/${userId}/ban`);
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, isBanned: !u.isBanned } : u));
      toast.success(`User ${isBanned ? 'unbanned' : 'banned'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDeleteRide = async (rideId) => {
    if (!window.confirm('Delete this ride and all its bookings?')) return;
    try {
      await api.delete(`/admin/rides/${rideId}`);
      setRides(prev => prev.filter(r => r._id !== rideId));
      toast.success('Ride deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const TABS = [
    { id: 'overview', label: 'Overview', icon: <BarChart2 size={16} /> },
    { id: 'users',    label: 'Users',    icon: <Users size={16} /> },
    { id: 'rides',    label: 'Rides',    icon: <Bike size={16} /> },
    { id: 'bookings', label: 'Bookings', icon: <BookOpen size={16} /> },
  ];

  if (loading) return <div className="page-wrapper"><div className="loading-state">Loading admin data...</div></div>;

  return (
    <div className="page-wrapper admin-page">
      <div className="container">
        <div className="admin-header">
          <div className="admin-title">
            <Shield size={24} />
            <div>
              <h1 className="section-title" style={{ marginBottom: 0 }}>Admin Dashboard</h1>
              <p className="page-subtitle">Full platform visibility and control</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="admin-tabs">
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`admin-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon}{tab.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && stats && (
          <div>
            <div className="admin-stats-grid">
              <StatCard icon={<Users size={22} />}   label="Total Users"    value={stats.totalUsers}    color="#6366f1" />
              <StatCard icon={<Bike size={22} />}    label="Total Rides"    value={stats.totalRides}    color="#06b6d4" />
              <StatCard icon={<BookOpen size={22} />} label="Total Bookings" value={stats.totalBookings}  color="#f97316" />
              <StatCard icon={<CheckCircle size={22} />} label="Active Rides"  value={stats.activeRides}   color="#22c55e" />
              <StatCard icon={<Shield size={22} />}  label="Riders"         value={stats.riders}         color="#8b5cf6" />
              <StatCard icon={<Users size={22} />}   label="Passengers"     value={stats.passengers}     color="#ec4899" />
              <StatCard icon={<CheckCircle size={22} />} label="Completed Rides" value={stats.completedRides} color="#2563eb" />
              <StatCard icon={<XCircle size={22} />} label="Cancelled Rides" value={stats.cancelledRides} color="#ef4444" />
            </div>

            <div className="overview-cards">
              <div className="ov-card card">
                <h3><Users size={16} /> Recent Users</h3>
                <div className="ov-list">
                  {users.slice(0, 5).map(u => (
                    <div key={u._id} className="ov-item">
                      <div className="ov-avatar">{u.name[0]}</div>
                      <div>
                        <strong>{u.name}</strong>
                        <span>{u.email}</span>
                      </div>
                      <span className={`badge ${u.role}`}>{u.role}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="ov-card card">
                <h3><Bike size={16} /> Recent Rides</h3>
                <div className="ov-list">
                  {rides.slice(0, 5).map(r => (
                    <div key={r._id} className="ov-item">
                      <div className="ov-route">{r.from} → {r.to}</div>
                      <span className="muted">{r.rider?.name}</span>
                      <span className={`badge ${r.status}`}>{r.status}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <UsersTab users={users} onToggleBan={handleToggleBan} />
        )}

        {activeTab === 'rides' && (
          <RidesTab rides={rides} onDelete={handleDeleteRide} />
        )}

        {activeTab === 'bookings' && (
          <BookingsTab bookings={bookings} />
        )}
      </div>
    </div>
  );
}
