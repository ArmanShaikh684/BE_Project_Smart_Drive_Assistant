import React, { useState, useEffect } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import StatusBadge from './StatusBadge';

const VideoPanel = () => {
    const { headPose, alertLevel, headPoseConnected, playTestBeep } = useDashboard();

    const [frameCount, setFrameCount] = useState(0);
    const fps = 30;

    // Frame counter for the HUD
    useEffect(() => {
        const id = setInterval(() => setFrameCount(c => (c + 1) % 9999), 1000 / fps);
        return () => clearInterval(id);
    }, []);

    // Head pose direction color
    const headPoseColor = {
        forward: '#00ffb3',
        left: '#ffb800',
        right: '#ffb800',
        up: '#ffb800',
        down: '#ff3366',
        unknown: '#64748b',
    }[headPose] ?? '#64748b';

    // Outer border changes with alert level
    const borderStyle = alertLevel === 'CRITICAL'
        ? { border: '1px solid rgba(255,51,102,0.55)', boxShadow: '0 0 30px rgba(255,51,102,0.25), inset 0 0 30px rgba(255,0,0,0.05)', animation: 'sdaAlertPulse 1.5s ease-in-out infinite' }
        : alertLevel === 'WARNING'
            ? { border: '1px solid rgba(255,184,0,0.45)', boxShadow: '0 0 20px rgba(255,184,0,0.2)', animation: 'sdaWarnPulse 2s ease-in-out infinite' }
            : { border: '1px solid rgba(0,212,255,0.18)', boxShadow: '0 0 20px rgba(0,212,255,0.08), inset 0 0 20px rgba(0,0,0,0.4)', animation: 'sdaGlowPulse 3s ease-in-out infinite' };

    return (
        <div className="relative flex flex-col h-full rounded-xl overflow-hidden"
            style={{ background: 'rgba(0,5,15,0.95)', ...borderStyle }}>

            {/* ── Top HUD Bar ── */}
            <div className="flex items-center justify-between px-4 py-2.5 flex-shrink-0 z-10"
                style={{ background: 'rgba(0,3,10,0.88)', borderBottom: '1px solid rgba(0,212,255,0.07)' }}>
                <div className="flex items-center gap-3">
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: '#00ffb3', boxShadow: '0 0 8px #00ffb3',
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

            {/* ── Main video area — animated HUD simulation ── */}
            <div className="relative flex-1 overflow-hidden sda-grid-bg" style={{ minHeight: 0, background: 'rgba(0,3,12,0.98)' }}>

                {/* Ambient gradient */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: 'radial-gradient(ellipse 70% 70% at 50% 40%, rgba(0,212,255,0.04) 0%, transparent 70%)',
                }} />

                {/* Moving scan line */}
                <div className="absolute left-0 right-0 pointer-events-none" style={{
                    height: 2,
                    background: 'linear-gradient(90deg, transparent 0%, rgba(0,212,255,0.4) 30%, rgba(0,212,255,0.7) 50%, rgba(0,212,255,0.4) 70%, transparent 100%)',
                    boxShadow: '0 0 8px rgba(0,212,255,0.35)',
                    animation: 'scanLine 3s linear infinite',
                    zIndex: 2,
                }} />

                {/* Corner HUD brackets */}
                {[
                    { top: 12, left: 12, borderTop: true, borderLeft: true, borderBottom: false, borderRight: false },
                    { top: 12, right: 12, borderTop: true, borderLeft: false, borderBottom: false, borderRight: true },
                    { bottom: 12, left: 12, borderTop: false, borderLeft: true, borderBottom: true, borderRight: false },
                    { bottom: 12, right: 12, borderTop: false, borderLeft: false, borderBottom: true, borderRight: true },
                ].map((s, i) => (
                    <div key={i} className="absolute pointer-events-none" style={{
                        top: s.top, bottom: s.bottom, left: s.left, right: s.right,
                        width: 20, height: 20, zIndex: 3,
                        borderTop: s.borderTop ? '2px solid rgba(0,212,255,0.65)' : 'none',
                        borderBottom: s.borderBottom ? '2px solid rgba(0,212,255,0.65)' : 'none',
                        borderLeft: s.borderLeft ? '2px solid rgba(0,212,255,0.65)' : 'none',
                        borderRight: s.borderRight ? '2px solid rgba(0,212,255,0.65)' : 'none',
                    }} />
                ))}

                {/* Rotating outer tracking ring */}
                <div className="absolute pointer-events-none" style={{
                    top: '50%', left: '50%',
                    transform: 'translate(-50%, -56%)',
                    width: 160, height: 180,
                    zIndex: 3,
                }}>
                    {/* Outer spinning ring */}
                    <div style={{
                        position: 'absolute', inset: -20,
                        border: '1px solid rgba(0,212,255,0.12)',
                        borderRadius: '50%',
                        borderTopColor: 'rgba(0,212,255,0.55)',
                        borderRightColor: 'rgba(0,212,255,0.2)',
                        animation: 'rotateRing 4s linear infinite',
                    }} />
                    {/* Inner counter-rotating ring */}
                    <div style={{
                        position: 'absolute', inset: -8,
                        border: '1px dashed rgba(0,212,255,0.08)',
                        borderRadius: '50%',
                        borderTopColor: 'rgba(0,212,255,0.2)',
                        animation: 'rotateRing 8s linear reverse infinite',
                    }} />
                    {/* Face oval reticle */}
                    <div style={{
                        width: '100%', height: '100%',
                        border: '1.5px solid rgba(0,212,255,0.28)',
                        borderRadius: '60% 60% 50% 50%',
                        boxShadow: '0 0 20px rgba(0,212,255,0.06), inset 0 0 20px rgba(0,212,255,0.03)',
                    }} />
                    {/* Crosshair dots */}
                    {[{ top: '50%', left: -6 }, { top: '50%', right: -6 }, { top: -6, left: '50%' }, { bottom: -6, left: '50%' }].map((pos, i) => (
                        <div key={i} style={{
                            position: 'absolute', ...pos,
                            width: 4, height: 4, borderRadius: '50%',
                            background: 'rgba(0,212,255,0.5)',
                            boxShadow: '0 0 6px rgba(0,212,255,0.4)',
                            transform: 'translate(-50%, -50%)',
                        }} />
                    ))}
                </div>

                {/* Alert-level vignette */}
                {alertLevel === 'CRITICAL' && (
                    <div className="absolute inset-0 pointer-events-none" style={{
                        background: 'radial-gradient(ellipse at center, rgba(255,51,102,0.07) 0%, transparent 70%)',
                        animation: 'sdaAlertPulse 1.5s ease-in-out infinite',
                        zIndex: 2,
                    }} />
                )}

                {/* "AI Monitoring Active" badge + head pose chip */}
                <div className="absolute bottom-6 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none" style={{ zIndex: 5 }}>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full"
                        style={{
                            background: 'rgba(0,0,0,0.6)',
                            backdropFilter: 'blur(8px)',
                            border: '1px solid rgba(0,255,179,0.2)',
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
                    {/* Head pose chip */}
                    <div className="flex items-center gap-2 px-3 py-1 rounded-full"
                        style={{
                            background: 'rgba(0,0,0,0.55)',
                            border: `1px solid ${headPoseColor}33`,
                            backdropFilter: 'blur(6px)',
                        }}>
                        <span className="text-xs font-mono uppercase tracking-wider" style={{ color: headPoseColor }}>
                            HEAD: {headPose.toUpperCase()}
                        </span>
                    </div>
                </div>
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
                        {headPoseConnected ? 'HEAD POSE · LIVE' : 'REAL-TIME ANALYSIS'}
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
