import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthHome = () => {
    const navigate = useNavigate();
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 20 - 10,
                y: (e.clientY / window.innerHeight) * 20 - 10,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const authOptions = [
        {
            id: 'face',
            title: 'FACE RECOGNITION',
            subtitle: 'PRIMARY AUTHENTICATION',
            description: 'Biometric scan initiated. Hands-free access.',
            icon: (
                <div className="relative">
                    <div className="absolute inset-0 bg-blue-500 blur-xl opacity-40 animate-pulse"></div>
                    <svg className="w-10 h-10 relative z-10 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.2-2.905.592-4.288m0 0l.092-.255a2 2 0 012.396-1.127l.142.062a2 2 0 011.088 2.22l-.123.708a2 2 0 001.071 2.223l.169.056a2 2 0 01.812 3.322l-.307.153a2 2 0 00-1.22 3.425l.183.18a2 2 0 01.164 2.508l-.208.56a2 2 0 00.325 2.155l.235.318a2 2 0 01.109 2.57l-.145.244a2 2 0 01-2.903.04l-.136-.082a2 2 0 00-1.92 0l-.136.082a2 2 0 01-2.903-.04l-.145-.244a2 2 0 01.109-2.57l.235-.318a2 2 0 00.325-2.155l-.208-.56a2 2 0 01.164-2.508l.183-.18a2 2 0 00-1.22-3.425l-.307-.153a2 2 0 01-.812-3.322l.169-.056a2 2 0 001.071-2.223l-.123-.708a2 2 0 011.088-2.22l.142-.062a2 2 0 012.396 1.127l.092.255" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4h4v4H4zM16 4h4v4h-4zM4 16h4v4H4zM16 16h4v4h-4z" />
                    </svg>
                </div>
            ),
            route: '/auth/face',
            accent: 'cyan',
            highlight: 'border-cyan-500/50 shadow-[0_0_30px_rgba(6,182,212,0.15)]',
            bgGradient: 'bg-gradient-to-br from-cyan-950/40 to-slate-900/80',
            primary: true,
        },
        {
            id: 'password',
            title: 'MANUAL LOGIN',
            subtitle: 'DRIVER ID & PIN',
            description: 'Standard credential access.',
            icon: (
                <svg className="w-8 h-8 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
            ),
            route: '/auth/password',
            accent: 'emerald',
            highlight: 'border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)]',
            bgGradient: 'bg-gradient-to-br from-emerald-950/30 to-slate-900/60',
        },
        {
            id: 'register',
            title: 'REGISTRATION',
            subtitle: 'NEW PROFILE',
            description: 'Onboard new personnel.',
            icon: (
                <svg className="w-8 h-8 text-violet-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
            ),
            route: '/auth/register',
            accent: 'violet',
            highlight: 'border-violet-500/30 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)]',
            bgGradient: 'bg-gradient-to-br from-violet-950/30 to-slate-900/60',
        },
        {
            id: 'guest',
            title: 'GUEST MODE',
            subtitle: 'LIMITED ACCESS',
            description: 'Temporary diagnostic session.',
            icon: (
                <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            ),
            route: '/auth/guest',
            accent: 'slate',
            highlight: 'border-slate-500/30 hover:shadow-[0_0_20px_rgba(203,213,225,0.1)]',
            bgGradient: 'bg-gradient-to-br from-slate-900/40 to-gray-900/60',
        },
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-cyan-500/30">
            {/* Dynamic Background Elements */}
            <div
                className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out"
                style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
            >
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Grid Overlay for Tech Feel */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>

            <div className="max-w-7xl w-full z-10 relative">
                {/* HUD Header */}
                <div className="flex justify-between items-end mb-12 border-b border-white/10 pb-6">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <div className="h-2 w-2 bg-cyan-400 rounded-full animate-ping"></div>
                            <span className="text-xs font-mono text-cyan-400 tracking-[0.2em] uppercase">System Online</span>
                        </div>
                        <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-slate-400 font-display">
                            SDA<span className="text-cyan-500">.</span>OS
                        </h1>
                        <p className="text-sm md:text-base text-gray-400 font-mono tracking-wide uppercase">
                            Advanced Driver Assistance System
                        </p>
                    </div>
                    <div className="hidden md:block text-right">
                        <div className="text-xs text-gray-500 font-mono">SECURE GATEWAY v2.4.0</div>
                        <div className="text-xs text-gray-600 font-mono mt-1">ID: {Math.random().toString(36).substr(2, 9).toUpperCase()}</div>
                    </div>
                </div>

                {/* Main Auth Grid */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Primary Option (Face Auth) - Spans full width on mobile, larger on desktop */}
                    <div className="md:col-span-8">
                        {authOptions.filter(o => o.primary).map(option => (
                            <button
                                key={option.id}
                                onClick={() => navigate(option.route)}
                                className={`group relative w-full h-full min-h-[300px] overflow-hidden rounded-xl border border-white/10 ${option.bgGradient} ${option.highlight} transition-all duration-500 hover:scale-[1.01] hover:border-cyan-400/50 backdrop-blur-md flex flex-col justify-between p-8 text-left`}
                            >
                                {/* Active Scan Line Animation */}
                                <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 animate-[scan_2s_ease-in-out_infinite]"></div>

                                <div className="flex justify-between items-start">
                                    <div className="p-3 bg-white/5 rounded-lg border border-white/10 group-hover:bg-cyan-900/20 group-hover:border-cyan-500/30 transition-colors">
                                        {option.icon}
                                    </div>
                                    <div className="flex items-center space-x-2 opacity-50 group-hover:opacity-100 transition-opacity">
                                        <span className="text-xs font-mono tracking-widest text-cyan-300">BIOMETRIC_READY</span>
                                        <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                                    </div>
                                </div>

                                <div className="mt-8 space-y-2">
                                    <h2 className="text-4xl font-bold text-white tracking-tight group-hover:text-cyan-50 transition-colors">
                                        {option.title}
                                    </h2>
                                    <div className="h-0.5 w-12 bg-cyan-500/50 group-hover:w-24 transition-all duration-500"></div>
                                    <p className="text-cyan-100/70 text-lg max-w-md font-light">
                                        {option.description}
                                    </p>
                                </div>

                                <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-[-10px] group-hover:translate-x-0">
                                    <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Secondary Options Grid */}
                    <div className="md:col-span-4 flex flex-col gap-4">
                        {authOptions.filter(o => !o.primary).map(option => (
                            <button
                                key={option.id}
                                onClick={() => navigate(option.route)}
                                className={`group relative w-full flex-1 min-h-[140px] overflow-hidden rounded-xl border border-white/5 ${option.bgGradient} ${option.highlight} transition-all duration-300 hover:translate-x-1 hover:bg-white/5 backdrop-blur-sm p-6 text-left`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className="p-2 bg-black/40 rounded-lg group-hover:scale-110 transition-transform duration-300">
                                        {option.icon}
                                    </div>
                                    <div>
                                        <div className="text-xs font-mono text-gray-500 tracking-wider mb-1">{option.subtitle}</div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-gray-200">{option.title}</h3>
                                    </div>
                                </div>

                                {/* Hover Corner Accent */}
                                <div className={`absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-transparent border-r-transparent group-hover:border-r-${option.accent}-400/50 transition-all duration-300`}></div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Footer Status Bar */}
                <div className="mt-12 flex justify-between items-center border-t border-white/5 pt-6 text-xs font-mono text-gray-600">
                    <div className="flex space-x-6">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            SERVER: ACTIVE
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                            DB: CONNECTED
                        </span>
                    </div>
                    <div>SECURE_ENCLAVE_ENFORCED</div>
                </div>
            </div>

            <style>{`
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default AuthHome;
