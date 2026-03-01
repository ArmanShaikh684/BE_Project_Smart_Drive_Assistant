import React, { useState } from 'react';
import { useDashboard } from '../../context/DashboardContext';

/**
 * EmergencyModal — purely UI-driven.
 * Triggered manually via the "Simulate Emergency" button for demo.
 * No backend connection. Dismiss via the dismiss button.
 */
const EmergencyModal = () => {
    const [show, setShow] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const { alertLevel } = useDashboard();

    // Show a demo trigger button only in CRITICAL state
    if (!show) {
        return alertLevel === 'CRITICAL' && !dismissed ? (
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => setShow(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-mono font-bold tracking-widest uppercase"
                    style={{
                        background: 'rgba(255,51,102,0.15)',
                        border: '1px solid rgba(255,51,102,0.5)',
                        color: '#ff3366',
                        boxShadow: '0 0 20px rgba(255,51,102,0.3)',
                        animation: 'sdaAlertPulse 1.5s ease-in-out infinite',
                        cursor: 'pointer',
                    }}
                >
                    🚨 Emergency Detected
                </button>
            </div>
        ) : null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
            {/* Modal card */}
            <div className="relative max-w-md w-full mx-4 rounded-2xl overflow-hidden"
                style={{
                    background: 'rgba(10,2,8,0.97)',
                    border: '1px solid rgba(255,51,102,0.5)',
                    boxShadow: '0 0 60px rgba(255,51,102,0.25), 0 0 120px rgba(255,51,102,0.08)',
                    animation: 'sdaAlertPulse 2s ease-in-out infinite',
                }}>

                {/* Pulsing top bar */}
                <div style={{
                    height: 3,
                    background: 'linear-gradient(90deg, transparent, #ff3366, transparent)',
                    animation: 'sdaPulse 1s ease-in-out infinite',
                }} />

                <div className="p-8 flex flex-col items-center gap-6 text-center">
                    {/* Icon */}
                    <div className="text-6xl" style={{ filter: 'drop-shadow(0 0 20px #ff3366)' }}>
                        🚨
                    </div>

                    {/* Title */}
                    <div>
                        <div className="text-xs font-mono tracking-[0.3em] uppercase mb-1"
                            style={{ color: 'rgba(255,51,102,0.6)' }}>
                            CRITICAL ALERT
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            Emergency Detected
                        </h2>
                        <p className="text-sm mt-2" style={{ color: 'rgba(255,150,150,0.7)' }}>
                            Multiple safety thresholds exceeded. Please pull over safely.
                        </p>
                    </div>

                    {/* Status rows */}
                    {[
                        { label: 'Drowsiness Level', status: 'CRITICAL', color: '#ff3366' },
                        { label: 'Driver Response', status: 'NO RESPONSE', color: '#ffb800' },
                        { label: 'Emergency Protocol', status: 'ACTIVE', color: '#ff3366' },
                    ].map(row => (
                        <div key={row.label} className="w-full flex justify-between items-center py-2 px-3 rounded-lg"
                            style={{ background: 'rgba(255,51,102,0.06)', border: '1px solid rgba(255,51,102,0.12)' }}>
                            <span className="text-sm font-mono" style={{ color: 'rgba(200,180,180,0.8)' }}>
                                {row.label}
                            </span>
                            <span className="text-xs font-mono font-bold tracking-widest"
                                style={{ color: row.color, textShadow: `0 0 8px ${row.color}` }}>
                                {row.status}
                            </span>
                        </div>
                    ))}

                    {/* Actions */}
                    <div className="flex gap-3 w-full">
                        <button
                            onClick={() => { setShow(false); setDismissed(true); }}
                            className="flex-1 py-3 rounded-xl text-sm font-mono font-bold tracking-widest uppercase"
                            style={{
                                background: 'rgba(255,51,102,0.12)',
                                border: '1px solid rgba(255,51,102,0.35)',
                                color: '#ff3366',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            Dismiss
                        </button>
                        <button
                            onClick={() => setShow(false)}
                            className="flex-1 py-3 rounded-xl text-sm font-mono font-bold tracking-widest uppercase"
                            style={{
                                background: 'rgba(0,212,255,0.1)',
                                border: '1px solid rgba(0,212,255,0.3)',
                                color: '#00d4ff',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            I'm OK
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EmergencyModal;
