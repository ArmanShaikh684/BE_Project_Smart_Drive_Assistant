import React from 'react';

const ImmersiveCamera = ({ streamUrl, status }) => {
    return (
        <div className="w-full h-full relative bg-black flex flex-col">

            {/* 1. BACKGROUND DRIVING VIDEO */}
            {/* autoPlay, loop, and muted are required for browsers to auto-start video */}
            <video
                src="..public/driving_video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="absolute inset-0 w-full h-full object-cover opacity-70"
            />

            {/* 2. REAL WEBCAM (Picture-in-Picture, Top Left) */}
            <div className="absolute top-4 left-4 z-20 w-32 md:w-48 rounded-xl border-2 border-cyan-500/70 shadow-[0_0_20px_rgba(34,211,238,0.3)] overflow-hidden bg-black">
                <img
                    src={streamUrl}
                    crossOrigin="anonymous"
                    className="w-full h-auto object-cover opacity-90"
                    alt="Live Driver Feed"
                />
            </div>

            {/* 3. STATUS BADGE (Moved to Top Right) */}
            <div className="absolute top-4 right-4 z-20 bg-black/80 backdrop-blur-md px-4 py-2 rounded-lg border border-cyan-500/30 shadow-xl">
                <span className={`font-bold tracking-widest uppercase font-monoH ${
                    status === 'FOCUSED' ? 'text-cyan-400' :
                        status === 'DISTRACTED' || status === 'WARNING' ? 'text-yellow-400' :
                            'text-red-500 animate-pulse'
                }`}>
                    {status}
                </span>
            </div>

            {/* 4. DASHBOARD BLENDING GRADIENT */}
            {/* This fades the bottom of the video into the dark background of your dashboard */}
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-t from-[#030712] via-transparent to-[#030712]/20"></div>

        </div>
    );
};

export default ImmersiveCamera;