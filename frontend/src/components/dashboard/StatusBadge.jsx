import React from 'react';

/**
 * StatusBadge — reusable glowing status pill
 * level: 'SAFE' | 'WARNING' | 'CRITICAL' | 'ACTIVE' | 'IDLE'
 */
const LEVEL_CONFIG = {
    SAFE: {
        dot: '#00ffb3',
        text: 'rgba(0, 255, 179, 0.9)',
        bg: 'rgba(0, 255, 179, 0.08)',
        border: 'rgba(0, 255, 179, 0.25)',
        shadow: 'rgba(0, 255, 179, 0.2)',
        pulse: false,
    },
    WARNING: {
        dot: '#ffb800',
        text: 'rgba(255, 184, 0, 0.95)',
        bg: 'rgba(255, 184, 0, 0.08)',
        border: 'rgba(255, 184, 0, 0.3)',
        shadow: 'rgba(255, 184, 0, 0.2)',
        pulse: true,
    },
    CRITICAL: {
        dot: '#ff3366',
        text: 'rgba(255, 51, 102, 0.95)',
        bg: 'rgba(255, 51, 102, 0.1)',
        border: 'rgba(255, 51, 102, 0.4)',
        shadow: 'rgba(255, 51, 102, 0.3)',
        pulse: true,
    },
    ACTIVE: {
        dot: '#00d4ff',
        text: 'rgba(0, 212, 255, 0.9)',
        bg: 'rgba(0, 212, 255, 0.08)',
        border: 'rgba(0, 212, 255, 0.25)',
        shadow: 'rgba(0, 212, 255, 0.15)',
        pulse: false,
    },
    IDLE: {
        dot: '#64748b',
        text: 'rgba(148, 163, 184, 0.7)',
        bg: 'rgba(100, 116, 139, 0.06)',
        border: 'rgba(100, 116, 139, 0.2)',
        shadow: 'transparent',
        pulse: false,
    },
};

const StatusBadge = ({ level = 'SAFE', label, size = 'sm' }) => {
    const cfg = LEVEL_CONFIG[level] || LEVEL_CONFIG.SAFE;
    const paddingClass = size === 'lg' ? 'px-4 py-1.5 text-sm' : 'px-2.5 py-1 text-xs';

    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full font-mono font-semibold tracking-widest uppercase ${paddingClass}`}
            style={{
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                color: cfg.text,
                boxShadow: `0 0 10px ${cfg.shadow}`,
                transition: 'all 0.4s ease',
            }}
        >
            <span
                className={cfg.pulse ? 'animate-ping absolute inline-flex' : ''}
                style={{ display: 'none' }}
            />
            <span
                style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: cfg.dot,
                    boxShadow: `0 0 6px ${cfg.dot}`,
                    animation: cfg.pulse ? 'sdaPulse 1.2s ease-in-out infinite' : 'none',
                    flexShrink: 0,
                }}
            />
            {label ?? level}
        </span>
    );
};

export default StatusBadge;
