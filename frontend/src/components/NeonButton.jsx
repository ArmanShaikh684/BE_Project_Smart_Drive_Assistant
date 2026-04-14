import React from "react";

const NeonButton = ({
                        children,
                        onClick,
                        className = "",
                        fullWidth = false,
                        type = "button",
                        disabled = false,
                        ...props
                    }) => {
    return (
        <>
            <button
                type={type}
                onClick={onClick}
                disabled={disabled}
                {...props}
                className={`
                    uiverse-btn
                    ${fullWidth ? "w-full" : ""}
                    ${disabled ? "opacity-50 cursor-not-allowed" : ""}
                    ${className}
                `}
            >
                {children}
            </button>

            {/* We inject the advanced CSS directly into the component so you don't have to touch index.css! */}
            <style>{`
                .uiverse-btn {
                    /* You can change these colors to match your theme perfectly! */
                    --border-color: linear-gradient(-45deg, #06b6d4, #7e03aa, #00fffb);
                    --border-width: 0.125em;
                    --curve-size: 0.5em;
                    --bg: #0b0f14; /* Matches your dashboard dark background */
                    --color: #afffff;
                    
                    color: var(--color);
                    cursor: pointer;
                    position: relative;
                    isolation: isolate;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    padding: 1rem 2rem;
                    font-size: 1.125rem;
                    font-weight: 700;
                    border: 0;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    box-shadow: 0px 10px 20px rgba(0, 0, 0, 0.4);
                    clip-path: polygon(
                        0% var(--curve-size),
                        var(--curve-size) 0,
                        100% 0,
                        100% calc(100% - var(--curve-size)),
                        calc(100% - var(--curve-size)) 100%,
                        0 100%
                    );
                    transition: color 250ms;
                }

                .uiverse-btn::after,
                .uiverse-btn::before {
                    content: "";
                    position: absolute;
                    inset: 0;
                }

                /* The Animated Gradient Background */
                .uiverse-btn::before {
                    background: var(--border-color);
                    background-size: 300% 300%;
                    animation: move-bg7234 5s ease infinite;
                    z-index: -2;
                }

                @keyframes move-bg7234 {
                    0% { background-position: 31% 0%; }
                    50% { background-position: 70% 100%; }
                    100% { background-position: 31% 0%; }
                }

                /* The Inner Dark Box (Creates the border illusion) */
                .uiverse-btn::after {
                    background: var(--bg);
                    z-index: -1;
                    clip-path: polygon(
                        var(--border-width) calc(var(--curve-size) + var(--border-width) * 0.5),
                        calc(var(--curve-size) + var(--border-width) * 0.5) var(--border-width),
                        calc(100% - var(--border-width)) var(--border-width),
                        calc(100% - var(--border-width)) calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)),
                        calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)) calc(100% - var(--border-width)),
                        var(--border-width) calc(100% - var(--border-width))
                    );
                    transition: clip-path 500ms;
                }

                /* The Hover Wipe Effect */
                .uiverse-btn:where(:hover, :focus):not(:disabled)::after {
                    clip-path: polygon(
                        calc(100% - var(--border-width)) calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)),
                        calc(100% - var(--border-width)) var(--border-width),
                        calc(100% - var(--border-width)) var(--border-width),
                        calc(100% - var(--border-width)) calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)),
                        calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)) calc(100% - var(--border-width)),
                        calc(100% - calc(var(--curve-size) + var(--border-width) * 0.5)) calc(100% - var(--border-width))
                    );
                    transition: 200ms;
                }

                .uiverse-btn:where(:hover, :focus):not(:disabled) {
                    color: #fff;
                    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
                }
            `}</style>
        </>
    );
};

export default NeonButton;