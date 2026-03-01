import React from 'react';
import AlertScreen from '../components/alerts/AlertScreen';

const Alerts = () => {
    return (
        <div className="flex flex-col h-full p-5" style={{ minHeight: 0 }}>
            {/* Page title */}
            <div className="flex items-center gap-3 mb-5 flex-shrink-0">
                <div style={{
                    width: 3, height: 22, borderRadius: 2,
                    background: 'linear-gradient(180deg, #00d4ff, #00ffb3)',
                    boxShadow: '0 0 8px rgba(0,212,255,0.5)',
                }} />
                <div>
                    <h1 className="text-base font-bold text-white tracking-widest uppercase font-mono">
                        Alert Monitor
                    </h1>
                    <p className="text-xs font-mono mt-0.5 tracking-widest"
                        style={{ color: 'rgba(0,212,255,0.35)' }}>
                        REAL-TIME SAFETY DETECTION · SDA.OS
                    </p>
                </div>
            </div>

            {/* Main screen — fills remaining height */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <AlertScreen />
            </div>
        </div>
    );
};

export default Alerts;
