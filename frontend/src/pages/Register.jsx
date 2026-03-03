import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { Bike, User, Mail, Lock, Phone, School, Bike as BikeIcon, Users } from 'lucide-react';
import './Auth.css';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', college: '', role: 'passenger',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password, phone, college } = form;
    if (!name || !email || !password || !phone || !college) return toast.error('Please fill all fields');
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data);
      toast.success(`Account created! Welcome, ${data.name.split(' ')[0]}!`);
      if (data.role === 'rider') navigate('/rider');
      else navigate('/browse');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card auth-card-wide">
        <div className="auth-header">
          <div className="auth-logo"><Bike size={28} /></div>
          <h2>Create Account</h2>
          <p>Join CampusRide and start saving on travel</p>
        </div>

        {/* Role selector */}
        <div className="role-selector">
          <button
            type="button"
            className={`role-btn ${form.role === 'passenger' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'passenger' })}
          >
            <Users size={20} />
            <span>Passenger</span>
            <small>I need rides</small>
          </button>
          <button
            type="button"
            className={`role-btn ${form.role === 'rider' ? 'active' : ''}`}
            onClick={() => setForm({ ...form, role: 'rider' })}
          >
            <BikeIcon size={20} />
            <span>Rider</span>
            <small>I offer rides</small>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label><User size={14} /> Full Name</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" />
            </div>
            <div className="form-group">
              <label><Phone size={14} /> Phone Number</label>
              <input name="phone" value={form.phone} onChange={handleChange} placeholder="+91 98765 43210" />
            </div>
          </div>
          <div className="form-group">
            <label><Mail size={14} /> Email Address</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="you@college.edu" />
          </div>
          <div className="form-group">
            <label><School size={14} /> College / University</label>
            <input name="college" value={form.college} onChange={handleChange} placeholder="e.g. IIT Delhi, VIT Vellore" />
          </div>
          <div className="form-group">
            <label><Lock size={14} /> Password</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="At least 6 characters" />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : null}
            {loading ? 'Creating account...' : `Register as ${form.role === 'rider' ? 'Rider' : 'Passenger'}`}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
