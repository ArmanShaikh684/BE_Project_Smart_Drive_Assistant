import React from "react";

const AnimatedTextLink = ({
                              children,
                              onClick,
                              className = "",
                              disabled = false,
                              showUnderline = false
                          }) => {
    // Smart positioning so it doesn't break absolute positioning (like top-left corners)
    const positionClass = className.includes("absolute") || className.includes("fixed") ? "" : "relative";

    return (
        <>
            <button
                onClick={onClick}
                disabled={disabled}
                className={`flow-text-link ${positionClass} ${showUnderline ? "with-underline" : ""} ${disabled ? "disabled" : ""} ${className}`}
            >
                {children}
            </button>

            <style>{`
                .flow-text-link {
                    color: #9ca3af; /* Default Tailwind gray-400 */
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    
                    /* The fade effect for the text color */
                    transition: color 0.3s ease;
                    
                    /* THE FIX: We put the animated gradient on the base class so it is ALWAYS running, 
                       just hidden behind the solid gray text color! */
                    background-image: linear-gradient(-45deg, #06b6d4, #7e03aa, #00fffb, #06b6d4);
                    background-size: 300% 300%;
                    -webkit-background-clip: text;
                    background-clip: text;
                    animation: text-flow-anim 3s linear infinite;
                }

                /* On hover, just make text transparent. The moving background is instantly there. */
                .flow-text-link:not(.disabled):hover {
                    color: transparent;
                }

                /* LAYER 1: The solid gray underline (Default state) */
                .flow-text-link.with-underline::before {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background-color: #374151; /* gray-700 */
                    transition: opacity 0.3s ease;
                    z-index: 1;
                }

                /* LAYER 2: The animated glowing underline (Hidden until hover) */
                .flow-text-link.with-underline::after {
                    content: '';
                    position: absolute;
                    bottom: -8px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background-image: linear-gradient(-45deg, #06b6d4, #7e03aa, #00fffb, #06b6d4);
                    background-size: 300% 300%;
                    animation: text-flow-anim 3s linear infinite;
                    opacity: 0; /* Hidden by default */
                    transition: opacity 0.3s ease, box-shadow 0.3s ease;
                    z-index: 2;
                }

                /* When hovered, crossfade the gray line out and the glowing line in! */
                .flow-text-link.with-underline:not(.disabled):hover::before {
                    opacity: 0;
                }
                .flow-text-link.with-underline:not(.disabled):hover::after {
                    opacity: 1;
                    box-shadow: 0 0 10px rgba(6, 182, 212, 0.5);
                }

                .flow-text-link.disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                @keyframes text-flow-anim {
                    0% { background-position: 0% 50%; }
                    100% { background-position: 100% 50%; }
                }
            `}</style>
        </>
    );
};

export default AnimatedTextLink;