// API Service Layer
// This file provides a centralized location for all API calls

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Generic API request handler
const apiRequest = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('API Request Failed:', error);
        throw error;
    }
};

// Example API methods (to be implemented when backend integration is needed)
export const api = {
    // Auth
    login: async (driverName, password) => {
        try {
            const response = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    driver_name: driverName,
                    password: password,
                }),
            });
            return response;
        } catch (error) {
            // Re-throw with more context
            throw new Error(error.message || 'Login failed');
        }
    },

    // Registration
    register: async (driverData) => {
        try {
            const response = await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(driverData),
            });
            return response;
        } catch (error) {
            throw new Error(error.message || 'Registration failed');
        }
    },

    // Guest Login
    guestLogin: async () => {
        try {
            const response = await apiRequest('/auth/guest', {
                method: 'POST',
            });
            return response;
        } catch (error) {
            throw new Error(error.message || 'Guest login failed');
        }
    },

    // Face Login
    startFaceScan: async () => {
        try {
            const response = await apiRequest('/auth/face/start', {
                method: 'POST',
            });
            return response;
        } catch (error) {
            throw new Error(error.message || 'Failed to start face scan');
        }
    },

    getFaceScanStatus: async (sessionId) => {
        try {
            const response = await apiRequest(`/auth/face/status/${sessionId}`, {
                method: 'GET',
            });
            return response;
        } catch (error) {
            throw new Error(error.message || 'Failed to get face scan status');
        }
    },

    // Face Registration
    startFaceRegistration: async (driverId) => {
        try {
            const response = await apiRequest('/face/register', {
                method: 'POST',
                body: JSON.stringify({ driver_id: driverId }),
            });
            return response;
        } catch (error) {
            throw new Error(error.message || 'Failed to start face registration');
        }
    },

    getFaceRegistrationStatus: async (sessionId) => {
        try {
            const response = await apiRequest(`/face/register/status/${sessionId}`, {
                method: 'GET',
            });
            return response;
        } catch (error) {
            throw new Error(error.message || 'Failed to get face registration status');
        }
    },

    checkFaceRegistration: async (driverId) => {
        try {
            const response = await apiRequest(`/face/check-registration/${driverId}`, {
                method: 'GET',
            });
            return response;
        } catch (error) {
            throw new Error(error.message || 'Failed to check face registration');
        }
    },

    // Dashboard
    getDashboardData: () => apiRequest('/dashboard'),

    // Alerts
    getAlerts: () => apiRequest('/alerts'),

    // Driver Profile
    getDriverProfile: (driverId) => apiRequest(`/driver/${driverId}`),

    // Settings
    getSettings: () => apiRequest('/settings'),
    updateSettings: (settings) => apiRequest('/settings', {
        method: 'PUT',
        body: JSON.stringify(settings),
    }),
};

export default api;
