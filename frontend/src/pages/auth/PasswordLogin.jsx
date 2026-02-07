import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const PasswordLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        driverName: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [apiError, setApiError] = useState('');
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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
        if (apiError) {
            setApiError('');
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.driverName.trim()) {
            newErrors.driverName = 'DRIVER ID REQUIRED';
        }
        if (!formData.password) {
            newErrors.password = 'ACCESS CODE REQUIRED';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsLoading(true);
        try {
            const response = await api.login(formData.driverName, formData.password);
            if (response.success && response.driver) {
                login(response.driver);
                navigate('/dashboard');
            } else {
                setApiError(response.error || 'AUTHENTICATION FAILED');
            }
        } catch (error) {
            if (error.message.includes('Failed to fetch')) {
                setApiError('SERVER CONNECTION LOST');
            } else if (error.message.includes('401')) {
                setApiError('INVALID CREDENTIALS');
            } else {
                setApiError('SYSTEM ERROR: ' + error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-emerald-500/30">
            {/* Dynamic Background */}
            <div
                className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out"
                style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
            >
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-slate-900/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
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
                <div className="mb-8 text-center space-y-2">
                    <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-900/20 border border-emerald-500/20 backdrop-blur-sm mb-4">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-mono text-emerald-400 tracking-[0.2em]">MANUAL AUTH MODE</span>
                    </div>
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-emerald-100 to-slate-400 tracking-tight">
                        CREDENTIAL ACCESS
                    </h2>
                    <p className="text-xs text-gray-400 font-mono tracking-wide uppercase">
                        Secure Driver Verification System
                    </p>
                </div>

                {/* Glassmorphic Console Panel */}
                <div className="relative bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl overflow-hidden">
                    {/* Top Accent Line */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Error Message */}
                        {apiError && (
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start space-x-3 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
                                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <p className="text-xs font-bold text-red-400 font-mono">ACCESS DENIED</p>
                                    <p className="text-xs text-red-300/80">{apiError}</p>
                                </div>
                            </div>
                        )}

                        {/* Driver Name Input */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-mono text-emerald-300/70 tracking-widest uppercase ml-1">Driver Identity</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className={`w-5 h-5 transition-colors duration-300 ${errors.driverName ? 'text-red-400' : 'text-gray-500 group-focus-within:text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    name="driverName"
                                    value={formData.driverName}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 bg-black/40 border border-white/5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:border-transparent transition-all duration-300 font-mono text-sm ${errors.driverName
                                            ? 'border-red-500/50 focus:ring-red-500/50'
                                            : 'focus:border-emerald-500/50 focus:ring-emerald-500/50 hover:border-white/10'
                                        }`}
                                    placeholder="ENTER DRIVER ID"
                                    autoComplete="username"
                                />
                            </div>
                            {errors.driverName && <p className="text-[10px] text-red-400 font-mono ml-1">{errors.driverName}</p>}
                        </div>

                        {/* Password Input */}
                        <div className="space-y-1">
                            <label className="text-[10px] font-mono text-emerald-300/70 tracking-widest uppercase ml-1">Security Code</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className={`w-5 h-5 transition-colors duration-300 ${errors.password ? 'text-red-400' : 'text-gray-500 group-focus-within:text-emerald-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className={`block w-full pl-10 pr-3 py-3 bg-black/40 border border-white/5 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:border-transparent transition-all duration-300 font-mono text-sm ${errors.password
                                            ? 'border-red-500/50 focus:ring-red-500/50'
                                            : 'focus:border-emerald-500/50 focus:ring-emerald-500/50 hover:border-white/10'
                                        }`}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                            {errors.password && <p className="text-[10px] text-red-400 font-mono ml-1">{errors.password}</p>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full relative group overflow-hidden rounded-lg p-0.5 transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <div className="relative bg-emerald-950/50 h-full w-full rounded-[6px] py-3.5 px-4 flex items-center justify-center space-x-2 backdrop-blur-sm group-hover:bg-transparent transition-colors duration-300">
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-emerald-300 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs font-bold font-mono tracking-widest text-emerald-100">VERIFYING...</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xs font-bold font-mono tracking-widest text-white group-hover:text-white">AUTHENTICATE SYSTEM ACCESSS</span>
                                        <svg className="w-4 h-4 text-emerald-300 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </>
                                )}
                            </div>
                        </button>
                    </form>

                    {/* Secondary Actions */}
                    <div className="mt-8 flex items-center justify-between text-[10px] font-mono text-gray-500 border-t border-white/5 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate('/auth/face')}
                            className="flex items-center space-x-1 hover:text-emerald-400 transition-colors duration-300"
                        >
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>BACK TO BIOMETRICS</span>
                        </button>

                        <button
                            type="button"
                            onClick={() => navigate('/auth/register')}
                            className="hover:text-emerald-400 transition-colors duration-300"
                        >
                            NEW DRIVER REGISTRATION
                        </button>
                    </div>
                </div>

                {/* Footer System Info */}
                <div className="mt-8 text-center">
                    <div className="text-[10px] text-gray-600 font-mono">
                        SECURE CONNECTION ESTABLISHED • TLS 1.3
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default PasswordLogin;
