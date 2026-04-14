import React from 'react';

const AttentionBar = ({ status }) => {
    let score = 100;
    let colorClass = 'bg-cyan-400';
    let glowClass = 'shadow-[0_0_15px_#22d3ee]';
    let textColor = 'text-cyan-950';

    if (status === 'FOCUSED') {
        score = 100;
        colorClass = 'bg-cyan-400';
        glowClass = 'shadow-[0_0_15px_#22d3ee]';
        textColor = 'text-cyan-950';
    } else if (status === 'WARNING') {
        score = 75;
        colorClass = 'bg-yellow-400';
        glowClass = 'shadow-[0_0_15px_#fbbf24]';
        textColor = 'text-yellow-950';
    } else if (status === 'DISTRACTED') {
        score = 45;
        colorClass = 'bg-orange-500';
        glowClass = 'shadow-[0_0_15px_#f97316]';
        textColor = 'text-orange-950';
    } else if (status === 'DROWSY' || status === 'CRITICAL') {
        score = 10;
        colorClass = 'bg-red-600';
        glowClass = 'shadow-[0_0_20px_#ef4444] animate-pulse';
        textColor = 'text-white';
    } else {
        score = 0;
        colorClass = 'bg-gray-600';
        glowClass = '';
        textColor = 'text-white';
    }

    return (
        // Removed rounded edges, strict width, sharp rectangular border
        <div className="w-12 md:w-16 h-full flex-shrink-0 bg-[#0d131a]/80 backdrop-blur-md border border-white/5 flex flex-col items-center justify-between py-4 shadow-xl relative overflow-hidden">

            {/* The Fluid Bar Container - Sharp edges */}
            <div className="w-8 md:w-10 flex-1 my-2 bg-black/60 border border-white/10 relative overflow-hidden flex flex-col justify-end shadow-inner">

                {/* The Animated Liquid Fill - Sharp edges */}
                <div
                    className={`w-full transition-all duration-1000 ease-in-out flex flex-col items-center justify-start pt-2 min-h-[32px] ${colorClass} ${glowClass}`}
                    style={{ height: `${score}%` }}
                >
                    <span className={`font-black font-monoH text-[10px] md:text-xs tracking-tighter transition-colors duration-1000 ${textColor}`}>
                        {score}%
                    </span>
                </div>
            </div>

            {/* Bottom Vertical Label */}
            <span className="text-[9px] md:text-[10px] text-white/50 uppercase tracking-[0.2em] font-bold [writing-mode:vertical-rl] rotate-180 z-10 mt-1">
                Attention
            </span>

        </div>
    );
};

export default AttentionBar;