import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';

// Authentication Pages
import AuthHome from './pages/auth/AuthHome';
import FaceLogin from './pages/auth/FaceLogin';
import PasswordLogin from './pages/auth/PasswordLogin';
import RegisterDriver from './pages/auth/RegisterDriver';
import GuestAccess from './pages/auth/GuestAccess';

// Protected Pages
import Dashboard from './pages/Dashboard';
import Alerts from './pages/Alerts';
import DriverProfile from './pages/DriverProfile';
import Settings from './pages/Settings';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Authentication Routes */}
          <Route path="/" element={<AuthHome />} />
          <Route path="/auth/face" element={<FaceLogin />} />
          <Route path="/auth/password" element={<PasswordLogin />} />
          <Route path="/auth/register" element={<RegisterDriver />} />
          <Route path="/auth/guest" element={<GuestAccess />} />

          {/* Protected Routes with Layout */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/driver-profile" element={<DriverProfile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          {/* Redirect unknown routes to auth home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
