import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import useHeadDetection from '../../hooks/useHeadDetection';
import StatusBadge from './StatusBadge';

const VIDEO_FEED_URL = 'http://localhost:5000/video-feed';

const STREAM_CONNECTING = 'connecting';
const STREAM_LIVE = 'live';
const STREAM_OFFLINE = 'offline';

const VideoPanel = () => {
    const { alertLevel, playTestBeep } = useDashboard();

    // Head pose from dedicated polling hook (1000ms interval)
    const { headPose, connected: headConnected } = useHeadDetection();

    // Stream state
    const [streamState, setStreamState] = useState(STREAM_CONNECTING);
    const [frameCount, setFrameCount] = useState(0);
    const imgRef = useRef(null);
    const retryTimer = useRef(null);
    const fps = 30;

    // Frame HUD counter
    useEffect(() => {
        const id = setInterval(() => setFrameCount(c => (c + 1) % 9999), 1000 / fps);
        return () => clearInterval(id);
    }, []);

    // Auto-retry on stream error
    const handleStreamError = () => {
        setStreamState(STREAM_OFFLINE);
        retryTimer.current = setTimeout(() => {
            setStreamState(STREAM_CONNECTING);
            if (imgRef.current) {
                imgRef.current.src = `${VIDEO_FEED_URL}?t=${Date.now()}`;
            }
        }, 3000);
    };

    const handleStreamLoad = () => {
        setStreamState(STREAM_LIVE);
        clearTimeout(retryTimer.current);
    };

    useEffect(() => () => clearTimeout(retryTimer.current), []);

    // ── Dynamic border based on head pose ─────────────────────────────
    // Yellow glow when distracted, red when critical alert, cyan otherwise
    const distracted = headPose !== 'forward';

    const borderStyle = (() => {
        if (alertLevel === 'CRITICAL')
            return { border: '1px solid rgba(255,51,102,0.55)', boxShadow: '0 0 30px rgba(255,51,102,0.25)', animation: 'sdaAlertPulse 1.5s ease-in-out infinite' };
        if (distracted)
            return { border: '1px solid rgba(255,184,0,0.5)', boxShadow: '0 0 24px rgba(255,184,0,0.22)', animation: 'sdaWarnPulse 2s ease-in-out infinite' };
        if (alertLevel === 'WARNING')
            return { border: '1px solid rgba(255,184,0,0.35)', boxShadow: '0 0 16px rgba(255,184,0,0.15)', animation: 'sdaWarnPulse 2.5s ease-in-out infinite' };
        return { border: '1px solid rgba(0,212,255,0.18)', boxShadow: '0 0 20px rgba(0,212,255,0.08)', animation: 'sdaGlowPulse 3s ease-in-out infinite' };
    })();

    const headPoseColor = {
        forward: '#00ffb3',
        left: '#ffb800',
        right: '#ffb800',
        up: '#ffb800',
        down: '#ff3366',
    }[headPose] ?? '#64748b';

    // ── Placeholder overlay ────────────────────────────────────────────
    const renderPlaceholder = () => (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 sda-grid-bg"
            style={{ background: 'rgba(0,5,15,0.97)', zIndex: 2 }}>
            {streamState === STREAM_CONNECTING && (
                <>
                    <div style={{
                        width: 64, height: 64,
                        border: '2px solid rgba(0,212,255,0.12)',
                        borderTopColor: '#00d4ff',
                        borderRadius: '50%',
                        animation: 'rotateRing 1s linear infinite',
                    }} />
                    <div className="text-center space-y-1">
                        <p className="text-sm font-mono tracking-[0.2em] uppercase"
                            style={{ color: 'rgba(0,212,255,0.7)' }}>
                            Connecting to AI Camera…
                        </p>
                        <p className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.35)' }}>
                            waiting for backend stream
                        </p>
                    </div>
                </>
            )}
            {streamState === STREAM_OFFLINE && (
                <>
                    <div className="flex items-center justify-center rounded-full"
                        style={{ width: 64, height: 64, background: 'rgba(255,51,102,0.06)', border: '1px solid rgba(255,51,102,0.25)' }}>
                        <svg width="28" height="28" fill="none" stroke="rgba(255,51,102,0.7)" viewBox="0 0 24 24" strokeWidth={1.3}>
                            <path strokeLinecap="round" strokeLinejoin="round"
                                d="M15 10l4.553-2.069A1 1 0 0121 8.87v6.26a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
                            <line x1="3" y1="3" x2="21" y2="21" stroke="rgba(255,51,102,0.6)" strokeWidth={1.4} strokeLinecap="round" />
                        </svg>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-sm font-mono tracking-widest uppercase"
                            style={{ color: 'rgba(255,51,102,0.8)' }}>Camera Offline</p>
                        <p className="text-xs font-mono" style={{ color: 'rgba(148,163,184,0.5)' }}>
                            Backend stream unavailable · retrying…
                        </p>
                    </div>
                </>
            )}
        </div>
    );

    return (
        <div className="relative flex flex-col h-full rounded-xl overflow-hidden"
            style={{ background: 'rgba(0,5,15,0.95)', transition: 'border 0.4s ease, box-shadow 0.4s ease', ...borderStyle }}>

            {/* ── Top HUD bar ── */}
            <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 z-10"
                style={{ background: 'rgba(0,3,10,0.88)', borderBottom: '1px solid rgba(0,212,255,0.07)' }}>
                <div className="flex items-center gap-3">
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: streamState === STREAM_LIVE ? '#00ffb3' : streamState === STREAM_CONNECTING ? '#ffb800' : '#ff3366',
                        boxShadow: `0 0 8px ${streamState === STREAM_LIVE ? '#00ffb3' : streamState === STREAM_CONNECTING ? '#ffb800' : '#ff3366'}`,
                        animation: 'sdaPulse 2s ease-in-out infinite',
                    }} />
                    <span className="text-xs font-mono tracking-widest uppercase"
                        style={{ color: 'rgba(0,212,255,0.6)' }}>
                        Live Monitoring
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.4)' }}>
                        {fps} FPS · FRAME {String(frameCount).padStart(4, '0')}
                    </span>
                    <StatusBadge level={alertLevel} />
                </div>
            </div>

            {/* ── Video area ── */}
            <div className="relative flex-1 overflow-hidden" style={{ minHeight: 0 }}>

                {/* MJPEG stream */}
                <img
                    ref={imgRef}
                    src={`${VIDEO_FEED_URL}?t=${Date.now()}`}
                    alt="Live AI camera feed"
                    onLoad={handleStreamLoad}
                    onError={handleStreamError}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ display: streamState === STREAM_LIVE ? 'block' : 'none', zIndex: 1 }}
                />

                {/* Placeholder */}
                {streamState !== STREAM_LIVE && renderPlaceholder()}

                {/* HUD overlays — only on top of live stream */}

                {/* Vignette */}
                {streamState === STREAM_LIVE && (
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'radial-gradient(ellipse 90% 90% at 50% 50%, transparent 50%, rgba(0,5,15,0.5) 100%)',
                        zIndex: 3,
                    }} />
                )}

                {/* Scan line */}
                {streamState === STREAM_LIVE && (
                    <div className="absolute left-0 right-0 pointer-events-none" style={{
                        height: 2,
                        background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.35) 30%, rgba(0,212,255,0.65) 50%, rgba(0,212,255,0.35) 70%, transparent 100%)',
                        boxShadow: '0 0 8px rgba(0,212,255,0.3)',
                        animation: 'scanLine 3s linear infinite',
                        zIndex: 4,
                    }} />
                )}

                {/* Distraction warning overlay — subtle amber tint when distracted */}
                {distracted && streamState === STREAM_LIVE && (
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'radial-gradient(ellipse at center, rgba(255,184,0,0.06) 0%, transparent 70%)',
                        animation: 'sdaWarnPulse 2s ease-in-out infinite',
                        zIndex: 3,
                    }} />
                )}

                {/* Corner brackets */}
                {[
                    { top: 12, left: 12, tl: true, tr: false, bl: false, br: false },
                    { top: 12, right: 12, tl: false, tr: true, bl: false, br: false },
                    { bottom: 12, left: 12, tl: false, tr: false, bl: true, br: false },
                    { bottom: 12, right: 12, tl: false, tr: false, bl: false, br: true },
                ].map(({ tl, tr, bl, br, ...pos }, i) => (
                    <div key={i} className="absolute pointer-events-none" style={{
                        ...pos, width: 18, height: 18, zIndex: 5,
                        borderTop: tl || tr ? '2px solid rgba(0,212,255,0.65)' : 'none',
                        borderBottom: bl || br ? '2px solid rgba(0,212,255,0.65)' : 'none',
                        borderLeft: tl || bl ? '2px solid rgba(0,212,255,0.65)' : 'none',
                        borderRight: tr || br ? '2px solid rgba(0,212,255,0.65)' : 'none',
                    }} />
                ))}

                {/* "AI Monitoring Active" + head pose chip */}
                <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none" style={{ zIndex: 6 }}>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                        style={{
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
                            border: '1px solid rgba(0,255,179,0.18)',
                        }}>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#00ffb3', boxShadow: '0 0 8px #00ffb3',
                            animation: 'sdaPulse 1.5s ease-in-out infinite',
                        }} />
                        <span className="text-xs font-mono tracking-[0.25em] uppercase"
                            style={{ color: 'rgba(0,255,179,0.85)' }}>
                            AI Monitoring Active
                        </span>
                        <div style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#00ffb3', boxShadow: '0 0 8px #00ffb3',
                            animation: 'sdaPulse 1.5s ease-in-out infinite 0.75s',
                        }} />
                    </div>

                    {/* Head pose chip — highlights in amber when distracted */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                        style={{
                            background: distracted ? 'rgba(255,184,0,0.1)' : 'rgba(0,0,0,0.55)',
                            border: `1px solid ${headPoseColor}33`,
                            backdropFilter: 'blur(6px)',
                            transition: 'all 0.4s ease',
                        }}>
                        {distracted && (
                            <div style={{
                                width: 5, height: 5, borderRadius: '50%',
                                background: '#ffb800', boxShadow: '0 0 6px #ffb800',
                                animation: 'sdaPulse 1s ease-in-out infinite',
                            }} />
                        )}
                        <span className="text-xs font-mono uppercase tracking-wider"
                            style={{ color: headPoseColor, transition: 'color 0.3s ease' }}>
                            HEAD: {headPose.toUpperCase()}
                        </span>
                    </div>
                </div>

                {/* CRITICAL vignette */}
                {alertLevel === 'CRITICAL' && (
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'radial-gradient(ellipse at center, rgba(255,51,102,0.07) 0%, transparent 70%)',
                        animation: 'sdaAlertPulse 1.5s ease-in-out infinite',
                        zIndex: 4,
                    }} />
                )}
            </div>

            {/* ── Bottom bar ── */}
            <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 z-10"
                style={{ background: 'rgba(0,3,10,0.88)', borderTop: '1px solid rgba(0,212,255,0.07)' }}>
                <div className="flex items-center gap-3">
                    <span className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.35)' }}>
                        NEURAL ENGINE v2.0
                    </span>
                    <span style={{ color: 'rgba(0,212,255,0.12)' }}>|</span>
                    <span className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.35)' }}>
                        {streamState === STREAM_LIVE
                            ? `BACKEND STREAM · LIVE${headConnected ? ' · HEAD POSE LIVE' : ''}`
                            : streamState === STREAM_CONNECTING ? 'CONNECTING…'
                                : 'STREAM OFFLINE · RETRYING'}
                    </span>
                </div>
                <button
                    onClick={playTestBeep}
                    className="flex items-center gap-2 px-3 py-1 rounded text-xs font-mono tracking-widest uppercase"
                    style={{
                        background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)',
                        color: 'rgba(0,212,255,0.5)', cursor: 'pointer', transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.12)'; e.currentTarget.style.color = 'rgba(0,212,255,0.9)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,212,255,0.06)'; e.currentTarget.style.color = 'rgba(0,212,255,0.5)'; }}
                >
                    ▶ Test Alert
                </button>
            </div>
        </div>
    );
};

export default VideoPanel;
