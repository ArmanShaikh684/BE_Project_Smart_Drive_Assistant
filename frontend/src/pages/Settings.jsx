import React, { useState, useRef } from 'react'; // FIX 1: Removed unused useEffect
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import NeonButton from '../components/NeonButton';
import BackgroundWrapper from '../components/BackgroundWrapper';

const Settings = () => {
    const { driver, login } = useAuth();
    const navigate = useNavigate();

    const [contacts, setContacts] = useState(driver?.trusted_contacts || {});
    const [tempName, setTempName] = useState('');
    const [tempNum, setTempNum] = useState('');

    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState(null);

    // Face Scan State
    const [isScanning, setIsScanning] = useState(false);
    const [scanStatus, setScanStatus] = useState('');
    const pollIntervalRef = useRef(null);

    // SECURITY CHECK: Kick out Commercial Drivers immediately!
    if (driver?.driver_type === 'Commercial') {
        return (
            <BackgroundWrapper>
                <div className="flex flex-col items-center justify-center text-center p-10 bg-red-900/20 border border-red-500/50 rounded-3xl max-w-lg z-10 relative">
                    <div className="text-6xl mb-4">🔒</div>
                    <h1 className="text-2xl font-black text-red-500 uppercase tracking-widest mb-4 font-monoH">Access Denied</h1>
                    <p className="text-gray-300">
                        You are logged in as a <strong>Commercial Driver</strong>. Your emergency contacts and security settings are strictly managed by your Fleet Administrator.
                    </p>
                    <NeonButton onClick={() => navigate('/dashboard')} className="mt-8">Return to Dashboard</NeonButton>
                </div>
            </BackgroundWrapper>
        );
    }

    const handleAddContact = () => {
        if (!tempName || !tempNum) return;
        const cleanNum = tempNum.replace(/\D/g, '');
        if (cleanNum.length !== 10) {
            setMessage({ type: 'error', text: "Phone must be exactly 10 digits." });
            return;
        }
        const twilioFormatted = `whatsapp:+91${cleanNum}`;
        setContacts(prev => ({ ...prev, [twilioFormatted]: tempName }));
        setTempName('');
        setTempNum('');
        setMessage(null);
    };

    const handleRemoveContact = (key) => {
        setContacts(prev => {
            const copy = { ...prev };
            delete copy[key];
            return copy;
        });
    };

    const saveContacts = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            const res = await authAPI.updateContacts(driver.id, contacts);
            if (res.success) {
                setMessage({ type: 'success', text: "Contacts updated successfully!" });
                login({ ...driver, trusted_contacts: contacts });
            } else {
                setMessage({ type: 'error', text: "Failed to update." });
            }
        } catch (e) {
            console.error("Error saving contacts:", e); // FIX 2: Logged the error
            setMessage({ type: 'error', text: "Network error." });
        }
        setIsSaving(false);
    };

    const startFaceUpdate = async () => {
        setIsScanning(true);
        setScanStatus("Waking up camera...");

        // Format driver name to ID (e.g. "Arman Shaikh" -> "arman_shaikh")
        const driverId = driver.name.toLowerCase().replace(/ /g, '_');

        try {
            const res = await authAPI.updateFace(driverId);
            if (res.success) {
                pollScanStatus(res.session_id);
            } else {
                setScanStatus("Error starting scanner.");
            }
        } catch (e) {
            console.error("Error starting face update:", e); // FIX 3: Logged the error
            setScanStatus("Network error.");
        }
    };

    const pollScanStatus = (sessionId) => {
        pollIntervalRef.current = setInterval(async () => {
            const res = await authAPI.checkFaceStatus(sessionId);
            if (res.success) {
                setScanStatus(res.message);
                if (res.status === 'success' || res.status === 'failed' || res.status === 'error') {
                    clearInterval(pollIntervalRef.current);
                    setTimeout(() => setIsScanning(false), 3000);
                }
            }
        }, 1000);
    };

    return (
        <BackgroundWrapper>
            <button onClick={() => navigate('/dashboard')} className="fixed top-8 left-8 text-2xl font-black text-cyan-500 z-50">← Back</button>

            <div className="flex flex-col gap-6 w-full max-w-xl bg-[#0d131a]/80 backdrop-blur-xl p-8 rounded-3xl border border-cyan-800 shadow-2xl relative z-10 my-10">
                <h1 className="text-3xl font-black text-white uppercase tracking-widest font-monoH border-b border-white/10 pb-4">Profile Settings</h1>

                {message && (
                    <div className={`p-4 rounded-xl font-bold text-center ${message.type === 'success' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        {message.text}
                    </div>
                )}

                {/* 1. CONTACTS SECTION */}
                <div>
                    <h2 className="text-cyan-400 uppercase tracking-widest text-sm font-bold mb-4">Edit Trusted Contacts</h2>

                    <div className="flex flex-col gap-2 mb-4">
                        {Object.entries(contacts).map(([number, name]) => (
                            <div key={number} className="flex justify-between items-center bg-black/50 border border-gray-700 p-3 rounded-lg">
                                <span className="text-white font-medium">{name} <span className="text-gray-500 text-sm ml-2">({number.replace('whatsapp:+91', '')})</span></span>
                                <button type="button" onClick={() => handleRemoveContact(number)} className="text-red-500 font-bold text-lg">✕</button>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2 mb-4">
                        <input type="text" placeholder="Name" value={tempName} onChange={(e) => setTempName(e.target.value)} className="w-1/3 bg-black/50 border border-gray-700 text-white p-3 rounded-xl" />
                        <input type="text" placeholder="10-Digit Phone" value={tempNum} onChange={(e) => setTempNum(e.target.value)} className="w-1/2 bg-black/50 border border-gray-700 text-white p-3 rounded-xl" />
                        <button type="button" onClick={handleAddContact} className="w-1/6 bg-gray-800 hover:bg-gray-700 text-white font-bold rounded-xl">Add</button>
                    </div>

                    <NeonButton onClick={saveContacts} disabled={isSaving} fullWidth>{isSaving ? 'Saving...' : 'Save Contacts'}</NeonButton>
                </div>

                {/* 2. FACE UPDATE SECTION */}
                <div className="mt-4 pt-6 border-t border-white/10">
                    <h2 className="text-cyan-400 uppercase tracking-widest text-sm font-bold mb-4">Update Face ID</h2>

                    {isScanning ? (
                        <div className="bg-black/50 p-6 rounded-2xl text-center border border-cyan-500/50">
                            <div className="text-4xl animate-pulse mb-2">📸</div>
                            <p className="text-cyan-300 font-mono font-bold tracking-widest">{scanStatus}</p>
                            <img src="http://localhost:5000/video-feed" alt="Scan Stream" className="mt-4 rounded-xl border border-white/10 w-full object-cover" />
                        </div>
                    ) : (
                        <button
                            onClick={startFaceUpdate}
                            className="w-full bg-cyan-900/30 hover:bg-cyan-800/50 border border-cyan-500 text-cyan-400 font-bold p-4 rounded-xl tracking-widest uppercase transition-all"
                        >
                            Retake Face Scan
                        </button>
                    )}
                </div>

            </div>
        </BackgroundWrapper>
    );
};

export default Settings;