"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useInView } from 'framer-motion';
import { Eye, Mic, FileSearch, Activity, Brain, Layers, Grid, List, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const CARDS = [
    {
        id: "1",
        title: "Vision Transformer (ViT) Explorer",
        description: "Real-time object detection and segmentation pipeline utilizing optimized Vision Transformers.",
        icon: Eye,
        tags: ["PyTorch", "OpenCV", "React"],
        link: "https://github.com",
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "2",
        title: "Neural Voice Synthesizer",
        description: "Zero-shot voice cloning capabilities leveraging autoregressive transformers and diffusion models.",
        icon: Mic,
        tags: ["FastAPI", "CUDA", "Python"],
        link: "https://github.com",
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "3",
        title: "GenAI Document Intelligence",
        description: "Intelligent document parsing and question answering using large language models and RAG pipeline.",
        icon: FileSearch,
        tags: ["LangChain", "OpenAI", "FastAPI"],
        link: "https://github.com",
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "4",
        title: "Real-Time Pose Estimator",
        description: "Human pose estimation and gesture recognition using MediaPipe and CVZone with 30fps performance.",
        icon: Activity,
        tags: ["MediaPipe", "CVZone", "Python"],
        link: "https://github.com",
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "5",
        title: "Sentiment Analysis Engine",
        description: "Multi-class sentiment classification on social media data using fine-tuned BERT and LSTM models.",
        icon: Brain,
        tags: ["BERT", "LSTM", "Scikit-Learn"],
        link: "https://github.com",
        linkLabel: "ACCESS REPOSITORY ↗"
    }
];

type LayoutMode = 'stack' | 'grid' | 'list';

export default function MorphingCardStack() {
    const [layout, setLayout] = useState<LayoutMode>('stack');
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: "-10%" });
    const [hasEntered, setHasEntered] = useState(false);

    useEffect(() => {
        if (isInView && !hasEntered) {
            setHasEntered(true);
        }
    }, [isInView, hasEntered]);

    const handleDragEnd = (e: any, info: PanInfo) => {
        if (layout !== 'stack') return;
        const threshold = 50;
        if (info.offset.x < -threshold) {
            setCurrentIndex((prev) => (prev + 1) % CARDS.length);
        } else if (info.offset.x > threshold) {
            setCurrentIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
        }
    };

    return (
        <div ref={containerRef} className="w-full flex flex-col items-center justify-center max-w-6xl mx-auto">
            {/* Layout Toggle Buttons */}
            <div className="flex items-center justify-center gap-3 mb-10 z-20">
                <button
                    onClick={() => setLayout('stack')}
                    className={cn(
                        "p-2.5 rounded-lg border transition-all duration-300",
                        layout === 'stack'
                            ? "bg-[#FF4500]/20 border-[#FF4500] text-[#FF4500]"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10"
                    )}
                    aria-label="Stack view"
                >
                    <Layers size={20} />
                </button>
                <button
                    onClick={() => setLayout('grid')}
                    className={cn(
                        "p-2.5 rounded-lg border transition-all duration-300",
                        layout === 'grid'
                            ? "bg-[#FF4500]/20 border-[#FF4500] text-[#FF4500]"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10"
                    )}
                    aria-label="Grid view"
                >
                    <Grid size={20} />
                </button>
                <button
                    onClick={() => setLayout('list')}
                    className={cn(
                        "p-2.5 rounded-lg border transition-all duration-300",
                        layout === 'list'
                            ? "bg-[#FF4500]/20 border-[#FF4500] text-[#FF4500]"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10"
                    )}
                    aria-label="List view"
                >
                    <List size={20} />
                </button>
            </div>

            {/* Cards Container */}
            <div
                className={cn(
                    "relative w-full z-10 transition-all duration-700 ease-in-out",
                    layout === 'stack' ? "h-[400px] md:h-[350px] xl:h-[400px] flex items-center justify-center" : "",
                    layout === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 w-full" : "",
                    layout === 'list' ? "flex flex-col gap-6 max-w-[600px] w-full mx-auto" : ""
                )}
            >
                <AnimatePresence>
                    {CARDS.map((card, index) => {
                        const stackPos = (index - currentIndex + CARDS.length) % CARDS.length;
                        const isTop = stackPos === 0;

                        // Compute blue/orange split based on index (1-indexed for logic match: 1,3,5=blue, 2,4=orange)
                        const isOdd = parseInt(card.id) % 2 !== 0;
                        const linkColorClass = isOdd ? "text-[#00BFFF] hover:text-[#FF4500]" : "text-[#FF4500] hover:text-[#00BFFF]";

                        return (
                            <motion.div
                                key={card.id}
                                layout
                                drag={layout === 'stack' && isTop ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={handleDragEnd}
                                initial={{ y: 150, opacity: 0 }}
                                animate={
                                    !isInView
                                        ? { y: 150, opacity: 0 }
                                        : layout === 'stack'
                                            ? {
                                                scale: 1 - stackPos * 0.05,
                                                y: stackPos * 10,
                                                x: stackPos * 10,
                                                rotate: stackPos === 0 ? 0 : stackPos % 2 === 0 ? 3 : -3,
                                                zIndex: CARDS.length - stackPos,
                                                opacity: stackPos < 4 ? (stackPos === 0 ? 1 : 0.6) : 0, // Top full opacity, behind 0.6
                                            }
                                            : {
                                                scale: 1,
                                                y: 0,
                                                x: 0,
                                                rotate: 0,
                                                zIndex: 1,
                                                opacity: 1,
                                            }
                                }
                                transition={{
                                    type: "spring",
                                    stiffness: 260,
                                    damping: 25,
                                    mass: 0.8,
                                    delay: !hasEntered && isInView ? index * 0.1 : 0, // Staggered entry from bottom
                                }}
                                whileHover={
                                    layout !== 'stack' || isTop
                                        ? { y: -4, scale: 1.02, transition: { duration: 0.2 } }
                                        : {}
                                }
                                whileTap={layout === 'stack' && isTop ? { cursor: 'grabbing', scale: 0.98 } : {}}
                                className={cn(
                                    "group relative overflow-hidden bg-[rgba(8,8,12,0.85)] border border-[rgba(255,100,0,0.25)] rounded-[16px] backdrop-blur-[20px] shadow-[0_0_30px_rgba(255,69,0,0.1),0_0_60px_rgba(0,0,0,0.5)] transition-colors duration-300",
                                    "hover:border-[rgba(255,100,0,0.6)] hover:shadow-[0_0_30px_rgba(255,69,0,0.25),0_0_30px_rgba(0,191,255,0.1)]",
                                    layout === 'stack' && "absolute w-[calc(100vw-48px)] md:w-[380px] xl:w-[480px] h-auto min-h-[220px] md:h-[260px] xl:h-[280px] origin-top",
                                    layout === 'grid' && "w-full h-full min-h-[240px]",
                                    layout === 'list' && "w-full"
                                )}
                                style={{
                                    cursor: layout === 'stack' ? (isTop ? 'grab' : 'auto') : 'pointer',
                                }}
                            >
                                {/* Expand Ring Highlight Effect on Click/Hover combined via shadow handled in classes above */}

                                <div
                                    className={cn(
                                        "p-6 md:p-8 flex flex-col h-full",
                                        layout === 'list' && "md:flex-row gap-6 md:gap-8 active:scale-[0.98] md:items-center"
                                    )}
                                >
                                    {/* Header: Icon & Title */}
                                    <div
                                        className={cn(
                                            "flex items-start gap-4 mb-4",
                                            layout === 'list' && "md:w-5/12 md:mb-0 md:flex-col md:justify-center"
                                        )}
                                    >
                                        <div className="shrink-0 p-3 rounded-[10px] bg-[rgba(255,100,0,0.1)] border border-[rgba(255,100,0,0.3)] text-[#FF6600] group-hover:text-[#00BFFF] transition-colors duration-400">
                                            <card.icon size={26} />
                                        </div>
                                        <h3 className="text-[1.3rem] font-bold font-display text-white leading-tight">
                                            {card.title}
                                        </h3>
                                    </div>

                                    {/* Body: Description & Tags */}
                                    <div
                                        className={cn(
                                            "flex flex-col grow",
                                            layout === 'list' && "md:w-7/12 md:justify-center"
                                        )}
                                    >
                                        <p className="text-[0.9rem] text-[rgba(255,255,255,0.65)] font-sans leading-[1.6] mb-5 xl:mb-6 min-h-[3rem]">
                                            {card.description}
                                        </p>

                                        <div className="flex flex-wrap gap-2 mb-6 xl:mb-8">
                                            {card.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[0.75rem] font-mono px-[12px] py-[4px] rounded-[6px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.8)] whitespace-nowrap"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="mt-auto">
                                            <a
                                                href={card.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    "inline-flex items-center gap-2 text-[0.8rem] font-mono tracking-[0.15em] uppercase transition-colors duration-300",
                                                    linkColorClass
                                                )}
                                                onClick={(e) => {
                                                    if (layout === 'stack' && !isTop) e.preventDefault();
                                                }}
                                            >
                                                [ ACCESS REPOSITORY ] <ExternalLink size={14} />
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Navigation Dots & Swipe hint (only in stack mode) */}
            <AnimatePresence>
                {layout === 'stack' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className="flex flex-col items-center mt-12 gap-5 z-20"
                    >
                        <div className="flex gap-2.5">
                            {CARDS.map((_, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={cn(
                                        "h-2 rounded-full transition-all duration-300",
                                        idx === currentIndex
                                            ? "w-4 bg-[#FF4500]"
                                            : "w-2 bg-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.5)]"
                                    )}
                                    aria-label={`Go to card ${idx + 1}`}
                                />
                            ))}
                        </div>
                        <p className="text-[0.7rem] font-mono text-[rgba(255,100,0,0.4)] tracking-wider">
                            SWIPE TO NAVIGATE
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
