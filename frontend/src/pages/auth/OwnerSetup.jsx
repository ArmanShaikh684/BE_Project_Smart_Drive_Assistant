import React, { useState } from 'react';
import NeonButton from "../../components/NeonButton";
import BackgroundWrapper from "../../components/BackgroundWrapper";

const OwnerSetup = ({ onComplete }) => {
    const [formData, setFormData] = useState({
        owner_name: '',
        owner_phone: '',
        owner_email: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!formData.owner_name.trim() || !formData.owner_phone.trim()) {
            setError("Name and Phone Number are required.");
            return;
        }

        setIsLoading(true);
        try {
            // Call the port 5000 API server
            const response = await fetch('http://127.0.0.1:5000/api/system/setup-owner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (data.success) {
                onComplete(); // Tells App.jsx to unlock the rest of the app!
            } else {
                setError(data.error || "Failed to save configuration.");
            }
        } catch (err) {
            console.error("Setup error:", err);
            setError("Network error. Make sure the API server is running on port 5000.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BackgroundWrapper>
            <div className="flex flex-col items-center justify-center w-full max-w-lg bg-[#0d131a]/80 backdrop-blur-xl p-8 md:p-10 rounded-3xl border-2 border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative z-10">

                <div className="text-6xl mb-4 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">👑</div>
                <h1 className="text-3xl font-black text-white uppercase tracking-[0.2em] mb-2 font-monoH text-center">
                    System Initialization
                </h1>
                <p className="text-cyan-400 text-sm font-bold uppercase tracking-widest mb-8 text-center">
                    Register Master Car Owner
                </p>

                {error && (
                    <div className="w-full bg-red-900/50 border border-red-500 text-red-400 p-3 rounded-lg font-medium text-center mb-6">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">

                    <div className="flex flex-col gap-1">
                        <label className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Owner Full Name *</label>
                        <input
                            type="text"
                            name="owner_name"
                            value={formData.owner_name}
                            onChange={handleChange}
                            placeholder="e.g. Tony Stark"
                            className="bg-black/50 border border-white/10 text-white text-lg p-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-black transition-all"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Emergency Phone (WhatsApp) *</label>
                        <input
                            type="text"
                            name="owner_phone"
                            value={formData.owner_phone}
                            onChange={handleChange}
                            placeholder="e.g. 9876543210"
                            className="bg-black/50 border border-white/10 text-white text-lg p-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-black transition-all"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-gray-400 uppercase tracking-widest text-[10px] font-bold">Email (For Dashcam Evidence)</label>
                        <input
                            type="email"
                            name="owner_email"
                            value={formData.owner_email}
                            onChange={handleChange}
                            placeholder="e.g. owner@gmail.com"
                            className="bg-black/50 border border-white/10 text-white text-lg p-3 rounded-xl focus:outline-none focus:border-cyan-500 focus:bg-black transition-all"
                            disabled={isLoading}
                        />
                    </div>

                    <div className="mt-4">
                        <NeonButton type="submit" disabled={isLoading} fullWidth>
                            {isLoading ? 'Saving...' : 'Lock Configuration'}
                        </NeonButton>
                    </div>

                </form>
            </div>
        </BackgroundWrapper>
    );
};

export default OwnerSetup;