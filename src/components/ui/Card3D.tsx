"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Tilt } from "./tilt";
import { Spotlight } from "./spotlight";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Global Theme Overrides
export const THEMES = {
    orange: "from-[#FF4500] via-[#FF6B00] to-[#CC3700]",
    blue: "from-[#0044BB] via-[#0066CC] to-[#003399]",
    dark: "from-[#0A0A0F] via-[#0D0D15] to-[#050508]",
    orange_dark: "from-[#FF4500] via-[#1A0A00] to-[#050508]",
    blue_dark: "from-[#00BFFF] via-[#001A33] to-[#050508]",
} as const;

type ThemeKey = keyof typeof THEMES;

export interface Card3DProps {
    title: React.ReactNode;
    description: React.ReactNode;
    icon: React.ElementType<{ size?: number; className?: string }>;
    theme?: ThemeKey;
    gradient?: string;
    size?: "sm" | "md" | "lg";
    variant?: "premium" | "minimal";
    animated?: boolean;
    disabled?: boolean;
    children?: React.ReactNode;
    onClick?: () => void;
    className?: string;
}

export function Card3D({
    title,
    description,
    icon: Icon,
    theme = "orange",
    gradient,
    size = "md",
    variant = "premium",
    animated = true,
    disabled = false,
    children,
    onClick,
    className
}: Card3DProps) {
    const isOrange = theme.includes("orange");
    const isBlue = theme.includes("blue");

    // Derived styling logic from rules
    const pulseColor = isOrange ? "bg-[#FF4500]" : isBlue ? "bg-[#00BFFF]" : "bg-white/50";
    const shimmerColor = isOrange ? "rgba(255,100,0,0.15)" : isBlue ? "rgba(0,191,255,0.15)" : "rgba(255,255,255,0.1)";
    const glowShadow = isOrange ? "hover:shadow-[0_0_40px_rgba(255,69,0,0.2)]" : isBlue ? "hover:shadow-[0_0_40px_rgba(0,191,255,0.15)]" : "";
    const borderIdle = isOrange ? "border-[#FF6400]/25" : isBlue ? "border-[#00BFFF]/25" : "border-white/10";
    const borderHover = isOrange ? "group-hover:border-[#FF6400]/70" : isBlue ? "group-hover:border-[#00BFFF]/70" : "group-hover:border-white/30";

    const iconColor = isOrange ? "text-[#FF6600]" : isBlue ? "text-[#00BFFF]" : "text-white";
    const iconHover = "group-hover:text-[#00BFFF]"; // Icon changes to blue on hover always
    const iconBg = "bg-[#FF6400]/10 border-[#FF6400]/30"; // Global icon bg rule

    // Handle responsive sizing
    const sizeClasses = {
        sm: "p-4 md:p-6 min-h-[220px]",
        md: "p-6 md:p-8 min-h-[280px]",
        lg: "p-8 md:p-10 min-h-[340px]"
    };

    // Responsive 3D Tilt detection
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const enableTilt = !disabled && !isMobile;

    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    // Base card content wrapper
    const CardContent = () => (
        <div
            className={cn(
                "relative flex flex-col h-full overflow-hidden transition-all duration-500 rounded-2xl cursor-pointer group",
                // ALL CARD BACKGROUNDS
                "bg-[#050508]/[0.88] backdrop-blur-[20px] border",
                borderIdle,
                borderHover,
                glowShadow,
                sizeClasses[size],
                className
            )}
            onClick={onClick}
        >
            {/* Spotlight Edge Glow mapped to gradient */}
            <Spotlight
                className="z-0 brightness-150 group-hover:brightness-200 transition-all duration-700"
                size={isMobile ? 180 : 250}
                style={{
                    background: `radial-gradient(circle, ${isOrange ? 'rgba(255,69,0,0.15)' : 'rgba(0,191,255,0.15)'} 0%, transparent 60%)`
                }}
            />

            {/* Shimmer Effect */}
            <div
                className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `linear-gradient(105deg, transparent 20%, ${shimmerColor} 50%, transparent 80%)` }}
            />

            <div className="relative z-10 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div className={cn("p-3 rounded-xl border flex-shrink-0 transition-colors duration-300", iconBg)}>
                        <Icon size={variant === "premium" ? 28 : 20} className={cn("transition-colors duration-300", iconColor, iconHover)} />
                    </div>

                    {/* Pulse Dot */}
                    {variant === "premium" && (
                        <div className="relative flex h-3 w-3 mt-1 mr-1">
                            <span className={cn("animate-ping absolute inline-flex h-full w-full rounded-full opacity-75", pulseColor)}></span>
                            <span className={cn("relative inline-flex rounded-full h-3 w-3", pulseColor)}></span>
                        </div>
                    )}
                </div>

                {/* Text Core */}
                <div className="flex-grow space-y-3">
                    <h3 className={cn(
                        "text-white font-bold leading-tight",
                        variant === "premium" ? "text-2xl md:text-3xl font-display" : "text-lg font-mono"
                    )}>
                        {title}
                    </h3>
                    <p className={cn(
                        "text-white/[0.65] font-light leading-relaxed",
                        variant === "premium" ? "text-base md:text-lg" : "text-sm"
                    )}>
                        {description}
                    </p>
                </div>

                {/* Overlaid Extra Children (Tags, Custom Links) */}
                <div className="mt-6">
                    {children}
                </div>

                {/* Explore Link (Only in Premium variant if children aren't providing custom links) */}
                {variant === "premium" && !children && (
                    <div className="mt-8 flex items-center gap-2 text-[#FF4500] font-mono text-sm tracking-widest uppercase opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ease-out">
                        <span>Explore Component</span>
                        <span className="text-lg leading-none">↗</span>
                    </div>
                )}
            </div>
        </div>
    );

    // Initial load animation if needed
    const content = enableTilt ? (
        <Tilt
            rotationFactor={25}
            isRevese={false} // Match standard 3D lift rules
            springOptions={{ stiffness: 400, damping: 35, mass: 0.8 }}
            className="w-full h-full"
            style={{ transformStyle: 'preserve-3d' }}
        >
            <div style={{ transform: 'translateZ(30px)' }} className="w-full h-full">
                <CardContent />
            </div>
        </Tilt>
    ) : (
        <CardContent />
    );

    if (animated) {
        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
                transition={{ duration: 0.8, ease: "easeOut" as any }}
                className="w-full h-full"
            >
                {content}
            </motion.div>
        );
    }

    return (
        <div className="w-full h-full">
            {content}
        </div>
    );
}

// Responsive Grid Wrapper for Cards
export interface Card3DListProps {
    columns?: 1 | 2 | 3;
    gap?: "sm" | "md" | "lg";
    staggerDelay?: number;
    children: React.ReactNode;
    className?: string;
}

export function Card3DList({
    columns = 2,
    gap = "md",
    staggerDelay = 0.1,
    children,
    className
}: Card3DListProps) {
    const gapClasses = {
        sm: "gap-4",
        md: "gap-6 md:gap-8",
        lg: "gap-6 md:gap-10 lg:gap-12"
    };

    const colClasses = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
    };

    return (
        <div className={cn(
            "grid w-full",
            colClasses[columns],
            gapClasses[gap],
            className
        )}>
            {React.Children.map(children, (child, i) => {
                if (!React.isValidElement(child)) return child;

                // If it's an animated element, we can inject staggered delays inline
                // but since Card3D handles its own InView animations, we rely on scroll trigger staggering 
                return child;
            })}
        </div>
    );
}
