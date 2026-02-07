import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        // Redirect to auth home if not authenticated
        return <Navigate to="/" replace />;
    }

    return children;
};

export default ProtectedRoute;
