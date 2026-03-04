"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

// --- Types & Constants ---
const KONAMI_CODE = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
];
const ARYAN_CODE = ["a", "r", "y", "a", "n"];
const IDLE_TIMEOUT_MS = 30000; // 30 seconds

interface Toast {
    id: string;
    message: string;
    type: "neural" | "glitch";
}

export function EasterEggs() {
    const [konamiActive, setKonamiActive] = useState(false);
    const [idleActive, setIdleActive] = useState(false);
    const [toasts, setToasts] = useState<Toast[]>([]);

    // Ref tracking for sequences
    const konamiIndex = useRef(0);
    const aryanIndex = useRef(0);
    const idleTimer = useRef<NodeJS.Timeout | null>(null);

    const addToast = (message: string, type: "neural" | "glitch") => {
        const id = Math.random().toString(36).substring(7);
        setToasts([{ id, message, type }]); // Replace, don't stack
        setTimeout(() => {
            setToasts((current) => current.filter((t) => t.id !== id));
        }, 3000); // Fades out after 3 seconds
    };

    useEffect(() => {
        // 1. Keyboard Listeners (Konami & ARYAN)
        const handleKeyDown = (e: KeyboardEvent) => {
            // Konami Check
            if (e.key === KONAMI_CODE[konamiIndex.current] || e.key === KONAMI_CODE[konamiIndex.current].toUpperCase()) {
                konamiIndex.current++;
                if (konamiIndex.current === KONAMI_CODE.length) {
                    triggerKonami();
                    konamiIndex.current = 0;
                }
            } else {
                konamiIndex.current = 0;
                // Re-check if it's the first key
                if (e.key === KONAMI_CODE[0]) konamiIndex.current = 1;
            }

            // ARYAN Check
            if (e.key.toLowerCase() === ARYAN_CODE[aryanIndex.current]) {
                aryanIndex.current++;
                if (aryanIndex.current === ARYAN_CODE.length) {
                    triggerAryanGlitch();
                    aryanIndex.current = 0;
                }
            } else {
                aryanIndex.current = 0;
                if (e.key.toLowerCase() === ARYAN_CODE[0]) aryanIndex.current = 1;
            }
        };

        // 2. Idle Tracking
        const resetIdleTimer = () => {
            if (idleActive) setIdleActive(false);
            if (idleTimer.current) clearTimeout(idleTimer.current);
            idleTimer.current = setTimeout(() => {
                setIdleActive(true);
            }, IDLE_TIMEOUT_MS);
        };

        // 3. Global Toast Listener
        const handleGlobalToast = (e: Event) => {
            const customEvent = e as CustomEvent<{ message: string; type: "neural" | "glitch" }>;
            addToast(customEvent.detail.message, customEvent.detail.type);
        };

        // Initialize
        resetIdleTimer();

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("mousemove", resetIdleTimer, { passive: true });
        window.addEventListener("scroll", resetIdleTimer, { passive: true });
        window.addEventListener("touchstart", resetIdleTimer, { passive: true });
        window.addEventListener("trigger-toast", handleGlobalToast);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("mousemove", resetIdleTimer);
            window.removeEventListener("scroll", resetIdleTimer);
            window.removeEventListener("touchstart", resetIdleTimer);
            window.removeEventListener("trigger-toast", handleGlobalToast);
            if (idleTimer.current) clearTimeout(idleTimer.current);
        };
    }, [idleActive]);

    const triggerKonami = () => {
        setKonamiActive(true);
        addToast("🧠 NEURAL OVERRIDE ACTIVATED", "neural");
        setTimeout(() => setKonamiActive(false), 5000);
    };

    const triggerAryanGlitch = () => {
        window.dispatchEvent(new CustomEvent("trigger-glitch"));
        addToast("👋 Hey, you found me!", "glitch");
    };

    return (
        <>
            {/* MATRIX RAIN OVERLAY */}
            <AnimatePresence>
                {konamiActive && <MatrixRain />}
            </AnimatePresence>

            {/* IDLE TERMINAL OVERLAY */}
            <AnimatePresence>
                {idleActive && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="fixed inset-0 z-[99998] pointer-events-none"
                    >
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="absolute bottom-6 left-6 w-[280px] bg-black/90 border border-[#FF4500] p-4 font-mono text-[0.75rem] text-[#FF4500] flex flex-col gap-2 rounded-sm shadow-[0_0_20px_rgba(255,69,0,0.2)]"
                        >
                            <Typewriter lines={[
                                "> USER IDLE DETECTED",
                                "> RUNNING BACKGROUND PROCESS...",
                                "> training model on your curiosity...",
                                "> accuracy: 99.7%",
                                "> model deployed ✓"
                            ]} />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOAST NOTIFICATIONS */}
            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[99999] flex flex-col gap-2 pointer-events-none">
                <AnimatePresence>
                    {toasts.map((toast) => (
                        <motion.div
                            key={toast.id}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={`px-5 py-3 rounded-lg border backdrop-blur-[12px] bg-[#050508]/95 font-mono text-[0.8rem] text-white shadow-lg ${toast.type === "neural" ? "border-[#FF4500] shadow-[0_0_15px_rgba(255,69,0,0.3)]" : "border-[#00BFFF] shadow-[0_0_15px_rgba(0,191,255,0.3)]"
                                }`}
                        >
                            {toast.message}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </>
    );
}

// --- Helper Components --- //

function MatrixRain() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const terms = [
            "neural", "weights", "gradient", "epoch", "tensor",
            "backprop", "relu", "softmax", "opencv", "yolo",
            "lstm", "transformer"
        ];

        const fontSize = 16;
        const columns = Math.floor(canvas.width / fontSize);
        const drops = Array(columns).fill(1);

        // Assign random vertical starting points to simulate uneven rain start
        for (let i = 0; i < drops.length; i++) {
            drops[i] = Math.floor(Math.random() * -100);
        }

        // Pick random term for each drop
        const activeTerms = Array(columns).fill("").map(() => terms[Math.floor(Math.random() * terms.length)]);
        const charIndexes = Array(columns).fill(0);

        let animationFrame: number;

        const draw = () => {
            // Translucent black background for trail effect
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.fillStyle = "#39FF14"; // Matrix green
            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                const word = activeTerms[i];
                const charIdx = charIndexes[i];
                const text = word[charIdx];

                if (text && drops[i] > 0) {
                    ctx.fillText(text, i * fontSize, drops[i] * fontSize);
                    charIndexes[i] = (charIdx + 1) % word.length;
                }

                // Randomly reset top
                if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                    activeTerms[i] = terms[Math.floor(Math.random() * terms.length)];
                    charIndexes[i] = 0;
                }

                drops[i]++;
            }

            // Control speed
            setTimeout(() => {
                animationFrame = requestAnimationFrame(draw);
            }, 50);
        };

        draw();

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        window.addEventListener("resize", handleResize);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <motion.canvas
            ref={canvasRef}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-[99999] pointer-events-none mix-blend-screen"
        />
    );
}

function Typewriter({ lines }: { lines: string[] }) {
    const [displayed, setDisplayed] = useState<string[]>([]);

    useEffect(() => {
        let currentLine = 0;
        let currentChar = 0;
        let timeout: NodeJS.Timeout;

        const type = () => {
            if (currentLine >= lines.length) return;

            const fullLine = lines[currentLine];

            setDisplayed(prev => {
                const copy = [...prev];
                if (!copy[currentLine]) copy[currentLine] = "";
                copy[currentLine] = fullLine.substring(0, currentChar + 1);
                return copy;
            });

            currentChar++;

            if (currentChar > fullLine.length) {
                currentLine++;
                currentChar = 0;
                timeout = setTimeout(type, 300); // pause between lines
            } else {
                timeout = setTimeout(type, 30); // typing speed
            }
        };

        type();

        return () => clearTimeout(timeout);
    }, [lines]);

    return (
        <>
            {displayed.map((line, i) => {
                // Find if line has "deployed" in it for green styling check
                if (line.includes("deployed")) {
                    return (
                        <span key={i}>
                            {line.includes("✓") ? (
                                <>
                                    <span>{line.replace("✓", "")}</span>
                                    <span className="text-green-500">✓</span>
                                </>
                            ) : line}
                        </span>
                    )
                }
                return <span key={i}>{line}</span>;
            })}
        </>
    );
}

// Global Toast Emitter utility
export const emitToast = (message: string, type: "neural" | "glitch" = "neural") => {
    window.dispatchEvent(new CustomEvent("trigger-toast", { detail: { message, type } }));
};
