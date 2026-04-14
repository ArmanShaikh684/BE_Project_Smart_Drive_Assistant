// src/services/api.js

// Backend URLs
// Port 5000: Handles Registration, Face Scanning, and Auth Fallbacks
const AUTH_URL = 'http://localhost:5000/api';

// Port 5002: Handles the active AI Dashboard loop and telemetry
const SYSTEM_URL = 'http://localhost:5002/api';

// ==========================================
// AUTHENTICATION API (Talks to api_server.py)
// ==========================================
export const authAPI = {
    // Starts the background face scanning session
    startFaceScan: async () => {
        const res = await fetch(`${AUTH_URL}/auth/face/start`, { method: 'POST' });
        return res.json();
    },
    // Polls the status of the ongoing face scan
    checkFaceStatus: async (sessionId) => {
        const res = await fetch(`${AUTH_URL}/auth/face/status/${sessionId}`);
        return res.json();
    },

    // Update Contacts for Private Drivers
    updateContacts: async (driver_id, trusted_contacts) => {
        const res = await fetch(`${AUTH_URL}/driver/update-contacts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driver_id, trusted_contacts }) // <--- Send ID
        });
        return res.json();
    },

    // Trigger Face Update
    updateFace: async (driver_id) => {
        const res = await fetch(`${AUTH_URL}/face/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driver_id })
        });
        return res.json();
    },

    // Manual Password Login
    passwordLogin: async (driver_name, password) => {
        const res = await fetch(`${AUTH_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driver_name, password })
        });
        return res.json();
    },
    // Guest Login
    guestLogin: async () => {
        const res = await fetch(`${AUTH_URL}/auth/guest`, { method: 'POST' });
        return res.json();
    },
    // Register New Driver Details
    registerDriver: async (driverData) => {
        const res = await fetch(`${AUTH_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(driverData)
        });
        return res.json();
    }
};

// ==========================================
// SYSTEM & DASHBOARD API (Talks to web_main.py)
// ==========================================
export const systemAPI = {
    // Triggers the headless AI loop to start monitoring
    startSystem: async (driverProfile) => {
        const res = await fetch(`${SYSTEM_URL}/system/start`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ driver: driverProfile })
        });
        return res.json();
    },
    // Stops the AI loop and trip monitoring
    stopSystem: async () => {
        const res = await fetch(`${SYSTEM_URL}/system/stop`, { method: 'POST' });
        return res.json();
    },
    // Polls the live telemetry data (EAR, Distraction, Weather, Traffic)
    getDashboardStatus: async () => {
        const res = await fetch(`${SYSTEM_URL}/dashboard/status`);
        return res.json();
    }
};

// Add this to your existing api.js exports
export const externalAPI = {
    getLiveLocation: async () => {
        try {
            const res = await fetch('https://api.bigdatacloud.net/data/reverse-geocode-client');
            const data = await res.json();
            return `${data.city}, ${data.principalSubdivisionCode}`;
        } catch {
            return "Pune, IN";
        }
    }
};
 // Helper for the MJPEG video stream URL so we don't hardcode it in components
export const VIDEO_STREAM_URL = 'http://localhost:5002/video-feed';