import React from 'react';
import { Eye, Smartphone, Compass, Volume2 } from 'lucide-react';
import { useDashboard } from '../../context/DashboardContext';
import StatusBadge from './StatusBadge';

// ── Alert-level color map ────────────────────────────────────────────
const colors = {
    SAFE: { bg: 'rgba(0,255,179,0.07)', border: 'rgba(0,255,179,0.18)', icon: '#00ffb3', shadow: 'rgba(0,255,179,0.15)' },
    WARNING: { bg: 'rgba(255,184,0,0.07)', border: 'rgba(255,184,0,0.25)', icon: '#ffb800', shadow: 'rgba(255,184,0,0.18)' },
    CRITICAL: { bg: 'rgba(255,51,102,0.09)', border: 'rgba(255,51,102,0.35)', icon: '#ff3366', shadow: 'rgba(255,51,102,0.25)' },
};

// ── Individual alert card ────────────────────────────────────────────
const AlertCard = ({ Icon, title, subtitle, triggered, level, description }) => {
    const c = triggered ? colors[level] : colors.SAFE;
    const badgeLevel = triggered ? level : 'SAFE';

    return (
        <div className="rounded-xl p-4 flex flex-col gap-2 transition-all duration-500"
            style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                boxShadow: triggered ? `0 0 18px ${c.shadow}` : 'none',
                backdropFilter: 'blur(10px)',
            }}>
            <div className="flex items-start justify-between gap-3">
                {/* Icon + labels */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="flex-shrink-0 flex items-center justify-center w-9 h-9 rounded-lg"
                        style={{
                            background: `${c.icon}12`,
                            border: `1px solid ${c.icon}28`,
                            boxShadow: triggered ? `0 0 12px ${c.shadow}` : 'none',
                            transition: 'all 0.4s ease',
                        }}>
                        <Icon
                            size={18}
                            strokeWidth={1.6}
                            style={{
                                color: c.icon,
                                filter: triggered ? `drop-shadow(0 0 6px ${c.icon})` : 'none',
                                transition: 'all 0.4s ease',
                            }}
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-semibold text-white tracking-wide leading-tight">{title}</div>
                        <div className="text-xs font-mono mt-0.5 truncate"
                            style={{ color: 'rgba(0,212,255,0.4)' }}>{subtitle}</div>
                    </div>
                </div>
                <StatusBadge level={badgeLevel} />
            </div>

            {/* Warning message — only when triggered */}
            {triggered && (
                <div className="text-xs font-mono px-3 py-2 rounded-lg leading-relaxed"
                    style={{
                        background: `${c.icon}0D`,
                        color: `${c.icon}DD`,
                        border: `1px solid ${c.icon}22`,
                        animation: level === 'CRITICAL' ? 'sdaFlicker 3s ease-in-out infinite' : 'none',
                    }}>
                    ⚠ {description}
                </div>
            )}
        </div>
    );
};

// ── Event log row ────────────────────────────────────────────────────
const EventLogRow = ({ time, label, color, last }) => (
    <div className="flex items-center gap-2 text-xs font-mono py-1.5"
        style={{ borderBottom: last ? 'none' : '1px solid rgba(0,212,255,0.04)', color: 'rgba(148,163,184,0.7)' }}>
        <span className="flex-shrink-0" style={{ color: 'rgba(0,212,255,0.35)' }}>{time}</span>
        <span style={{ color: color ?? 'rgba(148,163,184,0.65)' }}>{label}</span>
    </div>
);

// ── Main AlertsPanel ─────────────────────────────────────────────────
const AlertsPanel = () => {
    const { drowsy, phoneDetected, audioAlert, headPose, alertLevel, sessionTime } = useDashboard();

    const fmt = (s) => {
        const h = Math.floor(s / 3600).toString().padStart(2, '0');
        const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${h}:${m}:${sec}`;
    };

    const headDistracted = headPose && headPose !== 'forward';

    const cards = [
        {
            Icon: Eye,
            title: 'Drowsiness',
            subtitle: 'EYE CLOSURE MONITOR',
            triggered: drowsy,
            level: 'CRITICAL',
            description: 'Driver fatigue detected — take a break',
        },
        {
            Icon: Smartphone,
            title: 'Phone Usage',
            subtitle: 'OBJECT CLASSIFIER',
            triggered: phoneDetected,
            level: 'WARNING',
            description: 'Mobile device in hand — distraction risk',
        },
        {
            Icon: Compass,
            title: 'Head Distraction',
            subtitle: 'POSE ESTIMATOR',
            triggered: headDistracted,
            level: 'WARNING',
            description: `Gaze deviation: ${headPose?.toUpperCase()}`,
        },
        {
            Icon: Volume2,
            title: 'Audio Anomaly',
            subtitle: 'AMBIENT SOUND AI',
            triggered: audioAlert,
            level: 'WARNING',
            description: 'Abnormal cabin audio detected',
        },
    ];

    const events = [
        { time: '22:31:02', label: 'Session started', color: 'rgba(0,212,255,0.65)' },
        { time: '22:31:14', label: 'Head pose: forward', color: 'rgba(0,255,179,0.65)' },
        { time: '22:32:45', label: 'Blink rate nominal', color: 'rgba(0,255,179,0.65)' },
        {
            time: '22:33:10',
            label: alertLevel !== 'SAFE' ? `Alert: ${alertLevel}` : 'All systems nominal',
            color: alertLevel !== 'SAFE' ? 'rgba(255,184,0,0.85)' : 'rgba(148,163,184,0.5)',
        },
    ];

    return (
        <div className="flex flex-col h-full gap-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-shrink-0">
                <div>
                    <div className="text-xs font-mono tracking-[0.25em] uppercase"
                        style={{ color: 'rgba(0,212,255,0.45)' }}>Alert Monitor</div>
                    <div className="text-sm font-bold text-white tracking-wide mt-0.5">Detection Status</div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <StatusBadge level={alertLevel} />
                    <span className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.35)' }}>
                        SESSION {fmt(sessionTime)}
                    </span>
                </div>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2.5 flex-1">
                {cards.map(c => <AlertCard key={c.title} {...c} />)}
            </div>

            {/* Event log */}
            <div className="flex-shrink-0">
                <div className="text-xs font-mono tracking-[0.2em] uppercase mb-2"
                    style={{ color: 'rgba(0,212,255,0.35)' }}>Event Log</div>
                <div className="rounded-lg px-3 py-1"
                    style={{ background: 'rgba(0,3,10,0.8)', border: '1px solid rgba(0,212,255,0.06)' }}>
                    {events.map((e, i) => (
                        <EventLogRow key={i} {...e} last={i === events.length - 1} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AlertsPanel;
