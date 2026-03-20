import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./components/layout/DashboardLayout";

import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import VerifyOTP from "./pages/VerifyOTP";
import Dashboard from "./pages/Dashboard";
import PostRide from "./pages/PostRide";
import FindRide from "./pages/FindRide";
import RideDetail from "./pages/RideDetail";
import MyRides from "./pages/MyRides";
import Chat from "./pages/Chat";
import Profile from "./pages/Profile";
import UserProfile from "./pages/UserProfile";

export default function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Routes>
          {/* Landing is always the first page — logged in or not */}
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Protected — requires login */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/post-ride" element={<PostRide />} />
            <Route path="/find-ride" element={<FindRide />} />
            <Route path="/rides/:id" element={<RideDetail />} />
            <Route path="/my-rides" element={<MyRides />} />
            <Route path="/chat/:rideId" element={<Chat />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users/:id" element={<UserProfile />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SocketProvider>
    </AuthProvider>
  );
}