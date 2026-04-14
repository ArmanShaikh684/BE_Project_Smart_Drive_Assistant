import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../../services/api';
import NeonButton from "../../components/NeonButton";
import AnimatedTextLink from "../../components/AnimatedTextLink";
import BackgroundWrapper from "../../components/BackgroundWrapper";

const RegisterDriver = () => {
    const navigate = useNavigate();

    // Step Management: 1 = Form, 2 = Face Capture, 3 = Success
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const pollIntervalRef = useRef(null);

    // Form Data State
    const [formData, setFormData] = useState({
        driver_type: 'Private',
        name: '',
        password: '',
        emergency_contact_name: '',
        emergency_contact_number: '',
        email_receiver: ''
    });

    // --- Dynamic Trusted Contacts State ---
    const [trustedContacts, setTrustedContacts] = useState({});
    const [tempContactName, setTempContactName] = useState('');
    const [tempContactNumber, setTempContactNumber] = useState('');

    // Face Capture State
    const [captureStatus, setCaptureStatus] = useState('Initializing camera...');

    // Handle Text Input Changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // --- Trusted Contacts Logic ---
    const handleAddTrustedContact = () => {
        if (!tempContactName || !tempContactNumber) return;

        // Clean the number (remove spaces, letters, etc.)
        const cleanNum = tempContactNumber.replace(/\D/g, '');
        if (cleanNum.length !== 10) {
            setError("Trusted contact number must be exactly 10 digits.");
            return;
        }

        // Auto-format for Twilio
        const twilioFormattedNumber = `whatsapp:+91${cleanNum}`;

        setTrustedContacts(prev => ({
            ...prev,
            [twilioFormattedNumber]: tempContactName
        }));

        // Clear the mini-form
        setTempContactName('');
        setTempContactNumber('');
        setError(null);
    };

    const handleRemoveContact = (keyToRemove) => {
        setTrustedContacts(prev => {
            const copy = { ...prev };
            delete copy[keyToRemove];
            return copy;
        });
    };


    // --- STEP 1: Submit Form Data to Database ---
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        // Basic Validation (Dynamic based on driver type)
        if (!formData.name || !formData.password) {
            setError('Please fill in Name and PIN/Password.');
            return;
        }

        if (formData.driver_type === 'Private') {
            if (!formData.emergency_contact_name || !formData.emergency_contact_number) {
                setError('Private drivers must provide an emergency contact.');
                return;
            }
        }

        setIsLoading(true);
        try {
            // If Commercial, we wipe the manual contacts and let the backend handle it
            const payload = {
                ...formData,
                trusted_contacts: formData.driver_type === 'Private' ? trustedContacts : {}
            };

            const response = await authAPI.registerDriver(payload);

            if (response.success) {
                setStep(2); // Move to Face Capture Step UI
                await startFaceCapture(response.driver_id);
            } else {
                setError(response.error || 'Failed to save driver details.');
            }
        } catch (err) {
            console.error("Form Submission Error:", err);
            setError('Cannot connect to the AI Server.');
        } finally {
            setIsLoading(false);
        }
    };

    // --- STEP 2: Trigger Backend Face Capture ---
    const startFaceCapture = async (id) => {
        try {
            const res = await fetch('http://localhost:5000/api/face/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ driver_id: id })
            });
            const data = await res.json();

            if (data.success) {
                pollCaptureStatus(data['session_id']);
            } else {
                setError(data.error || 'Failed to start face capture.');
            }
        } catch (err) {
            console.error("Camera Start Error:", err);
            setError('Lost connection to camera server.');
        }
    };

    // Poll the status of the face capture
    const pollCaptureStatus = (sessionId) => {
        pollIntervalRef.current = setInterval(async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/face/register/status/${sessionId}`);
                const data = await res.json();

                if (data.success) {
                    setCaptureStatus(data.message);

                    if (data.status === 'success') {
                        clearInterval(pollIntervalRef.current);
                        setTimeout(() => setStep(3), 1500); // Move to Success Step
                    } else if (data.status === 'failed' || data.status === 'error') {
                        clearInterval(pollIntervalRef.current);
                        setError(data.message || 'Face capture failed. Please try again.');
                    }
                }
            } catch (err) {
                clearInterval(pollIntervalRef.current);
                console.error("Polling Error:", err);
                setError('Polling error.');
            }
        }, 1000);
    };

    // Cleanup polling if component unmounts
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        };
    }, []);

    return (
        <BackgroundWrapper>

            {/* Cancel Button */}
            {step === 1 && (
                <AnimatedTextLink
                    onClick={() => navigate('/')}
                    className="fixed top-8 left-8 md:top-12 md:left-12 text-2xl md:text-3xl font-extrabold tracking-widest drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] z-50 transition-transform duration-300 hover:scale-110"
                >
                    ← Cancel
                </AnimatedTextLink>
            )}

            {/* UPGRADED: Header */}
            <div className="text-center mb-10 mt-8 relative z-10">
                <h1
                    className="text-4xl md:text-5xl font-black uppercase text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] mb-2"
                    style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                    New Driver Setup
                </h1>
                <p
                    className="text-xl md:text-2xl uppercase font-medium drop-shadow-md text-gray-400"
                    style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.2em" }}
                >
                    {step === 1 ? 'Step 1: Driver Details' : step === 2 ? 'Step 2: Face Capture' : 'Registration Complete'}
                </p>
            </div>

            {/* Error Message */}
            {error && (
                <div className="w-full max-w-xl mb-6 bg-red-900/50 border border-red-500 text-red-400 p-4 rounded-lg text-center font-medium relative z-10">
                    {error}
                </div>
            )}

            {/* ================= STEP 1: THE FORM ================= */}
            {/* ================= STEP 1: THE FORM ================= */}
            {step === 1 && (
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-6 w-full max-w-xl bg-[#0d131a] p-8 rounded-3xl border border-gray-800 shadow-2xl mb-10 relative z-10">

                    <div className="flex flex-col gap-2">
                        <label className="text-gray-400 uppercase tracking-widest text-sm font-bold">Driver Type</label>
                        <select
                            name="driver_type"
                            value={formData.driver_type}
                            onChange={handleChange}
                            className="bg-black border border-gray-700 text-white text-xl p-4 rounded-xl focus:outline-none focus:border-cyan-500"
                        >
                            <option value="Private">Private (Family/Friends)</option>
                            <option value="Commercial">Commercial (Fleet/Employee)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-400 uppercase tracking-widest text-sm font-bold">Full Name *</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="bg-black border border-gray-700 text-white text-xl p-4 rounded-xl focus:outline-none focus:border-cyan-500" />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-gray-400 uppercase tracking-widest text-sm font-bold">PIN / Password *</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="bg-black border border-gray-700 text-white text-xl p-4 rounded-xl focus:outline-none focus:border-cyan-500 tracking-widest" />
                        </div>
                    </div>

                    {/* DYNAMIC RENDER: Only show these if Private Mode is selected */}
                    {formData.driver_type === 'Private' ? (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-400 uppercase tracking-widest text-sm font-bold">Emergency Contact *</label>
                                    <input type="text" name="emergency_contact_name" placeholder="Name" value={formData.emergency_contact_name} onChange={handleChange} required className="bg-black border border-gray-700 text-white text-xl p-4 rounded-xl focus:outline-none focus:border-cyan-500" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-gray-400 uppercase tracking-widest text-sm font-bold">Emergency Phone *</label>
                                    <input type="text" name="emergency_contact_number" placeholder="e.g. 1234567890" value={formData.emergency_contact_number} onChange={handleChange} required className="bg-black border border-gray-700 text-white text-xl p-4 rounded-xl focus:outline-none focus:border-cyan-500" />
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-gray-400 uppercase tracking-widest text-sm font-bold">Email for Reports</label>
                                <input type="email" name="email_receiver" value={formData.email_receiver} onChange={handleChange} className="bg-black border border-gray-700 text-white text-xl p-4 rounded-xl focus:outline-none focus:border-cyan-500" />
                            </div>

                            <div className="mt-4 pt-6 border-t border-gray-800 flex flex-col gap-4">
                                <div>
                                    <label className="text-cyan-400 uppercase tracking-widest text-sm font-bold block mb-1">Trusted WhatsApp Contacts</label>
                                    <p className="text-gray-500 text-sm mb-4">Add people allowed to send WhatsApp messages to the car. (Optional)</p>
                                </div>

                                {Object.entries(trustedContacts).length > 0 && (
                                    <div className="flex flex-col gap-2 mb-2">
                                        {Object.entries(trustedContacts).map(([number, name]) => (
                                            <div key={number} className="flex justify-between items-center bg-black border border-gray-700 p-3 rounded-lg">
                                                <span className="text-white font-medium">{name} <span className="text-gray-500 text-sm ml-2">({number.replace('whatsapp:+91', '')})</span></span>
                                                <button type="button" onClick={() => handleRemoveContact(number)} className="text-red-500 hover:text-red-400 font-bold text-lg">✕</button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <input type="text" placeholder="Name" value={tempContactName} onChange={(e) => setTempContactName(e.target.value)} className="w-1/3 bg-black border border-gray-700 text-white p-3 rounded-xl focus:outline-none focus:border-cyan-500" />
                                    <input type="text" placeholder="10-Digit Phone" value={tempContactNumber} onChange={(e) => setTempContactNumber(e.target.value)} className="w-1/2 bg-black border border-gray-700 text-white p-3 rounded-xl focus:outline-none focus:border-cyan-500" />
                                    <button type="button" onClick={handleAddTrustedContact} className="w-1/6 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl transition-colors">Add</button>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* COMMERCIAL MODE BANNER */
                        <div className="mt-2 bg-cyan-900/20 border border-cyan-700/50 p-5 rounded-xl text-cyan-400 text-sm tracking-wide leading-relaxed">
                            <span className="font-bold uppercase block mb-2 text-cyan-300">🔒 Commercial Mode Active</span>
                            Emergency alerts, dashcam footage, and trusted contacts are automatically locked and routed to the registered <strong>Fleet Manager / Car Owner</strong>.
                        </div>
                    )}

                    <NeonButton type="submit" disabled={isLoading} fullWidth className="mt-4">
                        {isLoading ? 'Saving...' : 'Next: Capture Face'}
                    </NeonButton>
                </form>
            )}


            {/* ================= STEP 2: FACE CAPTURE ================= */}
            {step === 2 && (
                <div className="flex flex-col items-center justify-center gap-8 w-full max-w-xl bg-[#0d131a] p-10 rounded-3xl border border-cyan-800 shadow-[0_0_40px_rgba(6,182,212,0.2)] relative z-10">
                    <div className="text-8xl animate-pulse">📸</div>
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-4">Look at the Camera</h2>
                        <p className="text-xl text-cyan-400 font-mono bg-black p-4 rounded-lg border border-gray-800">
                            {captureStatus}
                        </p>
                    </div>
                    <p className="text-gray-400 text-center max-w-sm">
                        Ensure your face is well-lit and clearly visible. The system will automatically save your profile once detected.
                    </p>
                </div>
            )}

            {/* ================= STEP 3: SUCCESS ================= */}
            {step === 3 && (
                <div className="flex flex-col items-center justify-center gap-8 w-full max-w-xl bg-[#0d131a] p-10 rounded-3xl border border-green-800 shadow-[0_0_40px_rgba(34,197,94,0.2)] text-center relative z-10">
                    <div className="text-8xl drop-shadow-[0_0_15px_rgba(34,197,94,0.5)]">✅</div>
                    <h2 className="text-4xl font-bold text-green-400 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(34,197,94,0.3)]">Registration Complete!</h2>
                    <p className="text-xl text-gray-300">
                        Welcome aboard, <span className="text-white font-bold">{formData.name}</span>.<br/>Your profile and facial ID are securely saved.
                    </p>
                    <NeonButton onClick={() => navigate('/')} fullWidth className="mt-4">
                        Return to Login
                    </NeonButton>
                </div>
            )}

        </BackgroundWrapper>
    );
};

export default RegisterDriver;