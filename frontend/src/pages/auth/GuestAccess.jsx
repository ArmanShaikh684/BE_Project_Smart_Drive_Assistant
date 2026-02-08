import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const GuestAccess = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
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

    const limitations = [
        'Read-only access to driver data',
        'Generic dashboard view',
        'Preferences not saved',
        'Alert history disabled',
    ];

    const handleContinue = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await api.guestLogin();
            if (response.success && response.driver) {
                login(response.driver);
                navigate('/dashboard');
            } else {
                setError(response.error || 'Unable to start guest session');
            }
        } catch (err) {
            setError('Connection failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-blue-500/30">
            {/* Dynamic Background - Softer Colors */}
            <div
                className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out"
                style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
            >
                <div className="absolute top-[-10%] left-[20%] w-[600px] h-[600px] bg-slate-800/20 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[20%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>

            <div className="max-w-md w-full z-10 relative">
                {/* Header */}
                <div className="mb-8 text-center space-y-3">
                    <div className="inline-flex items-center justify-center p-3 bg-white/5 rounded-2xl mb-2 backdrop-blur-sm border border-white/5 shadow-lg">
                        <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                        Guest Access
                    </h2>
                    <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
                        Explore the SDA.OS functionality. Some data saving features are disabled in this mode.
                    </p>
                </div>

                {/* Glassmorphic Panel */}
                <div className="relative bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl overflow-hidden">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500/10 rounded-lg p-3 text-center animate-[fadeIn_0.3s_ease-out]">
                            <p className="text-xs text-red-300">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Session Info */}
                        <div className="bg-white/5 border border-white/5 rounded-xl p-5">
                            <h3 className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-3">
                                SESSION FEATURES
                            </h3>
                            <ul className="space-y-2.5">
                                {limitations.map((limitation, index) => (
                                    <li key={index} className="flex items-center gap-3 text-sm text-gray-400">
                                        <div className="w-1.5 h-1.5 bg-blue-500/50 rounded-full"></div>
                                        <span>{limitation}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Actions */}
                        <div className="space-y-3">
                            <button
                                onClick={handleContinue}
                                disabled={isLoading}
                                className={`w-full relative group overflow-hidden rounded-xl p-0.5 transition-all duration-300 ${isLoading ? 'opacity-70 cursor-wait' : 'hover:scale-[1.02]'}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative h-full w-full rounded-[10px] py-3.5 flex items-center justify-center space-x-2 transition-colors duration-300">
                                    {isLoading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span className="text-sm font-medium text-white">Starting Session...</span>
                                        </div>
                                    ) : (
                                        <span className="text-sm font-bold text-white tracking-wide">Continue as Guest</span>
                                    )}
                                </div>
                            </button>

                            <button
                                onClick={() => navigate('/auth/register')}
                                className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-sm font-medium text-gray-300 hover:text-white transition-all duration-200"
                            >
                                Register Full Account
                            </button>

                            <button
                                onClick={() => navigate('/')}
                                className="w-full py-2 text-xs text-gray-500 hover:text-gray-400 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default GuestAccess;
