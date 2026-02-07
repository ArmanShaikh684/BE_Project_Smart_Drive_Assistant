import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [faceRegistered, setFaceRegistered] = useState(false);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('smart_drive_user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
                setFaceRegistered(userData.face_registered || false);
            } catch (error) {
                console.error('Error loading user from localStorage:', error);
                localStorage.removeItem('smart_drive_user');
            }
        }
    }, []);

    const login = (driverProfile) => {
        const userData = {
            ...driverProfile,
            driver_id: driverProfile.name?.toLowerCase().replace(/ /g, '_') || 'unknown',
            face_registered: false // Will be checked separately
        };

        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('smart_drive_user', JSON.stringify(userData));
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        setFaceRegistered(false);
        localStorage.removeItem('smart_drive_user');
    };

    const updateFaceRegistration = (status) => {
        setFaceRegistered(status);
        if (user) {
            const updatedUser = { ...user, face_registered: status };
            setUser(updatedUser);
            localStorage.setItem('smart_drive_user', JSON.stringify(updatedUser));
        }
    };

    const value = {
        user,
        isAuthenticated,
        faceRegistered,
        login,
        logout,
        updateFaceRegistration
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
