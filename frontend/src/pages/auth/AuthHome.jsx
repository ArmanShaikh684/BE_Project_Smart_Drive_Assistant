import React from 'react';
import { useNavigate } from 'react-router-dom';
import NeonButton from "../../components/NeonButton";
import AnimatedTextLink from "../../components/AnimatedTextLink";

const AuthHome = () => {
    const navigate = useNavigate();

    return (
        // 1. THE AMBIENT COCKPIT BACKGROUND
        <div className="relative flex flex-col items-center justify-center min-h-screen w-full bg-[#030712] text-white p-8 overflow-hidden">

            {/* Auto-importing the Sci-Fi Google Fonts for immediate use */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;600&display=swap');
            `}</style>

            {/* Ambient Background Glows (Blurred Orbs) */}
            <div className="absolute top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none"></div>

            {/* Z-10 Wrapper ensures all content sits ON TOP of the background glows */}
            <div className="relative z-10 flex flex-col items-center w-full">

                {/* 2. THE UPGRADED TYPOGRAPHY HEADER */}
                <div className="text-center mb-16 flex flex-col items-center">
                    <h1
                        className="text-6xl md:text-7xl font-black uppercase mb-3 text-cyan-400 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]"
                        style={{ fontFamily: "'Orbitron', sans-serif", letterSpacing: "0.15em" }}
                    >
                        Smart Drive
                    </h1>
                    <div className="flex items-center gap-4">
                        {/* Decorative HUD Lines */}
                        <div className="w-12 h-[2px] bg-cyan-800/60 hidden md:block"></div>
                        <p
                            className="text-xl md:text-2xl text-gray-400 uppercase font-medium text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-200"
                            style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.35em" }}
                        >
                            Assistant System
                        </p>
                        <div className="w-12 h-[2px] bg-cyan-800/60 hidden md:block"></div>
                    </div>
                </div>

                {/* Main Action Buttons */}
                <div className="flex flex-col gap-6 w-full max-w-md">

                    {/* Primary Action: Face Scan */}
                    <NeonButton onClick={() => navigate('/login/face')} fullWidth>
                        Auto Login (Face)
                    </NeonButton>

                    {/* Secondary Action: Password/PIN */}
                    <NeonButton onClick={() => navigate('/login/password')} fullWidth>
                        Login with PIN
                    </NeonButton>

                    {/* Tertiary Action: Guest Mode */}
                    <NeonButton onClick={() => navigate('/login/guest')} fullWidth>
                        Guest Mode
                    </NeonButton>

                </div>

                {/* Footer / Registration Link */}
                <div className="mt-16 flex justify-center">
                    <AnimatedTextLink
                        onClick={() => navigate('/register')}
                        className="text-lg md:text-xl font-bold tracking-[0.2em] drop-shadow-[0_0_10px_rgba(6,182,212,0.4)] transition-transform duration-300 hover:scale-105"
                        showUnderline={true}
                    >
                        Register New Driver
                    </AnimatedTextLink>
                </div>

            </div>
        </div>
    );
};

export default AuthHome;