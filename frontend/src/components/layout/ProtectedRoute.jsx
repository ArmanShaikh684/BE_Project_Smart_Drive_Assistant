// src/components/layout/ProtectedRoute.jsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = () => {
    const { driver } = useAuth();

    // If there is no driver in the global state, kick them back to the Auth Home screen.
    // Replace prop prevents them from using the back button to bypass this.
    if (!driver) {
        return <Navigate to="/" replace />;
    }

    // If they ARE logged in, render the child route (which will be the Dashboard)
    return <Outlet />;
};

export default ProtectedRoute;