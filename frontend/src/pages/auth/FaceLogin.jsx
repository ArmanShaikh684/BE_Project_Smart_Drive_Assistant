import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import NeonButton from "../../components/NeonButton";
import AnimatedTextLink from "../../components/AnimatedTextLink";
import BackgroundWrapper from "../../components/BackgroundWrapper";

const FaceLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // State to track the scanning process (starts in 'initializing' automatically)
    const [scanState, setScanState] = useState({
        status: 'initializing',
        message: 'Waking up camera...'
    });

    // Refs for intervals, strict mode protection, and camera cache-busting
    const pollIntervalRef = useRef(null);
    const scanStartedRef = useRef(false);

    // Lazy initialization for the cache-buster to satisfy React purity rules
    const [streamKey] = useState(() => Date.now());

    // 1. Define functions FIRST
    const pollScanStatus = (sessionId) => {
        pollIntervalRef.current = setInterval(async () => {
            try {
                const response = await authAPI.checkFaceStatus(sessionId);

                if (response.success) {
                    setScanState({ status: response.status, message: response.message });

                    if (response.status === 'success') {
                        clearInterval(pollIntervalRef.current);
                        setTimeout(() => {
                            login(response.driver);
                            navigate('/dashboard');
                        }, 1500);
                    } else if (response.status === 'failed' || response.status === 'error') {
                        clearInterval(pollIntervalRef.current);
                    }
                }
            } catch (error) {
                // Log the error so ESLint knows it is being used
                console.error("Polling error:", error);
                clearInterval(pollIntervalRef.current);
                setScanState({ status: 'error', message: 'Lost connection to scanner.' });
            }
        }, 1000);
    };

    const startScan = async () => {
        try {
            const response = await authAPI.startFaceScan();
            if (response.success) {
                pollScanStatus(response.session_id);
            } else {
                setScanState({ status: 'error', message: response.error || 'Failed to start scanner.' });
            }
        } catch (error) {
            // Log the error so ESLint knows it is being used
            console.error("Start scan error:", error);
            setScanState({ status: 'error', message: 'Cannot connect to the AI Server.' });
        }
    };

    // 2. Call useEffect AFTER functions are defined
    useEffect(() => {
        // Prevent React from double-firing the camera in Strict Mode
        if (!scanStartedRef.current) {
            scanStartedRef.current = true;

            // Push startScan out of the synchronous render cycle to prevent cascading renders
            setTimeout(() => {
                startScan();
            }, 0);
        }

        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // 3. Render the UI
    return (
        <BackgroundWrapper>

            {/* Top Left Cancel Button */}
            <AnimatedTextLink
                onClick={() => navigate('/')}
                className="fixed top-8 left-8 md:top-12 md:left-12 text-2xl md:text-3xl font-extrabold tracking-widest drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] z-50 transition-transform duration-300 hover:scale-110"
            >
                ← Cancel
            </AnimatedTextLink>

            {/* UPGRADED HEADER */}
            <div className="text-center mb-10 z-10 relative">
                <h1
                    className="text-4xl md:text-5xl font-black uppercase text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] mb-2"
                    style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                    Driver Identification
                </h1>
                <p
                    className={`text-xl md:text-2xl uppercase font-bold drop-shadow-md ${
                        scanState.status === 'success' ? 'text-green-400' :
                            (scanState.status === 'failed' || scanState.status === 'error') ? 'text-red-500' :
                                'text-gray-400'
                    }`}
                    style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.2em" }}
                >
                    {scanState.message}
                </p>
            </div>

            {/* Camera View Box */}
            {(scanState.status === 'initializing' || scanState.status === 'scanning' || scanState.status === 'success') && (
                <div className={`relative z-10 w-full max-w-[640px] aspect-video md:h-[480px] rounded-2xl overflow-hidden border-4 transition-all duration-500 bg-[#0d131a] ${
                    scanState.status === 'success' ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.4)]' : 'border-cyan-500 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
                }`}>
                    <img
                        src={`http://localhost:5000/video-feed?t=${streamKey}`}
                        alt="Face Scan Stream"
                        className="w-full h-full object-cover"
                    />
                    {scanState.status === 'scanning' && (
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent w-full h-[20%] animate-[scan_2s_ease-in-out_infinite]" />
                    )}
                </div>
            )}

            {/* Error / Fallback Options */}
            {(scanState.status === 'failed' || scanState.status === 'error') && (
                <div className="flex flex-col gap-6 w-full max-w-md mt-8 z-10 relative">
                    <NeonButton
                        onClick={() => {
                            scanStartedRef.current = false;
                            setScanState({ status: 'initializing', message: 'Waking up camera...' });
                            startScan();
                        }}
                        fullWidth
                    >
                         Try Scan Again
                    </NeonButton>

                    <NeonButton
                        onClick={() => navigate('/login/password')}
                        fullWidth
                    >
                         Use PIN
                    </NeonButton>

                    <NeonButton
                        onClick={() => navigate('/login/guest')}
                        fullWidth
                    >
                         Continue as Guest
                    </NeonButton>
                </div>
            )}

            {/* Inline CSS for the scanning animation */}
            <style>{`
                @keyframes scan {
                    0% { transform: translateY(-100%); }
                    100% { transform: translateY(500%); }
                }
            `}</style>

        </BackgroundWrapper>
    );
};

export default FaceLogin;