"use client";

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CAPTIONS = [
    <>I don't just write code. I build <span className="text-[#FF4500] drop-shadow-[0_0_12px_#FF4500]">intelligence</span>.</>,
    <>I build things that <span className="text-[#00BFFF] drop-shadow-[0_0_12px_#00BFFF]">think</span>.</>,
    <>Designing systems that <span className="text-[#FF4500] drop-shadow-[0_0_12px_#FF4500]">learn</span>.</>
];

export default function ScrollingCaptions() {
    const [activeIndex, setActiveIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Hero section is h-[120vh], we map scroll progress over that area.
        const trigger = ScrollTrigger.create({
            trigger: document.body,
            start: "top top",
            end: "120vh top",
            onUpdate: (self) => {
                const progress = self.progress;
                if (progress < 0.33) {
                    setActiveIndex(0);
                } else if (progress < 0.66) {
                    setActiveIndex(1);
                } else {
                    setActiveIndex(2);
                }
            }
        });

        return () => {
            trigger.kill();
        };
    }, []);

    return (
        <motion.div
            ref={containerRef}
            className="relative flex flex-col items-center justify-center min-h-[3rem] w-full mt-4 overflow-hidden pointer-events-none"
            // Initial fade-in delay per spec: 0.8s duration, 1.5s delay
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.5, ease: "easeOut" }}
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeIndex}
                    initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -20, filter: "blur(6px)" }}
                    transition={{
                        duration: 0.5,
                        ease: "easeOut"
                    }}
                    className="absolute flex items-center justify-center gap-4 w-full text-center"
                >
                    <div className="hidden md:block w-[30px] h-[1px] bg-white/20" />

                    <span
                        className="font-display font-light italic tracking-widest text-[clamp(0.85rem,3.5vw,1.2rem)] md:text-[clamp(0.95rem,2vw,1.2rem)] text-white/75"
                    >
                        {CAPTIONS[activeIndex]}
                    </span>

                    <div className="hidden md:block w-[30px] h-[1px] bg-white/20" />
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
