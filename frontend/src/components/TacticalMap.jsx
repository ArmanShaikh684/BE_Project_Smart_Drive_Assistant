import React, { useState, useEffect } from 'react';

const TacticalMap = () => {
    const [coords, setCoords] = useState({ lat: 18.5204, lng: 73.8567 }); // Default: Pune
    const [isLocating, setIsLocating] = useState(true);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setCoords({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                    });
                    setIsLocating(false);
                },
                () => setIsLocating(false) // Fallback to default if user denies permission
            );
        }
    }, []);

    // We use a specific Google Maps URL format that works in iframes
    const mapUrl = `https://maps.google.com/maps?q=${coords.lat},${coords.lng}&z=15&output=embed`;

    return (
        <div className="relative w-full h-full bg-[#05080f] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            {isLocating && (
                <div className="absolute inset-0 z-20 bg-black/60 backdrop-blur-md flex items-center justify-center">
                    <span className="text-cyan-400 font-mono animate-pulse uppercase tracking-widest">
                        Pinging Satellites...
                    </span>
                </div>
            )}

            <iframe
                title="Driver GPS"
                width="100%"
                height="100%"
                style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%)' }}
                src={mapUrl}
                allowFullScreen
            />

            {/* Sci-Fi Overlay Label */}
            <div className="absolute bottom-4 left-4 bg-black/60 p-2 rounded-lg border border-cyan-500/30 backdrop-blur-sm z-10">
                <span className="text-[10px] text-gray-500 uppercase font-bold block">GPS Coordinates</span>
                <span className="text-cyan-400 font-mono text-xs">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
            </div>
        </div>
    );
};

export default TacticalMap;