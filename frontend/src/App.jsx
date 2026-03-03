import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RiderDashboard from './pages/RiderDashboard.jsx';
import PassengerDashboard from './pages/PassengerDashboard.jsx';
import BrowseRides from './pages/BrowseRides.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Navbar from './components/Navbar.jsx';

function PrivateRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/browse"
          element={
            <PrivateRoute roles={['passenger', 'admin']}>
              <BrowseRides />
            </PrivateRoute>
          }
        />
        <Route
          path="/rider"
          element={
            <PrivateRoute roles={['rider', 'admin']}>
              <RiderDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/passenger"
          element={
            <PrivateRoute roles={['passenger', 'admin']}>
              <PassengerDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <PrivateRoute roles={['admin']}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
