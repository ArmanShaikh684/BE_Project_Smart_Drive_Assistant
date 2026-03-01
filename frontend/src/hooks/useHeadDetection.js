import { useState, useEffect, useRef, useCallback } from 'react';

const HEAD_POSE_URL = 'http://localhost:5000/api/head_pose';
const POLL_INTERVAL = 1000; // ms — tighter than DashboardContext's 1500ms
const REQUEST_TIMEOUT = 900;  // ms

/**
 * useHeadDetection
 * Polls /api/head_pose every 1000ms.
 * Returns { headPose, connected } with automatic cleanup on unmount.
 *
 * Possible headPose values: 'forward' | 'left' | 'right' | 'down'
 * connected: true when the last request succeeded
 */
const useHeadDetection = () => {
    const [headPose, setHeadPose] = useState('forward');
    const [connected, setConnected] = useState(false);
    const timerRef = useRef(null);
    const mountedRef = useRef(true);

    const poll = useCallback(async () => {
        try {
            const res = await fetch(HEAD_POSE_URL, {
                signal: AbortSignal.timeout(REQUEST_TIMEOUT),
            });
            if (!mountedRef.current) return;
            if (res.ok) {
                const data = await res.json();
                setHeadPose(data.head_pose ?? 'forward');
                setConnected(true);
            } else {
                setConnected(false);
            }
        } catch {
            if (mountedRef.current) setConnected(false);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        poll();
        timerRef.current = setInterval(poll, POLL_INTERVAL);

        return () => {
            mountedRef.current = false;
            clearInterval(timerRef.current);
        };
    }, [poll]);

    return { headPose, connected };
};

export default useHeadDetection;
