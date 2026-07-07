import React from 'react';

const BackgroundWrapper = ({ children }) => {
    return (
        // 1. FIXED INSET-0: This rips the wrapper out of the normal document flow
        // and pins it to the exact size of the browser window. We then force THIS div to scroll!
        <div className="fixed inset-0 w-full h-full bg-[#030712] text-white overflow-x-hidden overflow-y-auto">

            {/* Global Sci-Fi Fonts */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Rajdhani:wght@500;600&display=swap');
            `}</style>

            {/* Ambient Background Glows (Pinned to the background so they don't scroll with the text) */}
            <div className="fixed top-[-10%] left-[-10%] w-[40rem] h-[40rem] bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>
            <div className="fixed bottom-[-10%] right-[-10%] w-[40rem] h-[40rem] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none z-0"></div>

            {/* 2. THE FLEX TRACK: min-h-full ensures this track is always at least as tall as the screen.
                 py-24 guarantees the form never slides up underneath your back button! */}
            <div className="relative z-10 flex flex-col min-h-full w-full max-w-7xl mx-auto px-4 py-24 md:px-8">

                {/* 3. THE MAGIC FIX: 'm-auto' automatically pushes equal space above and below the content.
                     If the form is taller than the screen, 'm-auto' simply gives up and lets the form
                     flow downward normally. It will NEVER cut off the top again! */}
                <div className="m-auto w-full flex flex-col items-center">
                    {children}
                </div>

            </div>

        </div>
    );
};

export default BackgroundWrapper;