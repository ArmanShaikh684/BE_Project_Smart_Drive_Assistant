import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Navbar = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const id = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(id);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const fmt = (d) => d.toLocaleTimeString('en-US', {
        hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
    });
    const fmtDate = (d) => d.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    }).toUpperCase();

    return (
        <nav
            className="flex items-center justify-between px-5 flex-shrink-0"
            style={{
                height: 56,
                background: 'rgba(0,3,10,0.95)',
                borderBottom: '1px solid rgba(0,212,255,0.08)',
                backdropFilter: 'blur(14px)',
            }}
        >
            {/* Left: Brand */}
            <div className="flex items-center gap-3">
                <div className="flex gap-0.5">
                    {[1, 0.5, 0.25].map((op, i) => (
                        <div key={i} style={{
                            width: 3, height: 18, borderRadius: 2,
                            background: '#00d4ff', opacity: op,
                            boxShadow: op === 1 ? '0 0 6px #00d4ff' : 'none',
                        }} />
                    ))}
                </div>
                <div>
                    <div className="text-xs font-mono tracking-[0.3em] uppercase"
                        style={{ color: 'rgba(0,212,255,0.45)', lineHeight: 1 }}>System</div>
                    <div className="text-sm font-black tracking-wider text-white" style={{ lineHeight: 1.2 }}>
                        SDA<span style={{ color: '#00d4ff' }}>.</span>OS
                    </div>
                </div>
            </div>

            {/* Center: Live clock */}
            <div className="hidden md:flex flex-col items-center">
                <div className="text-lg font-mono font-bold tracking-widest"
                    style={{ color: '#00d4ff', textShadow: '0 0 10px rgba(0,212,255,0.4)' }}>
                    {fmt(time)}
                </div>
                <div className="text-xs font-mono tracking-[0.2em]"
                    style={{ color: 'rgba(0,212,255,0.35)' }}>
                    {fmtDate(time)}
                </div>
            </div>

            {/* Right: Driver info + logout */}
            <div className="flex items-center gap-4">
                {/* System status */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full"
                    style={{
                        background: 'rgba(0,255,179,0.06)',
                        border: '1px solid rgba(0,255,179,0.2)',
                    }}>
                    <div style={{
                        width: 7, height: 7, borderRadius: '50%',
                        background: '#00ffb3', boxShadow: '0 0 6px #00ffb3',
                        animation: 'sdaPulse 2s ease-in-out infinite',
                    }} />
                    <span className="text-xs font-mono tracking-widest uppercase"
                        style={{ color: 'rgba(0,255,179,0.7)' }}>Active</span>
                </div>

                {/* Driver name */}
                <div className="flex items-center gap-2">
                    <div style={{
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'rgba(0,212,255,0.1)',
                        border: '1px solid rgba(0,212,255,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        <span className="text-xs font-bold" style={{ color: '#00d4ff' }}>
                            {(user?.name || 'D')[0].toUpperCase()}
                        </span>
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.4)' }}>Driver</div>
                        <div className="text-xs font-semibold text-white">{user?.name || 'Unknown'}</div>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold tracking-widest uppercase"
                    style={{
                        background: 'rgba(255,51,102,0.08)',
                        border: '1px solid rgba(255,51,102,0.2)',
                        color: 'rgba(255,100,130,0.8)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(255,51,102,0.15)';
                        e.currentTarget.style.borderColor = 'rgba(255,51,102,0.4)';
                        e.currentTarget.style.color = '#ff3366';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255,51,102,0.08)';
                        e.currentTarget.style.borderColor = 'rgba(255,51,102,0.2)';
                        e.currentTarget.style.color = 'rgba(255,100,130,0.8)';
                    }}
                >
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
