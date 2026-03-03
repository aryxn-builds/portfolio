"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface TiltProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    rotationFactor?: number;
    isRevese?: boolean;
    springOptions?: {
        stiffness?: number;
        damping?: number;
        mass?: number;
    };
}

export function Tilt({
    children,
    className,
    rotationFactor = 15,
    isRevese = false,
    springOptions = { stiffness: 26.7, damping: 4.1, mass: 0.2 },
    style,
    ...rest
}: TiltProps) {
    const ref = useRef<HTMLDivElement>(null);

    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, springOptions);
    const mouseYSpring = useSpring(y, springOptions);

    const rotateX = useTransform(
        mouseYSpring,
        [-0.5, 0.5],
        isRevese ? [rotationFactor, -rotationFactor] : [-rotationFactor, rotationFactor]
    );
    const rotateY = useTransform(
        mouseXSpring,
        [-0.5, 0.5],
        isRevese ? [-rotationFactor, rotationFactor] : [rotationFactor, -rotationFactor]
    );

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!ref.current) return;

        const rect = ref.current.getBoundingClientRect();

        const width = rect.width;
        const height = rect.height;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
    };

    // Detect touch devices to disable the effect smoothly.
    const [isTouchDevice, setIsTouchDevice] = useState(false);
    useEffect(() => {
        if (typeof window !== "undefined" && "ontouchstart" in window) {
            setIsTouchDevice(true);
        }
    }, []);

    // Also disable gracefully if touch events fire.
    const handleTouchStart = () => {
        setIsTouchDevice(true);
        handleMouseLeave();
    }

    if (isTouchDevice) {
        return (
            <div className={cn("relative", className)} style={style} {...rest}>
                {children}
            </div>
        );
    }

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onTouchStart={handleTouchStart}
            style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
                ...style
            }}
            className={cn("relative will-change-transform", className)}
            {...(rest as any)}
        >
            {children}
        </motion.div>
    );
}
