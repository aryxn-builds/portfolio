"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export type CardStackItem = {
    id: string;
    title: string;
    description: string;
    href: string;
    imageSrc: string;
    // Make it flexible so caller can pass whatever they need
    [key: string]: any;
};

export type CardStackProps = {
    items: CardStackItem[];
    cardWidth?: number | string;
    cardHeight?: number | string;
    overlap?: number;
    spreadDeg?: number;
    perspectivePx?: number;
    depthPx?: number;
    tiltXDeg?: number;
    activeLiftPx?: number;
    activeScale?: number;
    inactiveScale?: number;
    springStiffness?: number;
    springDamping?: number;
    loop?: boolean;
    autoAdvance?: boolean;
    pauseOnHover?: boolean;
    showDots?: boolean;
    initialIndex?: number;
    hideInactiveCards?: boolean;
    renderCard?: (item: CardStackItem, isActive: boolean) => React.ReactNode;
};

export default function CardStack({
    items,
    cardWidth = 520,
    cardHeight = 320,
    overlap = 0.48,
    spreadDeg = 48,
    perspectivePx = 1100,
    depthPx = 140,
    tiltXDeg = 12,
    activeLiftPx = 22,
    activeScale = 1.03,
    inactiveScale = 0.94,
    springStiffness = 280,
    springDamping = 28,
    loop = true,
    autoAdvance = false,
    pauseOnHover = true,
    showDots = true,
    initialIndex = 0,
    hideInactiveCards = false,
    renderCard,
}: CardStackProps) {
    const [activeIndex, setActiveIndex] = useState(initialIndex);
    const [isHovered, setIsHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Default rendering if none provided
    const defaultRenderCard = (item: CardStackItem, isActive: boolean) => (
        <div
            className={cn(
                "relative w-full h-full overflow-hidden transition-all duration-300",
                "bg-[rgba(8,8,12,0.88)] backdrop-blur-[20px] rounded-[16px]",
                isActive
                    ? "border-2 border-[rgba(255,100,0,0.6)] shadow-[0_0_30px_rgba(255,69,0,0.25),0_0_60px_rgba(0,0,0,0.5)]"
                    : "border border-[rgba(255,100,0,0.25)] shadow-lg"
            )}
        >
            <img
                src={item.imageSrc}
                alt={item.title}
                className="absolute inset-0 w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 w-full p-5 md:p-6 text-left flex flex-col justify-end content-end">
                <h3 className="font-display text-[clamp(1rem,4vw,1.3rem)] md:text-xl font-bold text-white mb-2 line-clamp-2 md:line-clamp-none">
                    {item.title}
                </h3>
                <p className="font-sans text-[clamp(0.8rem,3vw,0.95rem)] md:text-sm text-[rgba(255,255,255,0.65)] line-clamp-3 md:line-clamp-2">
                    {item.description}
                </p>
            </div>
        </div>
    );

    const mergedRenderCard = renderCard || defaultRenderCard;

    // Auto-advance logic
    useEffect(() => {
        if (!autoAdvance) return;
        if (pauseOnHover && isHovered) return;

        const timer = setInterval(() => {
            setActiveIndex((prev) => (loop ? (prev + 1) % items.length : Math.min(prev + 1, items.length - 1)));
        }, 4000); // hardcoded delay, could be a prop

        return () => clearInterval(timer);
    }, [autoAdvance, isHovered, items.length, loop, pauseOnHover]);

    const handleDragEnd = (_: any, info: PanInfo) => {
        const threshold = 50;
        if (info.offset.x < -threshold) {
            // Swiped left -> NEXT card
            setActiveIndex((prev) => (loop ? (prev + 1) % items.length : Math.min(prev + 1, items.length - 1)));
        } else if (info.offset.x > threshold) {
            // Swiped right -> PREV card
            setActiveIndex((prev) => (loop ? (prev - 1 + items.length) % items.length : Math.max(prev - 1, 0)));
        }
    };

    const handleCardClick = (index: number) => {
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative flex flex-col items-center justify-center w-full"
            style={{
                perspective: `${perspectivePx}px`,
                // Ensures there's enough space vertically for the scaled/lifted cards plus rotation
                minHeight: typeof cardHeight === "number" ? cardHeight * 1.5 : "400px",
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div
                className="relative flex items-center justify-center w-full"
                style={{
                    width: typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth,
                    height: typeof cardHeight === "number" ? `${cardHeight}px` : cardHeight,
                    // Give stack an overall tilt if desired
                    transformStyle: "preserve-3d",
                    transform: `rotateX(${tiltXDeg}deg)`,
                }}
            >
                <AnimatePresence mode="popLayout">
                    {items.map((item, index) => {
                        // Find distance from active index
                        // Handled efficiently with modular arithmetic for the loop
                        let distance = index - activeIndex;

                        // Normalize distance for looped rendering
                        if (loop) {
                            const half = Math.floor(items.length / 2);
                            if (distance > half) distance -= items.length;
                            if (distance < -half) distance += items.length;
                        }

                        const isActive = distance === 0;

                        // Spread mapping properties based on `distance`
                        // Example:
                        // x: spread off center (distance * overlap * width) -> adjusting spreadDeg gives it fan effect
                        // rZ: rotation on Z axis
                        // z: depth on Z axis -> further back the larger the abs(distance)

                        // To create fan arc, we translate X, but translate Y * down * as distance increases 
                        // OR simply rotate around a lower origin. Using simple rotations + translated origin 
                        // is usually cleaner for fanning.

                        // Using origin-bottom center for a nice hand-fan arc
                        const rotZ = distance * (spreadDeg / Math.max(items.length - 1, 1));
                        const yOffset = isActive ? -activeLiftPx : Math.abs(distance) * (typeof cardHeight === "number" ? cardHeight * 0.05 : 15);
                        // X offset helps shift them left/right along the arc slightly if overlap is tight
                        const xOffset = distance * (typeof cardWidth === "number" ? cardWidth * (1 - overlap) : 100);
                        const zOffset = isActive ? 100 : -(Math.abs(distance) * depthPx);
                        const scale = isActive ? activeScale : inactiveScale;

                        // Faded opacity for very far back cards
                        const opacity = isActive ? 1 : Math.max(1 - (Math.abs(distance) * 0.25), 0);

                        if (hideInactiveCards && !isActive) return null;

                        // Inactive cards can be clicked or swiped to
                        // Drag constraints only tight along x to simulate swipe
                        return (
                            <motion.div
                                key={item.id}
                                layout
                                drag={isActive ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={handleDragEnd}
                                onClick={() => handleCardClick(index)}
                                initial={{ opacity: 0, y: 150 }}
                                animate={{
                                    opacity,
                                    x: xOffset,
                                    y: yOffset,
                                    z: zOffset,
                                    rotateZ: rotZ,
                                    scale,
                                    zIndex: items.length - Math.abs(distance),
                                }}
                                transition={{
                                    type: "spring",
                                    stiffness: springStiffness,
                                    damping: springDamping,
                                    mass: 0.8,
                                }}
                                className={cn(
                                    "absolute origin-bottom cursor-pointer select-none touch-pan-y",
                                    isActive && "cursor-grab active:cursor-grabbing"
                                )}
                                style={{
                                    width: typeof cardWidth === "number" ? `${cardWidth}px` : cardWidth,
                                    height: typeof cardHeight === "number" ? `${cardHeight}px` : cardHeight,
                                }}
                            >
                                {mergedRenderCard(item, isActive)}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Navigation Dots below */}
            {showDots && (
                <div className="flex flex-col items-center mt-5 md:mt-12 mb-4 gap-3 md:gap-4 z-20" style={{ transform: `translateZ(100px)` }}>
                    <div className="flex items-center gap-3 h-[44px]">
                        {items.map((item, idx) => (
                            <React.Fragment key={idx}>
                                <button
                                    onClick={() => handleCardClick(idx)}
                                    className={cn(
                                        "h-[6px] md:h-[8px] rounded-full transition-all duration-300",
                                        idx === activeIndex
                                            ? "w-[14px] md:w-[16px] bg-[#FF4500]"
                                            : "w-[6px] md:w-[8px] bg-[rgba(255,255,255,0.2)] bg-opacity-30 hover:bg-[rgba(255,255,255,0.5)] m-1"
                                    )}
                                    aria-label={`Go to card ${item.title}`}
                                />
                            </React.Fragment>
                        ))}
                    </div>
                    <p className="text-[0.65rem] md:text-[0.7rem] font-mono text-[rgba(255,100,0,0.4)] tracking-[0.2em] uppercase">
                        SWIPE TO NAVIGATE
                    </p>
                </div>
            )}
        </div>
    );
}
