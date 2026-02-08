import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const RegisterDriver = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const [formData, setFormData] = useState({
        name: '',
        email_receiver: '',
        phone: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        trusted_contacts: {},
        password: '',
        confirmPassword: ''
    });

    // Verification state for Step 2
    const [newContactName, setNewContactName] = useState('');
    const [newContactNumber, setNewContactNumber] = useState('');

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
        setFormData(prev => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleAddContact = () => {
        if (!newContactName || !newContactNumber) {
            setError('Please provide both name and number');
            return;
        }
        setFormData(prev => ({
            ...prev,
            trusted_contacts: {
                ...prev.trusted_contacts,
                [newContactName]: newContactNumber
            }
        }));
        setNewContactName('');
        setNewContactNumber('');
        setError('');
    };

    const handleRemoveContact = (name) => {
        const updatedContacts = { ...formData.trusted_contacts };
        delete updatedContacts[name];
        setFormData(prev => ({ ...prev, trusted_contacts: updatedContacts }));
    };

    const validateStep = () => {
        setError('');
        if (step === 1) {
            if (!formData.name.trim()) return 'FULL NAME REQUIRED';
            if (!formData.email_receiver.trim()) return 'EMAIL ADDRESS REQUIRED';
            if (!formData.email_receiver.includes('@')) return 'INVALID EMAIL FORMAT';
        }
        if (step === 2) {
            if (!formData.emergency_contact_name.trim()) return 'EMERGENCY CONTACT NAME REQUIRED';
            if (!formData.emergency_contact_number.trim()) return 'EMERGENCY CONTACT NUMBER REQUIRED';
        }
        if (step === 3) {
            if (!formData.password) return 'PASSWORD REQUIRED';
            if (formData.password.length < 4) return 'PASSWORD TOO SHORT (MIN 4 CHARS)';
            if (formData.password !== formData.confirmPassword) return 'PASSWORDS DO NOT MATCH';
        }
        return null;
    };

    const handleNext = () => {
        const validationError = validateStep();
        if (validationError) {
            setError(validationError);
            return;
        }
        setStep(prev => prev + 1);
    };

    const handleBack = () => {
        setStep(prev => prev - 1);
        setError('');
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError('');
        try {
            const submissionData = { ...formData };
            delete submissionData.confirmPassword;
            const response = await api.register(submissionData);

            if (response.success) {
                navigate('/auth/password');
            } else {
                setError(response.error || 'REGISTRATION FAILED');
            }
        } catch (err) {
            setError(err.message || 'SYSTEM ERROR');
        } finally {
            setLoading(false);
        }
    };

    const stepsInfo = [
        { title: "IDENTITY", subtitle: "Personal Information" },
        { title: "CONTACTS", subtitle: "Emergency & Trusted" },
        { title: "SECURITY", subtitle: "Access Credentials" },
        { title: "VERIFY", subtitle: "Review & Confirm" }
    ];

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-violet-500/30">
            {/* Dynamic Background */}
            <div
                className="absolute inset-0 pointer-events-none transition-transform duration-100 ease-out"
                style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}
            >
                <div className="absolute top-[-10%] right-[20%] w-[600px] h-[600px] bg-violet-900/10 rounded-full blur-[120px] mix-blend-screen animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[20%] w-[500px] h-[500px] bg-indigo-900/20 rounded-full blur-[100px] mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                    backgroundSize: '40px 40px'
                }}
            ></div>

            <div className="max-w-3xl w-full z-10 relative">
                {/* Header & Back Nav */}
                <div className="mb-8 flex justify-between items-end">
                    <div className="space-y-2">
                        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-violet-900/20 border border-violet-500/20 backdrop-blur-sm mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse"></div>
                            <span className="text-[10px] font-mono text-violet-400 tracking-[0.2em] uppercase">SYSTEM ONBOARDING</span>
                        </div>
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-violet-100 to-slate-400 tracking-tight">
                            DRIVER ENROLLMENT
                        </h2>
                        <p className="text-xs text-gray-400 font-mono tracking-wide uppercase">
                            Step {step} of 4 · {stepsInfo[step - 1].title}: {stepsInfo[step - 1].subtitle}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-[10px] font-mono text-gray-500 hover:text-white flex items-center gap-2 transition-colors uppercase tracking-widest"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        CANCEL
                    </button>
                </div>

                {/* Glassmorphic Panel */}
                <div className="relative bg-slate-900/40 border border-white/10 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl">
                    {/* Progress Bar Top */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
                        <div
                            className="h-full bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-500 ease-out"
                            style={{ width: `${(step / 4) * 100}%` }}
                        ></div>
                    </div>

                    <div className="p-8 md:p-10">
                        {/* Error Display */}
                        {error && (
                            <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start space-x-3 backdrop-blur-sm animate-[fadeIn_0.3s_ease-out]">
                                <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span className="text-xs font-mono text-red-400 mt-0.5">{error}</span>
                            </div>
                        )}

                        <div className="min-h-[300px]">
                            {/* Step 1: Basic Info */}
                            {step === 1 && (
                                <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                                    <h3 className="text-lg font-bold text-white mb-6 font-mono tracking-tight">IDENTITY_DATA</h3>
                                    <div className="grid grid-cols-1 gap-6">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono text-violet-300/70 tracking-widest uppercase ml-1">Full Name</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-mono text-sm"
                                                placeholder="ENTER FULL NAME"
                                                autoFocus
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono text-violet-300/70 tracking-widest uppercase ml-1">Email Address</label>
                                            <input
                                                type="email"
                                                name="email_receiver"
                                                value={formData.email_receiver}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-mono text-sm"
                                                placeholder="EMAIL@DOMAIN.COM"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono text-violet-300/70 tracking-widest uppercase ml-1">Phone Number (Optional)</label>
                                            <input
                                                type="tel"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-mono text-sm"
                                                placeholder="+XX XXX XXX XXXX"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Contacts */}
                            {step === 2 && (
                                <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
                                    <div>
                                        <h3 className="text-lg font-bold text-white mb-4 font-mono tracking-tight flex items-center justify-between">
                                            <span>EMERGENCY_CONTACT</span>
                                            <span className="text-[10px] text-red-400 font-mono bg-red-900/20 px-2 py-1 rounded">REQUIRED</span>
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono text-gray-500 tracking-widest uppercase ml-1">Name</label>
                                                <input
                                                    type="text"
                                                    name="emergency_contact_name"
                                                    value={formData.emergency_contact_name}
                                                    onChange={handleChange}
                                                    className="block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-mono text-sm"
                                                    placeholder="NAME"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-mono text-gray-500 tracking-widest uppercase ml-1">Number</label>
                                                <input
                                                    type="tel"
                                                    name="emergency_contact_number"
                                                    value={formData.emergency_contact_number}
                                                    onChange={handleChange}
                                                    className="block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-mono text-sm"
                                                    placeholder="NUMBER"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border-t border-white/5 pt-6">
                                        <h3 className="text-lg font-bold text-white mb-4 font-mono tracking-tight flex items-center justify-between">
                                            <span>TRUSTED_CONTACTS</span>
                                            <span className="text-[10px] text-gray-500 font-mono">OPTIONAL</span>
                                        </h3>

                                        {/* List */}
                                        <div className="space-y-2 mb-4">
                                            {Object.keys(formData.trusted_contacts).length === 0 && (
                                                <div className="text-center py-4 border border-dashed border-white/10 rounded-lg">
                                                    <p className="text-gray-500 text-xs font-mono">NO DATA ENTRIES</p>
                                                </div>
                                            )}
                                            {Object.entries(formData.trusted_contacts).map(([name, number]) => (
                                                <div key={name} className="flex justify-between items-center bg-white/5 border border-white/5 px-4 py-3 rounded-lg">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-white">{name}</span>
                                                        <span className="text-xs font-mono text-gray-400">{number}</span>
                                                    </div>
                                                    <button onClick={() => handleRemoveContact(name)} className="text-xs text-red-400 hover:text-red-300 font-mono tracking-wider">DELETE</button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Add New */}
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                placeholder="NAME"
                                                value={newContactName}
                                                onChange={(e) => setNewContactName(e.target.value)}
                                                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-violet-500/50"
                                            />
                                            <input
                                                type="tel"
                                                placeholder="NUMBER"
                                                value={newContactNumber}
                                                onChange={(e) => setNewContactNumber(e.target.value)}
                                                className="flex-1 px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-white text-sm font-mono focus:outline-none focus:border-violet-500/50"
                                            />
                                            <button
                                                onClick={handleAddContact}
                                                className="px-4 py-2 bg-violet-600/20 text-violet-300 border border-violet-500/30 rounded-lg text-xs font-mono hover:bg-violet-600/30 transition-colors"
                                            >
                                                ADD
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Security */}
                            {step === 3 && (
                                <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                                    <h3 className="text-lg font-bold text-white mb-6 font-mono tracking-tight">SET_CREDENTIALS</h3>
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono text-violet-300/70 tracking-widest uppercase ml-1">Create Password</label>
                                            <input
                                                type="password"
                                                name="password"
                                                value={formData.password}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-mono text-sm"
                                                placeholder="••••••••"
                                            />
                                            <p className="text-[10px] text-gray-500 font-mono text-right">MINIMUM 4 CHARACTERS</p>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-mono text-violet-300/70 tracking-widest uppercase ml-1">Confirm Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={formData.confirmPassword}
                                                onChange={handleChange}
                                                className="block w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-600 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/50 transition-all font-mono text-sm"
                                                placeholder="••••••••"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Step 4: Review */}
                            {step === 4 && (
                                <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
                                    <h3 className="text-lg font-bold text-white mb-6 font-mono tracking-tight">VERIFY_DATA</h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Full Identity</p>
                                            <p className="text-white font-medium">{formData.name}</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Communication</p>
                                            <p className="text-white font-medium">{formData.email_receiver}</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Emergency Link</p>
                                            <p className="text-white font-medium">{formData.emergency_contact_name}</p>
                                            <p className="text-xs text-gray-400 font-mono">{formData.emergency_contact_number}</p>
                                        </div>
                                        <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
                                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-1">Trusted Database</p>
                                            <p className="text-white font-medium">{Object.keys(formData.trusted_contacts).length} Entries</p>
                                        </div>
                                    </div>

                                    <div className="bg-violet-900/10 border border-violet-500/20 p-4 rounded-xl flex items-start gap-4">
                                        <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-violet-200 uppercase tracking-wide mb-1">System Notice</h4>
                                            <p className="text-xs text-violet-300/80 leading-relaxed">
                                                Face registration is handled in a separate module. After verification, access your driver profile to calibrate biometric data.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Controls */}
                        <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center">
                            {step > 1 ? (
                                <button
                                    onClick={handleBack}
                                    className="px-6 py-2 border border-white/10 rounded-lg text-gray-400 hover:text-white hover:border-white/30 transition-all text-xs font-mono tracking-widest"
                                >
                                    BACK
                                </button>
                            ) : (
                                <div></div>
                            )}

                            {step < 4 ? (
                                <button
                                    onClick={handleNext}
                                    className="group relative px-8 py-2 bg-white text-black font-bold rounded-lg overflow-hidden transition-all hover:scale-105"
                                >
                                    <span className="relative z-10 text-xs font-mono tracking-widest">NEXT PHASE</span>
                                    <div className="absolute inset-0 bg-violet-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`group relative px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold rounded-lg overflow-hidden transition-all hover:scale-[1.02] shadow-lg shadow-emerald-500/20 ${loading ? 'opacity-70 cursor-wait' : ''}`}
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span className="text-xs font-mono tracking-widest">PROCESSING...</span>
                                        </div>
                                    ) : (
                                        <span className="text-xs font-mono tracking-widest">CONFIRM & INITIALIZE</span>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default RegisterDriver;
