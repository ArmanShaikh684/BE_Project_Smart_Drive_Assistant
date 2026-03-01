import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, Smartphone, Compass, Volume2, Shield, ShieldAlert, Activity, Clock } from 'lucide-react';
import AlertCard from './AlertCard';
import EventLog from './EventLog';
import AlertStatusBadge from './AlertStatusBadge';

// ── Simulation cycle patterns ──────────────────────────────────────────
// Each tuple: [SAFE secs, WARNING secs, CRITICAL secs]  (repeating)
const CYCLES = {
    drowsy: [12, 3, 2],
    phone: [10, 4, 0],  // Phone goes to WARNING only
    head: [8, 2, 3],
    audio: [14, 3, 0],
};

const cycleLevel = (elapsed, pattern) => {
    const period = pattern.reduce((a, b) => a + b, 0);
    const t = elapsed % period;
    let acc = 0;
    const states = ['SAFE', 'WARNING', 'CRITICAL'];
    for (let i = 0; i < pattern.length; i++) {
        acc += pattern[i];
        if (t < acc) return pattern[i] === 0 ? 'SAFE' : states[i];
    }
    return 'SAFE';
};

// ── Time helpers ───────────────────────────────────────────────────────
const nowTime = () => {
    const d = new Date();
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
};

const fmtSession = (s) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
};

// ── Overall safety level ───────────────────────────────────────────────
const overallLevel = (levels) => {
    if (levels.includes('CRITICAL')) return 'CRITICAL';
    if (levels.includes('WARNING')) return 'WARNING';
    return 'SAFE';
};

const OVERALL_CONFIG = {
    SAFE: { label: 'ALL SYSTEMS NOMINAL', icon: Shield, color: '#00ffb3', bg: 'rgba(0,255,179,0.06)', border: 'rgba(0,255,179,0.2)' },
    WARNING: { label: 'WARNING DETECTED', icon: ShieldAlert, color: '#ffb800', bg: 'rgba(255,184,0,0.06)', border: 'rgba(255,184,0,0.25)' },
    CRITICAL: { label: 'CRITICAL ALERT', icon: ShieldAlert, color: '#ff3366', bg: 'rgba(255,51,102,0.08)', border: 'rgba(255,51,102,0.35)' },
};

// ── Last event description map ─────────────────────────────────────────
const stateDesc = {
    drowsy: {
        SAFE: 'No fatigue indicators detected. Eyes open, blink rate normal.',
        WARNING: 'Early fatigue signs detected. Increased blink frequency.',
        CRITICAL: 'Driver fatigue confirmed — extended eye closure event.',
    },
    phone: {
        SAFE: 'No mobile device detected in driver field of view.',
        WARNING: 'Possible phone object detected in hand area.',
        CRITICAL: 'Phone in hand confirmed — distraction risk high.',
    },
    head: {
        SAFE: 'Gaze direction nominal. Driver focused on road.',
        WARNING: 'Head pose deviation detected. Slight gaze drift.',
        CRITICAL: 'Significant head turn detected — visual distraction.',
    },
    audio: {
        SAFE: 'Cabin audio nominal. No anomalous sounds detected.',
        WARNING: 'Unusual audio pattern detected in cabin environment.',
        CRITICAL: 'Audio anomaly confirmed — potential distraction event.',
    },
};

const logTypeForLevel = { SAFE: 'success', WARNING: 'warning', CRITICAL: 'critical' };
const logMsgForState = {
    drowsy: { SAFE: 'Drowsiness cleared', WARNING: 'Drowsiness warning', CRITICAL: 'DROWSINESS CRITICAL' },
    phone: { SAFE: 'Phone cleared', WARNING: 'Phone usage warning', CRITICAL: 'PHONE CRITICAL' },
    head: { SAFE: 'Head pose nominal', WARNING: 'Head distraction warning', CRITICAL: 'HEAD DISTRACTION CRITICAL' },
    audio: { SAFE: 'Audio nominal', WARNING: 'Audio anomaly warning', CRITICAL: 'AUDIO ANOMALY CRITICAL' },
};

let _eventId = 0;
const mkEvent = (type, message) => ({ id: ++_eventId, type, message, time: nowTime() });

const AlertScreen = () => {
    // ── State ──────────────────────────────────────────────────────
    const [elapsed, setElapsed] = useState(0);   // session seconds
    const [tickCount, setTickCount] = useState(0);   // drives level updates
    const [levels, setLevels] = useState({ drowsy: 'SAFE', phone: 'SAFE', head: 'SAFE', audio: 'SAFE' });
    const [events, setEvents] = useState([
        mkEvent('system', 'SDA.OS Alert Monitor initialised'),
        mkEvent('info', 'Detection modules online'),
        mkEvent('success', 'All systems nominal'),
    ]);

    const prevLevels = useRef({ drowsy: 'SAFE', phone: 'SAFE', head: 'SAFE', audio: 'SAFE' });

    // ── Session timer ──────────────────────────────────────────────
    useEffect(() => {
        const id = setInterval(() => {
            setElapsed(s => s + 1);
            setTickCount(c => c + 1);
        }, 1000);
        return () => clearInterval(id);
    }, []);

    // ── Simulate level cycling + emit log events on transition ─────
    useEffect(() => {
        const newLevels = {
            drowsy: cycleLevel(tickCount, CYCLES.drowsy),
            phone: cycleLevel(tickCount, CYCLES.phone),
            head: cycleLevel(tickCount, CYCLES.head),
            audio: cycleLevel(tickCount, CYCLES.audio),
        };

        const newEvents = [];
        for (const [key, newLvl] of Object.entries(newLevels)) {
            if (newLvl !== prevLevels.current[key]) {
                newEvents.push(mkEvent(logTypeForLevel[newLvl], logMsgForState[key][newLvl]));
            }
        }

        if (newEvents.length > 0) {
            setEvents(prev => [...prev, ...newEvents].slice(-60)); // keep last 60
        }
        prevLevels.current = newLevels;
        setLevels(newLevels);
    }, [tickCount]);

    // ── Derived values ─────────────────────────────────────────────
    const allLevels = Object.values(levels);
    const overall = overallLevel(allLevels);
    const overallCfg = OVERALL_CONFIG[overall];
    const OverallIcon = overallCfg.icon;
    const activeAlerts = allLevels.filter(l => l !== 'SAFE').length;
    const critAlerts = allLevels.filter(l => l === 'CRITICAL').length;

    const cards = [
        {
            key: 'drowsy', Icon: Eye, title: 'Drowsiness',
            moduleLabel: 'Eye Closure Monitor',
            description: stateDesc.drowsy[levels.drowsy],
            lastEvent: logMsgForState.drowsy[levels.drowsy],
        },
        {
            key: 'phone', Icon: Smartphone, title: 'Phone Usage',
            moduleLabel: 'Object Classifier',
            description: stateDesc.phone[levels.phone],
            lastEvent: logMsgForState.phone[levels.phone],
        },
        {
            key: 'head', Icon: Compass, title: 'Head Distraction',
            moduleLabel: 'Pose Estimator',
            description: stateDesc.head[levels.head],
            lastEvent: logMsgForState.head[levels.head],
        },
        {
            key: 'audio', Icon: Volume2, title: 'Audio Anomaly',
            moduleLabel: 'Ambient Sound AI',
            description: stateDesc.audio[levels.audio],
            lastEvent: logMsgForState.audio[levels.audio],
        },
    ];

    return (
        <div className="flex flex-col h-full gap-5 overflow-hidden">

            {/* ── Top System Status Bar ── */}
            <div className="flex items-center justify-between flex-shrink-0 gap-4">
                {/* Overall safety indicator */}
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl flex-1"
                    style={{
                        background: overallCfg.bg,
                        border: `1px solid ${overallCfg.border}`,
                        boxShadow: overall === 'CRITICAL' ? `0 0 24px rgba(255,51,102,0.15)` : 'none',
                        animation: overall === 'CRITICAL' ? 'sdaAlertPulse 1.8s ease-in-out infinite' : 'none',
                        backdropFilter: 'blur(12px)',
                    }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: `${overallCfg.color}12`,
                        border: `1px solid ${overallCfg.color}28`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <OverallIcon size={18} strokeWidth={1.5} style={{ color: overallCfg.color, filter: `drop-shadow(0 0 5px ${overallCfg.color})` }} />
                    </div>
                    <div>
                        <div className="text-xs font-mono tracking-[0.2em] uppercase"
                            style={{ color: 'rgba(0,212,255,0.4)' }}>System Safety Status</div>
                        <div className="text-sm font-bold tracking-widest font-mono mt-0.5"
                            style={{ color: overallCfg.color }}>{overallCfg.label}</div>
                    </div>
                    <div className="ml-auto">
                        <AlertStatusBadge level={overall} />
                    </div>
                </div>

                {/* Stats row */}
                {[
                    { label: 'SESSION', value: fmtSession(elapsed), icon: Clock, color: '#00d4ff' },
                    { label: 'ACTIVE ALERTS', value: activeAlerts, icon: Activity, color: activeAlerts > 0 ? '#ffb800' : '#00ffb3' },
                    { label: 'CRITICAL', value: critAlerts, icon: ShieldAlert, color: critAlerts > 0 ? '#ff3366' : '#334155' },
                ].map(({ label, value, icon: Icon, color }) => (
                    <div key={label} className="flex flex-col items-center justify-center px-5 py-3 rounded-xl flex-shrink-0"
                        style={{
                            background: 'rgba(0,3,10,0.8)',
                            border: '1px solid rgba(0,212,255,0.08)',
                            backdropFilter: 'blur(12px)',
                            minWidth: 100,
                        }}>
                        <Icon size={16} style={{ color, marginBottom: 4 }} />
                        <div className="text-base font-bold font-mono" style={{ color }}>{value}</div>
                        <div className="text-xs font-mono tracking-widest uppercase mt-0.5"
                            style={{ color: 'rgba(0,212,255,0.3)' }}>{label}</div>
                    </div>
                ))}
            </div>

            {/* ── Alert Cards Grid + Event Log ── */}
            <div className="flex gap-5 flex-1 min-h-0 overflow-hidden">

                {/* 2×2 Cards grid */}
                <div className="grid grid-cols-2 gap-4 flex-1 content-start">
                    {cards.map(({ key, ...rest }) => (
                        <AlertCard
                            key={key}
                            {...rest}
                            level={levels[key]}
                            eventTime={nowTime()}
                        />
                    ))}
                </div>

                {/* Event Log — right column */}
                <div className="w-72 flex-shrink-0 flex flex-col rounded-xl p-4 overflow-hidden"
                    style={{
                        background: 'rgba(0,3,10,0.85)',
                        border: '1px solid rgba(0,212,255,0.08)',
                        backdropFilter: 'blur(14px)',
                    }}>
                    <EventLog events={events} maxVisible={20} />
                </div>
            </div>

            {/* ── Scan line footer ── */}
            <div className="flex-shrink-0 flex items-center justify-between px-1">
                <span className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.2)' }}>
                    NEURAL ENGINE v2.0 · DETECTION LAYER ACTIVE
                </span>
                <span className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.2)' }}>
                    SDA.OS ALERT MONITOR
                </span>
            </div>
        </div>
    );
};

export default AlertScreen;
