import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
    {
        path: '/dashboard',
        label: 'Dashboard',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
    },
    {
        path: '/alerts',
        label: 'Alerts',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        ),
    },
    {
        path: '/driver-profile',
        label: 'Profile',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
        ),
    },
    {
        path: '/settings',
        label: 'Settings',
        icon: (
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
];

const Sidebar = () => {
    const location = useLocation();

    return (
        <div
            className="flex flex-col items-center w-16 py-4 gap-6 flex-shrink-0"
            style={{
                background: 'rgba(0,3,10,0.95)',
                borderRight: '1px solid rgba(0,212,255,0.08)',
                backdropFilter: 'blur(14px)',
            }}
        >
            {/* Logo mark */}
            <div className="flex flex-col items-center">
                <div style={{
                    width: 32, height: 32,
                    border: '1.5px solid rgba(0,212,255,0.5)',
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: 'rgba(0,212,255,0.06)',
                    boxShadow: '0 0 12px rgba(0,212,255,0.15)',
                }}>
                    <span className="text-xs font-black font-mono" style={{ color: '#00d4ff' }}>S</span>
                </div>
            </div>

            {/* Divider */}
            <div style={{ width: 1, height: 20, background: 'rgba(0,212,255,0.08)', alignSelf: 'center' }} />

            {/* Nav items */}
            <nav className="flex flex-col items-center gap-2 flex-1">
                {NAV_ITEMS.map(({ path, label, icon }) => {
                    const active = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            title={label}
                            className="relative flex items-center justify-center w-10 h-10 rounded-xl"
                            style={{
                                background: active ? 'rgba(0,212,255,0.12)' : 'transparent',
                                border: active ? '1px solid rgba(0,212,255,0.3)' : '1px solid transparent',
                                color: active ? '#00d4ff' : 'rgba(100,116,139,0.7)',
                                boxShadow: active ? '0 0 12px rgba(0,212,255,0.15)' : 'none',
                                transition: 'all 0.25s ease',
                            }}
                            onMouseEnter={e => {
                                if (!active) {
                                    e.currentTarget.style.color = 'rgba(0,212,255,0.7)';
                                    e.currentTarget.style.background = 'rgba(0,212,255,0.06)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!active) {
                                    e.currentTarget.style.color = 'rgba(100,116,139,0.7)';
                                    e.currentTarget.style.background = 'transparent';
                                }
                            }}
                        >
                            {/* Active indicator line */}
                            {active && (
                                <div style={{
                                    position: 'absolute', left: -8, top: '50%',
                                    transform: 'translateY(-50%)',
                                    width: 3, height: 20, borderRadius: '0 2px 2px 0',
                                    background: '#00d4ff',
                                    boxShadow: '0 0 8px #00d4ff',
                                }} />
                            )}
                            {icon}
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom status dot */}
            <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: '#00ffb3',
                boxShadow: '0 0 8px #00ffb3',
                animation: 'sdaPulse 2s ease-in-out infinite',
            }} />
        </div>
    );
};

export default Sidebar;
