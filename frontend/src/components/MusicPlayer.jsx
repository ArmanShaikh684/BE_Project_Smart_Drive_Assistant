import React, { useState } from 'react';

const MusicPlayer = ({ isPlaying, onToggle, onNext }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async () => {
        setIsLoading(true);
        await onToggle();
        setIsLoading(false);
    };

    const handleNext = async () => {
        setIsLoading(true);
        await onNext();
        setIsLoading(false);
    };

    return (
        <div className="w-full bg-[#0d131a]/80 backdrop-blur-md rounded-3xl border border-white/5 p-4 flex flex-row items-center justify-between shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* LEFT SIDE: Equalizer & Info */}
            <div className="flex items-center gap-4 overflow-hidden">
                {/* Compact Dancing Equalizer */}
                <div className="flex items-end justify-center h-8 gap-1 w-8 flex-shrink-0">
                    {[...Array(4)].map((_, i) => {
                        const heights = [60, 100, 70, 40]; // Fixed heights for a clean look
                        const delay = i * 0.15;
                        const colors = ['bg-cyan-400', 'bg-blue-500', 'bg-teal-300', 'bg-cyan-500'];
                        return (
                            <div
                                key={i}
                                className={`w-1.5 ${colors[i]} rounded-full opacity-80 transition-all duration-300`}
                                style={{
                                    height: `${heights[i]}%`,
                                    animation: `equalizer 0.8s infinite alternate-reverse ease-in-out`,
                                    animationDelay: `${delay}s`,
                                    animationPlayState: isPlaying ? 'running' : 'paused' // Stops dancing when paused
                                }}
                            />
                        );
                    })}
                </div>

                {/* Text Info */}
                <div className="flex flex-col truncate">
                    <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mb-0.5">Media Player</span>
                    <span className="text-cyan-400 text-sm md:text-base font-bold tracking-wide truncate">
                        {isPlaying ? "Playing Audio" : "Paused"}
                    </span>
                </div>
            </div>

            {/* RIGHT SIDE: Controls */}
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
                {/* Previous Track (Visual Only) */}
                <button className="w-8 h-8 rounded-full bg-black/40 border border-white/5 text-cyan-500/50 flex items-center justify-center cursor-default hidden md:flex">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                </button>

                {/* Center Play/Pause Button */}
                <button
                    onClick={handleToggle}
                    disabled={isLoading}
                    className={`w-10 h-10 md:w-12 md:h-12 rounded-full ${isLoading ? 'bg-gray-600' : 'bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]'} text-[#0f0c1b] flex items-center justify-center hover:scale-105 transition-all`}
                >
                    {isLoading ? (
                        <div className="w-4 h-4 border-2 border-[#0f0c1b] border-t-transparent rounded-full animate-spin"></div>
                    ) : isPlaying ? (
                        /* Pause Icon */
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    ) : (
                        /* Play Icon */
                        <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                </button>

                {/* Next Track */}
                <button
                    onClick={handleNext}
                    disabled={isLoading}
                    className="w-8 h-8 rounded-full bg-black/40 border border-white/5 text-cyan-500 flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all"
                >
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                </button>
            </div>

            <style>{`
                @keyframes equalizer {
                    0% { transform: scaleY(0.3); transform-origin: bottom; }
                    100% { transform: scaleY(1); transform-origin: bottom; }
                }
            `}</style>
        </div>
    );
};

export default MusicPlayer;