import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { authAPI } from '../../services/api';
import NeonButton from "../../components/NeonButton";
import AnimatedTextLink from "../../components/AnimatedTextLink";
import BackgroundWrapper from "../../components/BackgroundWrapper";

const PasswordLogin = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    // Component State
    const [driverName, setDriverName] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Form Submission Handler
    const handleLogin = async (e) => {
        e.preventDefault(); // Prevent page reload on form submit
        setError(null);

        // Basic Validation
        if (!driverName.trim() || !password.trim()) {
            setError('Please enter both name and PIN/Password.');
            return;
        }

        setIsLoading(true);

        try {
            // Call the Flask backend on Port 5000
            const response = await authAPI.passwordLogin(driverName, password);

            if (response.success) {
                // Log the user into the global React state
                login(response.driver);
                // Navigate to the main driving screen
                navigate('/dashboard');
            } else {
                // Display the error returned from Python (e.g., "Invalid name or password")
                setError(response.error || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error("Password login error:", err); // FIX 2: Log the error to clear ESLint warnings
            setError('Cannot connect to the AI Server. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BackgroundWrapper> {/* <-- FIX: Added the missing '>' here! */}

            {/* Back Button */}
            <AnimatedTextLink
                onClick={() => navigate('/')}
                className="fixed top-8 left-8 md:top-12 md:left-12 text-2xl md:text-3xl font-extrabold tracking-widest drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] z-50 transition-transform duration-300 hover:scale-110"
                disabled={isLoading}
            >
                ← Back
            </AnimatedTextLink>

            {/* Header */}
            <div className="text-center mb-10">
                <h1
                    className="text-4xl font-black uppercase text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] mb-2"
                    style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.1em" }}
                >
                    Manual Login
                </h1>
                <p
                    className="text-xl text-gray-400 uppercase font-medium"
                    style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.2em" }}
                >
                    Enter your credentials
                </p>
            </div>

            {/* Login Form */}
            <form
                onSubmit={handleLogin}
                className="flex flex-col gap-6 w-full max-w-md bg-[#0d131a] p-8 rounded-2xl border border-gray-800 shadow-2xl relative z-10"
            >

                {/* Error Message Display */}
                {error && (
                    <div className="bg-red-900/50 border border-red-500 text-red-400 p-4 rounded-lg text-center font-medium">
                        {error}
                    </div>
                )}

                {/* Driver Name Input */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-400 uppercase tracking-widest text-sm font-bold">Driver Name</label>
                    <input
                        type="text"
                        value={driverName}
                        onChange={(e) => setDriverName(e.target.value)}
                        placeholder="e.g. Arman"
                        className="bg-black border border-gray-700 text-white text-2xl p-4 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                        autoComplete="off"
                        disabled={isLoading}
                    />
                </div>

                {/* PIN / Password Input */}
                <div className="flex flex-col gap-2">
                    <label className="text-gray-400 uppercase tracking-widest text-sm font-bold">PIN</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••"
                        className="bg-black border border-gray-700 text-white text-2xl p-4 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors tracking-widest"
                        disabled={isLoading}
                    />
                </div>

                {/* Submit Button */}
                <NeonButton
                    type="submit"
                    disabled={isLoading}
                    className="mt-4"
                    fullWidth
                >
                    {isLoading ? 'Verifying...' : 'Login'}
                </NeonButton>

            </form>
        </BackgroundWrapper>
    );
};

export default PasswordLogin;