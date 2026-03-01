import React from 'react';
import AlertStatusBadge from './AlertStatusBadge';

const LEVEL_COLORS = {
    SAFE: { bg: 'rgba(0,255,179,0.05)', border: 'rgba(0,255,179,0.18)', icon: '#00ffb3', glow: 'rgba(0,255,179,0.10)', ring: 'rgba(0,255,179,0.0)' },
    WARNING: { bg: 'rgba(255,184,0,0.06)', border: 'rgba(255,184,0,0.25)', icon: '#ffb800', glow: 'rgba(255,184,0,0.12)', ring: 'rgba(255,184,0,0.0)' },
    CRITICAL: { bg: 'rgba(255,51,102,0.07)', border: 'rgba(255,51,102,0.40)', icon: '#ff3366', glow: 'rgba(255,51,102,0.20)', ring: 'rgba(255,51,102,0.3)' },
    IDLE: { bg: 'rgba(15,23,42,0.6)', border: 'rgba(0,212,255,0.08)', icon: '#334155', glow: 'transparent', ring: 'transparent' },
};

const AlertCard = ({
    Icon,
    title,
    moduleLabel,
    description,
    level = 'SAFE',
    lastEvent = null,
    eventTime = null,
}) => {
    const c = LEVEL_COLORS[level] ?? LEVEL_COLORS.SAFE;
    const crit = level === 'CRITICAL';

    return (
        <div
            className="relative rounded-2xl p-5 flex flex-col gap-4 transition-all duration-500"
            style={{
                background: c.bg,
                border: `1px solid ${c.border}`,
                boxShadow: crit
                    ? `0 0 32px ${c.glow}, inset 0 0 24px rgba(255,51,102,0.04)`
                    : `0 0 16px ${c.glow}`,
                backdropFilter: 'blur(14px)',
                animation: crit ? 'sdaAlertPulse 1.8s ease-in-out infinite' : 'none',
            }}
        >
            {/* Subtle top shimmer line */}
            <div style={{
                position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
                background: `linear-gradient(90deg, transparent, ${c.border}, transparent)`,
                borderRadius: 1,
            }} />

            {/* Header row */}
            <div className="flex items-start justify-between gap-3">
                {/* Icon container */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div style={{
                        width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                        background: `${c.icon}10`,
                        border: `1px solid ${c.icon}28`,
                        boxShadow: crit ? `0 0 16px ${c.glow}` : 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.4s ease',
                    }}>
                        <Icon
                            size={20}
                            strokeWidth={1.5}
                            style={{
                                color: c.icon,
                                filter: level !== 'IDLE' ? `drop-shadow(0 0 5px ${c.icon}88)` : 'none',
                                transition: 'all 0.4s ease',
                            }}
                        />
                    </div>
                    <div className="min-w-0">
                        <div className="font-semibold text-sm text-white tracking-wide leading-tight">
                            {title}
                        </div>
                        <div className="text-xs font-mono mt-0.5 tracking-widest uppercase"
                            style={{ color: 'rgba(0,212,255,0.35)' }}>
                            {moduleLabel}
                        </div>
                    </div>
                </div>
                <AlertStatusBadge level={level} size="sm" />
            </div>

            {/* Description / triggered message */}
            <div className="text-xs leading-relaxed font-mono rounded-lg px-3 py-2"
                style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: `1px solid ${c.icon}14`,
                    color: level === 'IDLE' ? 'rgba(100,116,139,0.6)' : `${c.icon}BB`,
                }}>
                {description}
            </div>

            {/* Last event chip */}
            {lastEvent && (
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div style={{
                            width: 4, height: 4, borderRadius: '50%',
                            background: c.icon, flexShrink: 0,
                            boxShadow: `0 0 4px ${c.icon}`,
                        }} />
                        <span className="text-xs font-mono" style={{ color: 'rgba(148,163,184,0.6)' }}>
                            {lastEvent}
                        </span>
                    </div>
                    {eventTime && (
                        <span className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.3)' }}>
                            {eventTime}
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};

export default AlertCard;
