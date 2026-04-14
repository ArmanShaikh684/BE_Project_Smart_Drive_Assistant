// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { systemAPI } from '../services/api';

// 1. Create the Context
const AuthContext = createContext(null);

// 2. Create the Provider Component
export const AuthProvider = ({ children }) => {
    // This state holds the profile of the person currently driving.
    // If it's null, nobody is logged in.
    const [driver, setDriver] = useState(null);

    // Call this function when a login is successful (Face, PIN, or Guest)
    const login = (driverProfile) => {
        console.log("User logged in:", driverProfile);
        setDriver(driverProfile);
    };

    // Call this function to end the trip
    const logout = async () => {
        try {
            // Tell the Port 5002 backend to stop the AI camera and background threads
            await systemAPI.stopSystem();
        } catch (error) {
            console.error("Error stopping the system during logout:", error);
        } finally {
            // Wipe the user from React's memory
            setDriver(null);
        }
    };

    // 3. Wrap the app and provide the state/functions
    return (
        <AuthContext.Provider value={{ driver, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// 4. Create a custom hook for easy access
// Now any component can just call: const { driver, login, logout } = useAuth();
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};