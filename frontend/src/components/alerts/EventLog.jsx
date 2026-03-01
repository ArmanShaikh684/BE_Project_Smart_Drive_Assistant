import React, { useRef, useEffect } from 'react';

const LOG_COLORS = {
    info: 'rgba(0,212,255,0.65)',
    success: 'rgba(0,255,179,0.75)',
    warning: 'rgba(255,184,0,0.8)',
    critical: 'rgba(255,51,102,0.85)',
    system: 'rgba(148,163,184,0.5)',
};

const LOG_ICONS = {
    info: '◈',
    success: '●',
    warning: '▲',
    critical: '⬟',
    system: '◇',
};

const EventLog = ({ events = [], maxVisible = 8 }) => {
    const bottomRef = useRef(null);

    // Auto-scroll to bottom when new events arrive
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [events.length]);

    const visible = events.slice(-maxVisible * 2); // keep last N*2 in DOM

    return (
        <div className="flex flex-col h-full">
            {/* Log header */}
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <div className="flex items-center gap-2">
                    <div style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#00ffb3', boxShadow: '0 0 8px #00ffb3',
                        animation: 'sdaPulse 2s ease-in-out infinite',
                    }} />
                    <span className="text-xs font-mono tracking-[0.25em] uppercase"
                        style={{ color: 'rgba(0,212,255,0.45)' }}>
                        Event Log
                    </span>
                </div>
                <span className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.3)' }}>
                    {events.length} EVENTS
                </span>
            </div>

            {/* Scrollable log area */}
            <div
                className="flex-1 overflow-y-auto pr-1"
                style={{
                    minHeight: 0,
                    scrollbarWidth: 'thin',
                    scrollbarColor: 'rgba(0,212,255,0.15) transparent',
                }}
            >
                <div className="rounded-xl overflow-hidden"
                    style={{
                        background: 'rgba(0,3,10,0.8)',
                        border: '1px solid rgba(0,212,255,0.07)',
                    }}>
                    {visible.length === 0 && (
                        <div className="px-4 py-6 text-center">
                            <span className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.25)' }}>
                                No events recorded
                            </span>
                        </div>
                    )}
                    {visible.map((evt, i) => {
                        const color = LOG_COLORS[evt.type] ?? LOG_COLORS.system;
                        const icon = LOG_ICONS[evt.type] ?? '◇';
                        const isLast = i === visible.length - 1;
                        return (
                            <div
                                key={evt.id ?? i}
                                className="flex items-start gap-3 px-4 py-2.5"
                                style={{
                                    borderBottom: isLast ? 'none' : '1px solid rgba(0,212,255,0.04)',
                                    animation: i === visible.length - 1 ? 'sdaFadeIn 0.4s ease-out' : 'none',
                                    background: isLast ? 'rgba(0,212,255,0.02)' : 'transparent',
                                }}
                            >
                                {/* Icon */}
                                <span style={{ color, fontSize: 9, marginTop: 3, flexShrink: 0 }}>
                                    {icon}
                                </span>
                                {/* Timestamp */}
                                <span className="text-xs font-mono flex-shrink-0"
                                    style={{ color: 'rgba(0,212,255,0.3)', minWidth: 52 }}>
                                    {evt.time}
                                </span>
                                {/* Message */}
                                <span className="text-xs font-mono leading-relaxed" style={{ color }}>
                                    {evt.message}
                                </span>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>
            </div>
        </div>
    );
};

export default EventLog;
