import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { systemAPI, VIDEO_STREAM_URL } from '../services/api';

import VoiceWaveform from '../components/VoiceWaveform';
import TacticalMap from '../components/TacticalMap';
import MusicPlayer from '../components/MusicPlayer';
import AttentionBar from '../components/AttentionBar';

const Dashboard = () => {
    const { driver, logout } = useAuth();
    const navigate = useNavigate();

    const [dashboardData, setDashboardData] = useState({
        status: 'INITIALIZING',
        trip_time: '00:00:00',
        weather: '--',
        traffic: '--',
        location: '--',
        is_speaking: false,
        is_music_playing: false
    });

    const [isSystemActive, setIsSystemActive] = useState(false);
    const [streamKey, setStreamKey] = useState(null);
    const [showMusicWidget, setShowMusicWidget] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const startTrip = async () => {
            try {
                await systemAPI.startSystem(driver);
                if (isMounted) {
                    setIsSystemActive(true);
                    setStreamKey(Date.now());
                }
            } catch (error) { console.error("Failed to start AI system:", error); }
        };
        if (driver) startTrip();

        return () => {
            isMounted = false;
            systemAPI.stopSystem();
        };
    }, [driver]);

    useEffect(() => {
        if (!isSystemActive) return;
        const intervalId = setInterval(async () => {
            try {
                const data = await systemAPI.getDashboardStatus();
                setDashboardData({
                    status: data.status || 'UNKNOWN',
                    trip_time: data.trip_time || '00:00:00',
                    weather: data.weather || '--',
                    location: data.location || '--',
                    is_speaking: data.is_speaking || false,
                    is_music_playing: data.is_music_playing || false,
                    emergency_status: data.emergency_status || 'NONE',       // <--- NEW
                    emergency_countdown: data.emergency_countdown !== null ? data.emergency_countdown : null ,// <--- NEW
                    traffic: data.traffic || '--',
                    whatsapp_sender: data.whatsapp_sender || null
                });

                if (data.is_music_playing && !showMusicWidget) {
                    setShowMusicWidget(true);
                }
            } catch (error) { console.error("Telemetry error:", error); }
        }, 500);
        return () => clearInterval(intervalId);
    }, [isSystemActive, showMusicWidget]);

    const handleEndTrip = async () => {
        await logout();
        navigate('/');
    };

    const handleToggleMusic = async () => {
        try { await fetch('http://127.0.0.1:5002/api/system/music/toggle', { method: 'POST' }); }
        catch (error) { console.error("Toggle error:", error); }
    };

    const handleNextMusic = async () => {
        try { await fetch('http://127.0.0.1:5002/api/system/music/next', { method: 'POST' }); }
        catch (error) { console.error("Next track error:", error); }
    };


    const handleCancelEmergency = async () => {
        try { await fetch('http://127.0.0.1:5002/api/system/emergency/cancel', { method: 'POST' }); }
        catch (error) { console.error("Cancel error:", error); }
    };


    return (
        <div className="fixed inset-0 w-screen h-screen text-white overflow-hidden flex flex-col p-4 md:p-6 z-50 box-border font-sansHUD">

            {/* ================= BACKGROUND VIDEO & BRIGHTER OVERLAY ================= */}
            <div className="absolute inset-0 -z-20 w-full h-full">
                <video
                    src="/driving_video.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-[#030712]/50 via-transparent to-[#030712]/50 backdrop-blur-[1px]"></div>
            </div>


            {/* ================= CRITICAL EMERGENCY OVERLAY ================= */}
            {(dashboardData.emergency_status === 'CONVERSATION' || dashboardData.emergency_status === 'COUNTDOWN') && (
                <div className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none">

                    {/* Pulsing Red Edges (Always on during the emergency conversation) */}
                    <div className="absolute inset-0 border-l-[30px] border-r-[30px] border-red-600/80 animate-pulse pointer-events-none shadow-[inset_0_0_150px_rgba(220,38,38,0.6)] transition-opacity duration-500"></div>

                    {/* The Circular Cancel Button (Only shows during the final 10 seconds) */}
                    {dashboardData.emergency_status === 'COUNTDOWN' && (
                        <button
                            onClick={handleCancelEmergency}
                            className="pointer-events-auto bg-red-950/90 backdrop-blur-xl border-4 border-red-500 rounded-full w-72 h-72 md:w-80 md:h-80 flex flex-col items-center justify-center shadow-[0_0_80px_rgba(220,38,38,0.8)] hover:bg-red-900 hover:scale-[1.02] active:scale-95 transition-all duration-300 group"
                        >
                            <span className="text-red-300 text-lg md:text-xl font-bold tracking-[0.2em] uppercase mb-2 animate-pulse">Cancel Alert</span>

                            <span className="text-white text-8xl md:text-[8rem] font-black font-monoH mb-4 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] leading-none">
                                {dashboardData.emergency_countdown}
                            </span>

                            <div className="bg-red-600 text-white font-black tracking-widest uppercase px-6 py-2 rounded-full text-sm md:text-base group-hover:bg-red-500 transition-colors text-center">
                                Tap or Say<br/>"Cancel"
                            </div>
                        </button>
                    )}
                </div>
            )}


            {/* Ambient Corner Glows (Subtle) */}
            <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] bg-cyan-600/20 rounded-full blur-[100px] pointer-events-none -z-10"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-red-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>


            {/* ================= DRIVER IDENTIFICATION BADGE ================= */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
                <div className="bg-black/60 backdrop-blur-md border border-cyan-500/30 px-6 py-2 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.2)] flex items-center gap-3">
                    <span className="text-cyan-400 animate-pulse text-xs">●</span>
                    <span className="text-gray-300 text-xs font-bold tracking-widest uppercase">Active Profile:</span>
                    <span className="text-white text-sm md:text-base font-bold tracking-wider">{driver?.name || "Unknown"}</span>
                </div>
            </div>


            {/* ================= CORNER HUD LAYOUT ================= */}
            <div className="flex-1 flex flex-row justify-between w-full h-full relative z-10 pointer-events-none">

                {/* --- LEFT COLUMN: Camera, Attention, Voice --- */}
                <div className="flex flex-col justify-between h-full w-48 md:w-56 pointer-events-auto">

                    {/* TOP LEFT: Shrunk Camera Frame */}
                    <div className="aspect-[4/3] w-full relative bg-black/40 backdrop-blur-md rounded-2xl border-2 border-cyan-500/30 overflow-hidden shadow-lg flex-shrink-0">
                        <div className="absolute top-2 left-2 z-20 bg-black/80 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 shadow-lg">
                            <span className={`text-[10px] md:text-xs font-bold tracking-widest uppercase font-monoH ${
                                dashboardData.status === 'FOCUSED' ? 'text-cyan-400' :
                                    dashboardData.status === 'DISTRACTED' || dashboardData.status === 'WARNING' ? 'text-yellow-400' :
                                        'text-red-500 animate-pulse'
                            }`}>
                                {dashboardData.status}
                            </span>
                        </div>

                        {isSystemActive && streamKey ? (
                            <img
                                src={`${VIDEO_STREAM_URL}?t=${streamKey}`}
                                className="w-full h-full object-cover opacity-90"
                                alt="Live Driver Feed"
                                crossOrigin="anonymous"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-cyan-500 text-xs font-mono animate-pulse bg-black/80 text-center px-2">
                                Booting...
                            </div>
                        )}
                    </div>

                    {/* MIDDLE LEFT: Attention Bar */}
                    <div className="flex-1 flex justify-start items-stretch py-4">
                        <AttentionBar status={dashboardData.status} />
                    </div>

                    {/* BOTTOM LEFT: AI Voice Waveform */}
                    <div className="h-16 md:h-20 w-full flex-shrink-0 bg-[#0d131a]/60 backdrop-blur-sm rounded-2xl border border-white/5 shadow-xl flex items-center justify-center p-2">
                        <VoiceWaveform isSpeaking={dashboardData.is_speaking} />
                    </div>

                </div>

                {/* --- RIGHT COLUMN: Telemetry & Terminate --- */}
                {/* UPGRADED: Increased width to accommodate larger map (w-72 md:w-80) */}
                <div className="flex flex-col justify-between items-end h-full w-72 md:w-80 pointer-events-auto">

                    {/* TOP RIGHT CLUSTER: Settings, Map, and Stats */}
                    <div className="flex flex-col gap-3 w-full">

                        {/* UPGRADED: Settings Button is now integrated into the layout flow */}
                        <div className="flex justify-end w-full">
                            <button
                                onClick={() => navigate('/settings')}
                                className="bg-black/60 backdrop-blur-md p-2.5 md:p-3 rounded-full border border-white/10 hover:bg-cyan-900/50 hover:border-cyan-500 transition-all shadow-lg text-lg md:text-xl"
                                title="Settings"
                            >
                                ⚙️
                            </button>
                        </div>

                        {/* UPGRADED: Larger Tactical Map (h-40 md:h-48) */}
                        <div className="h-40 md:h-48 w-full rounded-2xl overflow-hidden shadow-lg border border-white/10 shrink-0 bg-black/50">
                            <TacticalMap />
                        </div>

                        {/* UPGRADED: Slightly larger Stats Grid padding and text sizes */}
                        <div className="bg-[#0d131a]/60 backdrop-blur-md rounded-2xl border border-white/5 p-3 md:p-4 flex flex-col gap-2 md:gap-3 shadow-lg shrink-0">
                            <div>
                                <p className="text-gray-500 uppercase text-[10px] md:text-xs font-bold tracking-widest mb-0.5">Trip Time</p>
                                <p className="text-xl md:text-2xl font-bold text-white tracking-widest font-monoH leading-none">
                                    {dashboardData.trip_time}
                                </p>
                            </div>

                            <div className="bg-black/50 p-2 rounded-xl border border-white/5 flex items-center justify-between mt-1">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Weather</p>
                                <p className="text-cyan-400 text-xs md:text-sm font-bold tracking-wide truncate ml-2">{dashboardData.weather}</p>
                            </div>

                            <div className="bg-black/50 p-2 rounded-xl border border-white/5 flex items-center justify-between">
                                <p className="text-[10px] text-gray-500 uppercase font-bold">Traffic</p>
                                <p className={`text-xs md:text-sm font-bold tracking-wide truncate ml-2 ${
                                    dashboardData.traffic.includes('Heavy') ? 'text-red-400' :
                                        dashboardData.traffic.includes('Moderate') ? 'text-yellow-400' :
                                            'text-green-400'
                                }`}>
                                    {dashboardData.traffic}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM RIGHT CLUSTER: Music and Terminate */}
                    <div className="flex flex-col gap-3 w-full">

                        {/* WHATSAPP TOAST NOTIFICATION (NEW) */}
                        {dashboardData.whatsapp_sender && (
                            <div className="bg-green-900/40 backdrop-blur-md border border-green-500/50 p-3 rounded-2xl flex items-center gap-3 shadow-[0_0_20px_rgba(34,197,94,0.3)] animate-pulse w-full flex-shrink-0 transition-all duration-500">
                                <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center text-2xl shrink-0 shadow-lg">
                                    📩
                                </div>
                                <div className="overflow-hidden">
                                    <p className="text-[10px] md:text-xs text-green-400 font-bold uppercase tracking-widest mb-0.5">Incoming Secure Message</p>
                                    <p className="text-white text-sm md:text-base font-bold truncate">From: {dashboardData.whatsapp_sender}</p>
                                </div>
                            </div>
                        )}

                        {showMusicWidget && (
                            <div className="w-full flex-shrink-0">
                                <MusicPlayer
                                    isPlaying={dashboardData.is_music_playing}
                                    onToggle={handleToggleMusic}
                                    onNext={handleNextMusic}
                                />
                            </div>
                        )}

                        <button
                            onClick={handleEndTrip}
                            className="w-full flex-shrink-0 h-14 md:h-16 bg-red-900/40 backdrop-blur-md border-2 border-red-500/50 rounded-2xl text-red-500 font-black text-sm tracking-[0.2em] uppercase hover:bg-red-600 hover:text-white transition-all duration-300 hover:shadow-[0_0_20px_rgba(220,38,38,0.5)] font-monoH"
                        >
                            Terminate Trip
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default Dashboard;