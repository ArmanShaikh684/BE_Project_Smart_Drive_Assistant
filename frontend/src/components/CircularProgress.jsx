// src/components/CircularProgress.jsx
import React from 'react';

const CircularProgress = ({ score, size = 150 }) => {
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    // Calculate how much of the ring should be filled
    const offset = circumference - (score / 100) * circumference;

    // Determine glow color based on score
    const getColor = () => {
        if (score > 75) return "#22d3ee"; // Cyan
        if (score > 40) return "#fbbf24"; // Yellow
        return "#ef4444"; // Red
    };

    const color = getColor();

    return (
        <div className="relative flex flex-col items-center justify-center w-full h-full">
            <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
                <svg className="transform -rotate-90 absolute" width={size} height={size}>
                    {/* Background Track */}
                    <circle cx={size/2} cy={size/2} r={radius} stroke="#1f2937" strokeWidth="8" fill="transparent" />
                    {/* Animated Progress Ring */}
                    <circle
                        cx={size/2} cy={size/2} r={radius}
                        stroke={color}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                        style={{ filter: `drop-shadow(0 0 8px ${color})` }}
                    />
                </svg>
                {/* Score Number in Center */}
                <div className="absolute flex flex-col items-center justify-center mt-2">
                    <span className="text-4xl font-black text-white" style={{ fontFamily: "'Orbitron', sans-serif" }}>{score}</span>
                </div>
            </div>
            <span className="text-xs text-gray-500 uppercase font-bold tracking-[0.2em] mt-2">Safety Score</span>
        </div>
    );
};

export default CircularProgress;