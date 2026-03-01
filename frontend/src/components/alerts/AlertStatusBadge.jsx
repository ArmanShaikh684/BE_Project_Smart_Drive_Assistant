import React from 'react';

const LEVEL_CONFIG = {
    SAFE: { label: 'SAFE', dot: '#00ffb3', border: '#00ffb3', text: '#00ffb3', shadow: 'rgba(0,255,179,0.4)' },
    WARNING: { label: 'WARNING', dot: '#ffb800', border: '#ffb800', text: '#ffb800', shadow: 'rgba(255,184,0,0.4)' },
    CRITICAL: { label: 'CRITICAL', dot: '#ff3366', border: '#ff3366', text: '#ff3366', shadow: 'rgba(255,51,102,0.5)' },
    IDLE: { label: 'IDLE', dot: '#334155', border: '#334155', text: '#64748b', shadow: 'transparent' },
};

const AlertStatusBadge = ({ level = 'SAFE', size = 'md' }) => {
    const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.SAFE;
    const px = size === 'sm' ? '8px 10px' : '6px 12px';
    const fs = size === 'sm' ? '9px' : '10px';

    return (
        <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: px,
            borderRadius: 20,
            background: `${cfg.dot}12`,
            border: `1px solid ${cfg.border}35`,
            boxShadow: `0 0 8px ${cfg.shadow}`,
        }}>
            <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: cfg.dot,
                boxShadow: `0 0 6px ${cfg.dot}`,
                flexShrink: 0,
                animation: level === 'CRITICAL' ? 'sdaPulse 1s ease-in-out infinite' : 'none',
            }} />
            <span style={{
                fontSize: fs, fontFamily: 'monospace',
                fontWeight: 700, letterSpacing: '0.15em',
                color: cfg.text, textTransform: 'uppercase',
            }}>
                {cfg.label}
            </span>
        </div>
    );
};

export default AlertStatusBadge;
