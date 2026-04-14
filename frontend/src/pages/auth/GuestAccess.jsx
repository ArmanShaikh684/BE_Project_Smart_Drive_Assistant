import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import NeonButton from "../../components/NeonButton";
import AnimatedTextLink from "../../components/AnimatedTextLink";
import BackgroundWrapper from "../../components/BackgroundWrapper.jsx";

const GuestAccess = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleGuestLogin = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Fetch the default guest profile from Port 5000
            const response = await authAPI.guestLogin();

            if (response.success) {
                // Log the guest into the global React state
                login(response.driver);
                // Head straight to the dashboard
                navigate('/dashboard');
            } else {
                setError(response.error || 'Failed to initialize Guest Mode.');
            }
        } catch (err) {
            console.error("Guest login error:", err);
            setError('Cannot connect to the AI Server. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BackgroundWrapper>

            {/* UPGRADED: Back Button */}
            <AnimatedTextLink
                onClick={() => navigate('/')}
                className="fixed top-8 left-8 md:top-12 md:left-12 text-2xl md:text-3xl font-extrabold tracking-widest drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] z-50 transition-transform duration-300 hover:scale-110"
                disabled={isLoading}
            >
                ← Back
            </AnimatedTextLink>

            {/* UPGRADED: Header */}
            <div className="text-center mb-10 relative z-10">
                <h1
                    className="text-4xl md:text-5xl font-black uppercase text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] mb-2"
                    style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                    Guest Mode
                </h1>
                <p
                    className="text-xl md:text-2xl uppercase font-medium drop-shadow-md text-gray-400"
                    style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.2em" }}
                >
                    Temporary Driving Access
                </p>
            </div>

            {/* Info Card & Action */}
            <div className="flex flex-col gap-8 w-full max-w-lg bg-[#0d131a] p-10 rounded-3xl border border-gray-800 shadow-2xl items-center text-center relative z-10">

                {/* Warning Icon */}
                <div className="text-6xl mb-2">🛡️</div>

                {/* Guest Mode Explanation */}
                <div className="flex flex-col gap-4 text-lg text-gray-300">
                    <p>
                        You are about to start a trip as a <span className="font-bold text-white">Guest Driver</span>.
                    </p>
                    <div className="bg-yellow-900/30 border border-yellow-700/50 p-4 rounded-xl text-yellow-500 text-sm tracking-wide leading-relaxed">
                        <span className="font-bold uppercase block mb-1">⚠️ Safety Notice</span>
                        In the event of an emergency or severe distraction, safety alerts and live video evidence will be routed directly to the registered <strong>Car Owner</strong>.
                    </div>
                </div>

                {/* Error Message Display */}
                {error && (
                    <div className="w-full bg-red-900/50 border border-red-500 text-red-400 p-4 rounded-lg font-medium">
                        {error}
                    </div>
                )}

                {/* Start Button */}
                <NeonButton
                    onClick={handleGuestLogin}
                    disabled={isLoading}
                    fullWidth
                >
                    {isLoading ? 'Initializing...' : 'Proceed as Guest'}
                </NeonButton>

            </div>
        </BackgroundWrapper>
    );
};

export default GuestAccess;