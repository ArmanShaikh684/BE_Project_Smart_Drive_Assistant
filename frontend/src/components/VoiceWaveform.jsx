import React from 'react';

// Notice it now receives `isSpeaking` directly
const VoiceWaveform = ({ isSpeaking }) => {
    const bars = Array.from({ length: 10 });

    return (
        <div className="flex flex-col items-center justify-center w-full h-full bg-[#0d131a]/60 backdrop-blur-md rounded-2xl border border-white/5 p-4 overflow-hidden relative shadow-2xl">

            <style>{`
                /* DANCING STATE */
                @keyframes random-dance {
                    0% { height: 12px; border-radius: 12px; transform: translateY(0); opacity: 0.8; }
                    100% { height: var(--peak); border-radius: 12px; transform: translateY(0); opacity: 1; }
                }

                /* STANDBY CIRCLES STATE */
                @keyframes dot-wave {
                    0%, 100% { height: 12px; border-radius: 50%; transform: translateY(0); opacity: 0.3; }
                    50% { height: 12px; border-radius: 50%; transform: translateY(-15px); opacity: 1; }
                }
            `}</style>

            <div className="flex items-center justify-center gap-3 h-24">
                {bars.map((_, i) => {
                    const colors = ['#3b82f6', '#ef4444', '#fbbf24', '#22c55e'];
                    const color = colors[i % colors.length];
                    const randomPeak = `${30 + (i * 7 % 40)}px`;

                    return (
                        <div
                            key={i}
                            style={{
                                backgroundColor: color,
                                width: '12px',
                                animation: isSpeaking
                                    ? `random-dance ${0.25 + (i % 3) * 0.1}s infinite ease-in-out alternate`
                                    : `dot-wave 1.5s infinite ease-in-out`,
                                animationDelay: isSpeaking ? '0s' : `${i * 0.15}s`,
                                boxShadow: isSpeaking ? `0 0 15px ${color}` : 'none',
                                '--peak': randomPeak
                            }}
                        />
                    );
                })}
            </div>

            {/* THE TEXT HAS BEEN COMPLETELY DELETED FROM HERE */}

        </div>
    );
};

export default VoiceWaveform;