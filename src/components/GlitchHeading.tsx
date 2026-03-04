"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

export function GlitchHeading() {
    const original = "ARYAN YADAV";
    const [text, setText] = useState(original);
    const [isGlitching, setIsGlitching] = useState(false);
    const [justReformed, setJustReformed] = useState(false);

    useEffect(() => {
        const handleGlitch = () => {
            if (isGlitching) return;
            setIsGlitching(true);
            setJustReformed(false);

            const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
            const interval = setInterval(() => {
                setText(original.split("").map(c =>
                    c === " " ? " " : chars[Math.floor(Math.random() * chars.length)]
                ).join(""));
            }, 50);

            setTimeout(() => {
                clearInterval(interval);
                setText(original);
                setIsGlitching(false);
                setJustReformed(true);
                setTimeout(() => setJustReformed(false), 2000); // Glow fades after 2s
            }, 1000); // Glitches dynamically for 1 second
        };

        window.addEventListener("trigger-glitch", handleGlitch);
        return () => window.removeEventListener("trigger-glitch", handleGlitch);
    }, [isGlitching]);

    const isNormal = !isGlitching && !justReformed;

    return (
        <h1
            className={`font-display text-5xl md:text-8xl font-bold uppercase tracking-tighter mb-4 transition-all duration-300 ${isNormal
                    ? "text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 drop-shadow-[0_0_15px_rgba(255,69,0,0.8)]"
                    : "drop-shadow-[0_0_30px_rgba(255,69,0,1)] text-[#FF4500]"
                }`}
        >
            {text.split("").map((char, i) => (
                <motion.span
                    key={i}
                    className="inline-block"
                    animate={
                        isGlitching
                            ? {
                                x: (Math.random() - 0.5) * 10,
                                y: (Math.random() - 0.5) * 6,
                                opacity: Math.random() > 0.5 ? 1 : 0.5,
                                color: Math.random() > 0.8 ? "#FF4500" : "#ffffff"
                            }
                            : justReformed
                                ? {
                                    x: 0,
                                    y: 0,
                                    opacity: 1,
                                    color: "#FF4500", // glows orange on reform
                                    textShadow: "0 0 20px #FF4500, 0 0 40px #FF4500" // Enhanced glow
                                }
                                : {
                                    x: 0,
                                    y: 0,
                                    opacity: 1,
                                    color: "inherit",
                                    textShadow: "none"
                                }
                    }
                    transition={{
                        duration: isGlitching ? 0.05 : 0.5,
                        delay: justReformed ? i * 0.04 : 0
                    }}
                >
                    {char === " " ? "\u00A0" : char}
                </motion.span>
            ))}
        </h1>
    );
}
