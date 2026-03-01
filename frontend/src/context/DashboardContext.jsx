import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';

const DashboardContext = createContext(null);

const HEAD_POSE_URL = 'http://localhost:5000/api/head_pose';
const HEAD_POSE_INTERVAL = 1500; // ms

// ── Default simulated state ─────────────────────────────────────────
const DEFAULT_STATE = {
    headPose: 'forward',         // live from backend
    drowsy: false,               // simulated locally
    phoneDetected: false,        // simulated locally
    audioAlert: false,           // simulated locally
    ear: 0.31,                   // simulated locally
    blinkRate: 14,               // simulated locally
    alertLevel: 'SAFE',          // 'SAFE' | 'WARNING' | 'CRITICAL'
};

export const DashboardProvider = ({ children }) => {
    const [state, setState] = useState(DEFAULT_STATE);
    const [headPoseConnected, setHeadPoseConnected] = useState(false);
    const [sessionTime, setSessionTime] = useState(0);
    const intervalRef = useRef(null);
    const headPoseRef = useRef(null);

    // ── 1. Head pose polling (only real backend call) ──────────────
    const fetchHeadPose = useCallback(async () => {
        try {
            const res = await fetch(HEAD_POSE_URL, { signal: AbortSignal.timeout(1200) });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setHeadPoseConnected(true);
            setState(prev => ({
                ...prev,
                headPose: data.head_pose ?? prev.headPose,
            }));
        } catch {
            setHeadPoseConnected(false);
        }
    }, []);

    useEffect(() => {
        fetchHeadPose();
        headPoseRef.current = setInterval(fetchHeadPose, HEAD_POSE_INTERVAL);
        return () => clearInterval(headPoseRef.current);
    }, [fetchHeadPose]);

    // ── 2. Simulated detection metrics ────────────────────────────
    useEffect(() => {
        // Cycle through realistic patterns every few seconds
        const patterns = [
            { drowsy: false, phoneDetected: false, audioAlert: false, alertLevel: 'SAFE' },
            { drowsy: false, phoneDetected: false, audioAlert: false, alertLevel: 'SAFE' },
            { drowsy: false, phoneDetected: false, audioAlert: false, alertLevel: 'SAFE' },
            { drowsy: true, phoneDetected: false, audioAlert: false, alertLevel: 'WARNING' },
            { drowsy: false, phoneDetected: true, audioAlert: false, alertLevel: 'WARNING' },
            { drowsy: false, phoneDetected: false, audioAlert: false, alertLevel: 'SAFE' },
            { drowsy: true, phoneDetected: false, audioAlert: true, alertLevel: 'CRITICAL' },
            { drowsy: false, phoneDetected: false, audioAlert: false, alertLevel: 'SAFE' },
        ];
        let idx = 0;

        intervalRef.current = setInterval(() => {
            idx = (idx + 1) % patterns.length;
            const p = patterns[idx];
            setState(prev => ({
                ...prev,
                drowsy: p.drowsy,
                phoneDetected: p.phoneDetected,
                audioAlert: p.audioAlert,
                alertLevel: p.alertLevel,
                // Vary EAR & blink rate for realism
                ear: p.drowsy
                    ? +(0.18 + Math.random() * 0.06).toFixed(3)
                    : +(0.28 + Math.random() * 0.08).toFixed(3),
                blinkRate: p.drowsy
                    ? Math.floor(5 + Math.random() * 5)
                    : Math.floor(12 + Math.random() * 8),
            }));
        }, 5000);

        return () => clearInterval(intervalRef.current);
    }, []);

    // ── 3. Session clock ──────────────────────────────────────────
    useEffect(() => {
        const clock = setInterval(() => setSessionTime(t => t + 1), 1000);
        return () => clearInterval(clock);
    }, []);

    // ── Manual beep for test button ──────────────────────────────
    const playTestBeep = useCallback(() => {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            osc.type = 'sine';
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.6);
        } catch (e) {
            console.warn('Beep failed:', e);
        }
    }, []);

    const isAlert = state.drowsy || state.phoneDetected || state.audioAlert ||
        (state.headPose && state.headPose !== 'forward');

    return (
        <DashboardContext.Provider value={{
            ...state,
            headPoseConnected,
            sessionTime,
            isAlert,
            playTestBeep,
        }}>
            {children}
        </DashboardContext.Provider>
    );
};

export const useDashboard = () => {
    const ctx = useContext(DashboardContext);
    if (!ctx) throw new Error('useDashboard must be inside DashboardProvider');
    return ctx;
};

export default DashboardContext;
