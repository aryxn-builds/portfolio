"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useSpring, useTransform, useMotionValue } from "framer-motion";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface SpotlightProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: number;
    springOptions?: {
        stiffness?: number;
        damping?: number;
        mass?: number;
    };
}

export function Spotlight({
    className,
    size = 200,
    springOptions = { stiffness: 26.7, damping: 4.1, mass: 0.2 },
    ...rest
}: SpotlightProps) {
    const ref = useRef<HTMLDivElement>(null);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    const smoothX = useSpring(mouseX, springOptions);
    const smoothY = useSpring(mouseY, springOptions);

    const [isMounted, setIsMounted] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Detect touch devices to disable the spotlight
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    useEffect(() => {
        if (typeof window !== "undefined" && "ontouchstart" in window) {
            setIsTouchDevice(true);
        }
    }, []);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (isTouchDevice) return;

        setIsHovered(true);

        const currentTarget = e.currentTarget;
        const rect = currentTarget.getBoundingClientRect();

        // Ensure Spotlight stays bounded correctly within parent. 
        // Parent must be position relative and have hidden overflow for the glow to hit the edges smoothly.
        const xPos = e.clientX - rect.left - size / 2;
        const yPos = e.clientY - rect.top - size / 2;

        mouseX.set(xPos);
        mouseY.set(yPos);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    if (isTouchDevice || !isMounted) {
        return null;
    }

    return (
        <div
            className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[inherit]"
        >
            <div
                className="absolute inset-0 w-full h-full z-0 pointer-events-auto"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                onTouchStart={() => setIsTouchDevice(true)}
            />

            <motion.div
                ref={ref}
                className={cn(
                    "absolute pointer-events-none rounded-full blur-2xl transition-opacity duration-300",
                    isHovered ? "opacity-100" : "opacity-0",
                    className
                )}
                style={{
                    width: size,
                    height: size,
                    x: smoothX,
                    y: smoothY,
                    // Use a subtle radial gradient as the base fallback if className missing gradients
                    background: !className?.includes("from-") ?
                        "radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)" : undefined,
                }}
                {...(rest as any)}
            />
        </div>
    );
}
