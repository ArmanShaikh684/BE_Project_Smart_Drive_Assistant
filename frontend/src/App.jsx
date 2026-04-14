// src/App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import our Global State and Security Guard
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Import Auth Pages
import AuthHome from './pages/auth/AuthHome';
import FaceLogin from './pages/auth/FaceLogin';
import PasswordLogin from './pages/auth/PasswordLogin';
import GuestAccess from './pages/auth/GuestAccess';
import RegisterDriver from './pages/auth/RegisterDriver';
import OwnerSetup from './pages/auth/OwnerSetup'; // <--- NEW FEATURE
import Settings from './pages/Settings';

// Import Dashboard Pages (Protected)
import Dashboard from './pages/Dashboard';

function App() {
  const [isConfigured, setIsConfigured] = useState(null); // null = checking, true/false = known

  // The Gatekeeper: Check if the Car Owner is registered on app boot
  useEffect(() => {
    const checkSystemSetup = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/system/check-owner');
        const data = await response.json();
        setIsConfigured(data.is_configured);
      } catch (error) {
        console.error("Failed to check system status:", error);
        setIsConfigured(false); // If backend is unreachable, default to false to protect access
      }
    };
    checkSystemSetup();
  }, []);

  // Show a cool HUD loading screen while checking the backend
  if (isConfigured === null) {
    return (
        <div className="h-screen w-screen bg-black flex flex-col items-center justify-center text-cyan-500 font-mono tracking-[0.3em] uppercase">
          <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          Initializing Core...
        </div>
    );
  }

  return (
      <AuthProvider>
        <Router>
          <div className="h-screen w-screen bg-black text-white overflow-hidden font-sans select-none">
            <Routes>

              {/* ========================================== */}
              {/* CONDITIONAL ROUTING LOGIC                  */}
              {/* ========================================== */}

              {!isConfigured ? (
                  /* LOCKDOWN MODE: If no owner, they can ONLY access the Setup screen */
                  <>
                    <Route path="/setup" element={<OwnerSetup onComplete={() => setIsConfigured(true)} />} />
                    <Route path="*" element={<Navigate to="/setup" replace />} />
                  </>
              ) : (
                  /* NORMAL MODE: Owner exists, unlock the rest of the app! */
                  <>
                    {/* Public Routes */}
                    <Route path="/" element={<AuthHome />} />
                    <Route path="/login/face" element={<FaceLogin />} />
                    <Route path="/login/password" element={<PasswordLogin />} />
                    <Route path="/login/guest" element={<GuestAccess />} />
                    <Route path="/register" element={<RegisterDriver />} />

                    {/* Protected Routes */}
                      {/* Protected Routes */}
                      <Route element={<ProtectedRoute />}>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/settings" element={<Settings />} /> {/* <--- ADD THIS LINE */}
                      </Route>

                    {/* Redirect stray URLs back to home */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </>
              )}

            </Routes>
          </div>
        </Router>
      </AuthProvider>
  );
}

export default App;