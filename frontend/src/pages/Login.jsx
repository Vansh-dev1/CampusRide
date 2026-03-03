import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../api/axios.js';
import toast from 'react-hot-toast';
import { Bike, Mail, Lock, LogIn } from 'lucide-react';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please fill all fields');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data);
      toast.success(`Welcome back, ${data.name.split(' ')[0]}!`);
      if (data.role === 'admin') navigate('/admin');
      else if (data.role === 'rider') navigate('/rider');
      else navigate('/browse');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo"><Bike size={28} /></div>
          <h2>Welcome Back</h2>
          <p>Sign in to your CampusRide account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label><Mail size={14} /> Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@college.edu"
              autoFocus
            />
          </div>
          <div className="form-group">
            <label><Lock size={14} /> Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={loading}>
            {loading ? <span className="spinner" /> : <LogIn size={17} />}
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>

        <div className="demo-creds">
          <strong>Demo:</strong> Register a new account or use admin@campusride.com / admin123
        </div>
      </div>
    </div>
  );
}
