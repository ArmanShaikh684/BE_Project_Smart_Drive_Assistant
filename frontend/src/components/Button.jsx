import React from "react";

const colorStyles = {
    red: {
        border: "bg-red-500",
        text: "text-red-400",
        glow: "shadow-[0_0_25px_#ff2d2d,0_0_60px_#ff2d2d]",
        accent: "bg-red-300",
    },
};

const SciFiButton = ({
                         children,
                         onClick,
                         className = "",
                         color = "red",
                     }) => {
    const current = colorStyles[color] || colorStyles.red;

    const clipPathStyle = {
        clipPath:
            "polygon(25px 0, calc(100% - 25px) 0, 100% 25px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 25px 100%, 0 calc(100% - 25px), 0 25px)",
    };

    const innerClipPathStyle = {
        clipPath:
            "polygon(23px 0, calc(100% - 23px) 0, 100% 23px, 100% calc(100% - 23px), calc(100% - 23px) 100%, 23px 100%, 0 calc(100% - 23px), 0 23px)",
    };

    return (
        <button
            onClick={onClick}
            style={clipPathStyle}
            className={`relative group p-[2px] transition-all duration-300 hover:scale-105 ${className}`}
        >
            {/* 🔥 STRONG OUTER GLOW */}
            <div
                className={`absolute inset-0 ${current.border} opacity-90 ${current.glow} group-hover:opacity-100`}
            ></div>

            {/* 🔴 INNER BODY */}
            <div
                style={innerClipPathStyle}
                className="relative h-full w-full bg-gradient-to-br from-black via-[#0a0a0a] to-[#111] flex items-center justify-center px-10 py-4 overflow-hidden"
            >
                {/* ⚡ SCAN EFFECT */}
                <div className="absolute inset-0">
                    <div className="absolute top-0 left-[-100%] w-full h-full bg-gradient-to-r from-transparent via-red-400/30 to-transparent animate-scan"></div>
                </div>

                {/* 🔺 TOP LINE */}
                <div className="absolute top-2 left-8 w-12 h-[2px] bg-red-400 shadow-[0_0_10px_#ff2d2d]"></div>

                {/* 🔻 BOTTOM LINE */}
                <div className="absolute bottom-2 right-8 w-12 h-[2px] bg-red-400 shadow-[0_0_10px_#ff2d2d]"></div>

                {/* 💡 TEXT WITH GLOW */}
                <span className="text-red-400 font-bold tracking-[0.3em] text-xl md:text-2xl uppercase
        drop-shadow-[0_0_8px_#ff2d2d]
        group-hover:text-white
        group-hover:drop-shadow-[0_0_15px_#ffffff]
        transition-all duration-300">
          {children}
        </span>
            </div>
        </button>
    );
};

export default SciFiButton;