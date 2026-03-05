"use client";

import React, { useState, useEffect } from "react";
import { Download, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingResumeButton() {
    const [downloading, setDownloading] = useState(false);

    // Handle click state transition
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        // Let the native href download happen, just handle the visual state
        if (!downloading) {
            setDownloading(true);
            setTimeout(() => {
                setDownloading(false);
            }, 2000);
        }
    };

    return (
        <div className="fixed bottom-[16px] right-[16px] md:bottom-8 md:right-8 z-[9999] flex items-center justify-center">
            {/* Background Pulse Animation */}
            <motion.div
                animate={{
                    scale: [1, 1.5],
                    opacity: [0.4, 0],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeOut",
                }}
                className="absolute inset-0 rounded-full bg-[#FF4500] pointer-events-none"
            />

            <motion.a
                href="/resume/aryan-yadav-resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download
                onClick={handleClick}
                initial={false}
                whileHover={{
                    scale: 1.05,
                    backgroundColor: "rgba(255, 69, 0, 0.15)",
                    borderColor: "rgba(255, 69, 0, 1)",
                    boxShadow: "0 0 25px rgba(255, 69, 0, 0.4), 0 0 50px rgba(255, 69, 0, 0.2)",
                }}
                whileTap={{ scale: 0.97 }}
                className={`
          relative flex items-center justify-center gap-2 
          h-[40px] md:h-[44px] min-w-[44px] px-4 md:px-5 
          rounded-full backdrop-blur-[12px] 
          border transition-all duration-300 ease-out cursor-pointer touch-manipulation
          ${downloading
                        ? "bg-rgba(5,5,8,0.9) border-[#00BFFF] shadow-[0_0_15px_rgba(0,191,255,0.3)] text-[#00BFFF]"
                        : "bg-[rgba(5,5,8,0.9)] border-[#FF4500]/60 shadow-[0_0_15px_rgba(255,69,0,0.2)] text-white"
                    }
        `}
            >
                <AnimatePresence mode="wait">
                    {downloading ? (
                        <motion.div
                            key="downloading"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                        >
                            <CheckCircle size={16} className="text-[#00BFFF]" />
                            <span className="font-mono text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.15em] whitespace-nowrap">
                                DOWNLOADING...
                            </span>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="idle"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="flex items-center gap-2"
                        >
                            <Download size={16} className="text-[#FF4500]" />
                            <span className="font-mono text-[0.65rem] md:text-[0.7rem] uppercase tracking-[0.15em] whitespace-nowrap">
                                RESUME
                            </span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.a>
        </div>
    );
}
