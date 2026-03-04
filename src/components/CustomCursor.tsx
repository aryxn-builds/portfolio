"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion, useMotionValue, useSpring, AnimatePresence } from "framer-motion";

type HoverState = "default" | "clickable" | "text" | "canvas";

export function CustomCursor() {
    const [isTouchDevice, setIsTouchDevice] = useState(true); // Default true to avoid flash on mobile
    const [hoverState, setHoverState] = useState<HoverState>("default");
    const [isClicking, setIsClicking] = useState(false);

    // Raw mouse coordinates
    const mouseX = useMotionValue(-100);
    const mouseY = useMotionValue(-100);

    // Smooth springs for the ring (stiffness: 150, damping: 15)
    const springX = useSpring(mouseX, { stiffness: 150, damping: 15 });
    const springY = useSpring(mouseY, { stiffness: 150, damping: 15 });

    // Trails array
    const [trails, setTrails] = useState<{ id: number; x: number; y: number }[]>([]);
    const trailCounter = useRef(0);
    const lastMousePos = useRef({ x: -100, y: -100, time: 0 });

    useEffect(() => {
        // Check if device supports hover
        const checkTouch = window.matchMedia("(hover: none)").matches;
        setIsTouchDevice(checkTouch);

        if (checkTouch) return;

        // We only enable custom cursor if mouse is detected
        document.body.classList.add("custom-cursor-enabled");

        const handleMouseMove = (e: MouseEvent) => {
            // Update motion values
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);

            // Check velocity for trails
            const now = performance.now();
            const dt = now - lastMousePos.current.time;
            const dx = e.clientX - lastMousePos.current.x;
            const dy = e.clientY - lastMousePos.current.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // If moving fast enough (dist > 5px in a frame or two)
            if (dt > 16 && distance > 5) {
                setTrails((prev) => {
                    const newTrail = { id: trailCounter.current++, x: e.clientX, y: e.clientY };
                    return [...prev.slice(-3), newTrail]; // Keep max 4 items
                });
            }

            lastMousePos.current = { x: e.clientX, y: e.clientY, time: now };

            // Determine hover state
            const target = e.target as HTMLElement;

            if (!target) return;

            const isCanvas = target.tagName.toLowerCase() === "canvas";
            const isClickable = target.closest("a, button, [role=button], .card, .orbital-node");
            const isText = target.closest("p, h1, h2, h3, h4, h5, h6, span, li");

            if (isCanvas) {
                setHoverState("canvas");
            } else if (isClickable) {
                setHoverState("clickable");
            } else if (isText) {
                setHoverState("text");
            } else {
                setHoverState("default");
            }
        };

        const handleMouseDown = () => setIsClicking(true);
        const handleMouseUp = () => setIsClicking(false);

        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        window.addEventListener("mousedown", handleMouseDown, { passive: true });
        window.addEventListener("mouseup", handleMouseUp, { passive: true });

        return () => {
            document.body.classList.remove("custom-cursor-enabled");
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mousedown", handleMouseDown);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [mouseX, mouseY]);

    // Clean up old trails
    useEffect(() => {
        if (trails.length > 0) {
            const timer = setTimeout(() => {
                setTrails((prev) => prev.slice(1));
            }, 300); // Fades over 300ms
            return () => clearTimeout(timer);
        }
    }, [trails]);

    if (isTouchDevice) return null;

    // Variants map
    const dotVariants = {
        default: {
            width: 6,
            height: 6,
            backgroundColor: "rgba(255, 255, 255, 1)",
        },
        clickable: {
            width: 0,
            height: 0,
            backgroundColor: "rgba(255, 255, 255, 1)",
        },
        text: {
            width: 2,
            height: 18,
            backgroundColor: "rgba(255, 255, 255, 0.6)",
            borderRadius: 2,
        },
        canvas: {
            width: 6,
            height: 6,
            backgroundColor: "rgba(255, 255, 255, 1)",
        },
        clicking: {
            width: 10,
            height: 10,
            backgroundColor: "#FF4500", // Brief orange flash
        },
    };

    const ringVariants = {
        default: {
            width: 32,
            height: 32,
            borderColor: "#FF4500",
            backgroundColor: "rgba(0,0,0,0)",
            borderWidth: 1.5,
            boxShadow: "0 0 0 rgba(0,0,0,0)",
        },
        clickable: {
            width: 48,
            height: 48,
            borderColor: "#00BFFF",
            backgroundColor: "rgba(0,191,255,0.08)",
            borderWidth: 1,
            boxShadow: "0 0 0 rgba(0,0,0,0)",
        },
        text: {
            width: 20,
            height: 20,
            borderColor: "rgba(255, 255, 255, 0.6)",
            backgroundColor: "rgba(0,0,0,0)",
            borderWidth: 1.5,
            boxShadow: "0 0 0 rgba(0,0,0,0)",
        },
        canvas: {
            width: 64,
            height: 64,
            borderColor: "transparent",
            backgroundColor: "rgba(0,0,0,0)",
            borderWidth: 1.5,
            boxShadow: "0 0 20px rgba(255,69,0,0.3)",
        },
        clicking: {
            width: 20,
            height: 20,
            borderColor: "#FF4500",
            backgroundColor: "rgba(255, 69, 0, 0.2)",
            borderWidth: 1.5,
            boxShadow: "0 0 0 rgba(0,0,0,0)",
        },
    };

    // Decide current variant based on state
    const currentVariant = isClicking ? "clicking" : hoverState;

    return (
        <div className="pointer-events-none fixed inset-0 z-[999999] overflow-hidden">
            {/* Trails */}
            <AnimatePresence>
                {trails.map((t) => (
                    <motion.div
                        key={t.id}
                        initial={{ opacity: 0.4, scale: 1 }}
                        animate={{ opacity: 0, scale: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="absolute rounded-full bg-[#FF4500]"
                        style={{
                            width: 3,
                            height: 3,
                            left: t.x,
                            top: t.y,
                            x: "-50%",
                            y: "-50%",
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* Ring (Outer Cursor) */}
            {/* Uses spring values for X and Y */}
            <motion.div
                className="absolute rounded-full flex items-center justify-center"
                style={{
                    x: springX,
                    y: springY,
                    translateX: "-50%",
                    translateY: "-50%",
                    zIndex: 999998,
                }}
                variants={ringVariants}
                animate={currentVariant}
                transition={{ type: "tween", ease: "easeOut", duration: 0.2 }}
            >
                {/* Special split gradient border logic for canvas */}
                {hoverState === "canvas" && !isClicking && (
                    <div
                        className="absolute inset-0 rounded-full"
                        style={{
                            padding: "1.5px",
                            background: "linear-gradient(180deg, #FF4500 0%, #00BFFF 100%)",
                            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                            WebkitMaskComposite: "xor",
                            maskComposite: "exclude",
                        }}
                    />
                )}
            </motion.div>

            {/* Dot (Inner Cursor) */}
            {/* Maps strictly to exact mouseX/mouseY instantly without lag */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    x: mouseX,
                    y: mouseY,
                    translateX: "-50%",
                    translateY: "-50%",
                    mixBlendMode: "difference",
                    zIndex: 999999,
                }}
                variants={dotVariants}
                animate={currentVariant}
                transition={{ type: "tween", ease: "easeOut", duration: 0.15 }}
            />
        </div>
    );
}
