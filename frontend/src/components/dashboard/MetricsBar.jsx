import React from 'react';
import { useDashboard } from '../../context/DashboardContext';

const Metric = ({ label, value, unit, color, subLabel }) => (
    <div className="flex flex-col items-center justify-center px-4 py-3 rounded-xl flex-1 min-w-0"
        style={{
            background: 'rgba(0,5,15,0.8)',
            border: '1px solid rgba(0,212,255,0.08)',
            transition: 'all 0.4s ease',
        }}>
        <div className="text-xs font-mono tracking-[0.2em] uppercase mb-1"
            style={{ color: 'rgba(0,212,255,0.4)' }}>{label}</div>
        <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black font-mono" style={{ color, textShadow: `0 0 12px ${color}` }}>
                {value}
            </span>
            {unit && <span className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.4)' }}>{unit}</span>}
        </div>
        {subLabel && (
            <div className="text-xs font-mono mt-1 tracking-wider" style={{ color: 'rgba(148,163,184,0.5)' }}>
                {subLabel}
            </div>
        )}
    </div>
);

const AlertLevelBar = ({ level }) => {
    const levels = ['SAFE', 'WARNING', 'CRITICAL'];
    const idx = levels.indexOf(level);
    const colors = ['#00ffb3', '#ffb800', '#ff3366'];
    const bg = colors[idx] ?? colors[0];

    return (
        <div className="flex flex-col items-center justify-center px-4 py-3 rounded-xl flex-1 min-w-0 relative overflow-hidden"
            style={{
                background: 'rgba(0,5,15,0.8)',
                border: `1px solid ${bg}22`,
                transition: 'all 0.4s ease',
            }}>
            {/* Progress bars */}
            <div className="text-xs font-mono tracking-[0.2em] uppercase mb-2"
                style={{ color: 'rgba(0,212,255,0.4)' }}>Alert Level</div>
            <div className="flex gap-1 w-full px-2">
                {levels.map((l, i) => (
                    <div key={l} className="flex-1 rounded-full h-2 relative overflow-hidden"
                        style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.08)' }}>
                        <div style={{
                            position: 'absolute', inset: 0,
                            background: colors[i],
                            boxShadow: `0 0 8px ${colors[i]}`,
                            opacity: i <= idx ? 1 : 0.15,
                            transition: 'opacity 0.5s ease',
                            borderRadius: 'inherit',
                        }} />
                    </div>
                ))}
            </div>
            <div className="text-xs font-mono mt-1.5 font-bold tracking-widest"
                style={{ color: bg, textShadow: `0 0 8px ${bg}` }}>
                {level}
            </div>
        </div>
    );
};

const MetricsBar = () => {
    const { ear, blinkRate, headPose, alertLevel, headPoseConnected } = useDashboard();

    const earColor = ear < 0.22 ? '#ff3366' : ear < 0.27 ? '#ffb800' : '#00ffb3';
    const blinkColor = blinkRate < 8 ? '#ff3366' : blinkRate < 12 ? '#ffb800' : '#00d4ff';

    const headPoseColors = {
        forward: '#00ffb3',
        left: '#ffb800',
        right: '#ffb800',
        up: '#ffb800',
        down: '#ff3366',
        unknown: '#64748b',
    };

    return (
        <div className="rounded-xl overflow-hidden"
            style={{
                background: 'rgba(0,4,12,0.85)',
                border: '1px solid rgba(0,212,255,0.1)',
                backdropFilter: 'blur(12px)',
            }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2"
                style={{ borderBottom: '1px solid rgba(0,212,255,0.06)' }}>
                <div className="flex items-center gap-2">
                    <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: headPoseConnected ? '#00ffb3' : '#ff3366',
                        boxShadow: headPoseConnected ? '0 0 6px #00ffb3' : '0 0 6px #ff3366',
                        animation: 'sdaPulse 2s ease-in-out infinite',
                    }} />
                    <span className="text-xs font-mono tracking-[0.25em] uppercase"
                        style={{ color: 'rgba(0,212,255,0.4)' }}>
                        Real-Time Metrics
                    </span>
                </div>
                <span className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.25)' }}>
                    HEAD_POSE · {headPoseConnected ? 'LIVE' : 'OFFLINE'} · LOCAL SIM
                </span>
            </div>

            {/* Metrics row */}
            <div className="flex gap-3 p-3">
                <Metric
                    label="EAR Value"
                    value={ear}
                    color={earColor}
                    subLabel={ear < 0.22 ? 'DROWSY' : ear < 0.27 ? 'LOW' : 'NORMAL'}
                />
                <Metric
                    label="Blink Rate"
                    value={blinkRate}
                    unit="/min"
                    color={blinkColor}
                    subLabel={blinkRate < 8 ? 'CRITICAL' : blinkRate < 12 ? 'REDUCED' : 'NORMAL'}
                />
                <Metric
                    label="Head Direction"
                    value={headPose.toUpperCase()}
                    color={headPoseColors[headPose] ?? '#64748b'}
                    subLabel={headPoseConnected ? 'LIVE DETECTION' : 'OFFLINE'}
                />
                <AlertLevelBar level={alertLevel} />
            </div>
        </div>
    );
};

export default MetricsBar;
