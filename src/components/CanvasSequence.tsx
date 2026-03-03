"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const FRAME_COUNT = 119;
// Using image path structure frame_000_delay-0.05s.webp -> frame_118_delay-0.05s.webp

export default function CanvasSequence() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loaded, setLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const framesRef = useRef<HTMLImageElement[]>([]);
    const currentFrameRef = useRef(0);
    const requestRef = useRef<number>(0);

    // Preloading frames
    useEffect(() => {
        let loadedCount = 0;
        const frames: HTMLImageElement[] = [];
        const startTime = Date.now();

        for (let i = 0; i < FRAME_COUNT; i++) {
            const img = new Image();
            const paddedIndex = i.toString().padStart(3, "0");
            img.src = `/sequence/frame_${paddedIndex}_delay-0.05s.webp`;
            img.onload = () => {
                loadedCount++;
                setLoadingProgress((loadedCount / FRAME_COUNT) * 100);
                if (loadedCount === FRAME_COUNT) {
                    const elapsed = Date.now() - startTime;
                    const remainingTime = Math.max(0, 3500 - elapsed);
                    setTimeout(() => {
                        setLoaded(true);
                    }, remainingTime);
                }
            };
            frames.push(img);
        }
        framesRef.current = frames;

        return () => {
            // Cleanup frames
            framesRef.current = [];
        };
    }, []);

    // GSAP ScrollTrigger and Canvas rendering
    useEffect(() => {
        if (!loaded || !canvasRef.current) return;

        gsap.registerPlugin(ScrollTrigger);

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const render = () => {
            const img = framesRef.current[currentFrameRef.current];
            if (!img || !img.width) return;

            const canvasRatio = canvas.width / canvas.height;
            const imgRatio = img.width / img.height;
            let drawWidth, drawHeight, offsetX, offsetY;

            if (canvasRatio > imgRatio) {
                drawWidth = canvas.width;
                drawHeight = canvas.width / imgRatio;
                offsetX = 0;
                offsetY = (canvas.height - drawHeight) / 2;
            } else {
                drawWidth = canvas.height * imgRatio;
                drawHeight = canvas.height;
                offsetX = (canvas.width - drawWidth) / 2;
                offsetY = 0;
            }

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        };

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            render();
        };

        handleResize();
        window.addEventListener("resize", handleResize);

        // Initial render
        render();

        // Playback state variables
        const state = {
            direction: 1,      // 1 = forward, -1 = reverse
            isReversing: false,
            idleTimer: 0,
        };

        // Idle Ping-Pong loop
        const tick = () => {
            if (!state.isReversing) {
                state.idleTimer++;

                // Enter idle state after ~1s of scroll inactivity
                if (state.idleTimer > 60) {
                    // Play forward roughly 20fps
                    if (state.idleTimer % 3 === 0) {
                        currentFrameRef.current += state.direction;

                        // Ping-pong behavior
                        if (currentFrameRef.current >= FRAME_COUNT - 1) {
                            currentFrameRef.current = FRAME_COUNT - 1;
                            state.direction = -1;
                        } else if (currentFrameRef.current <= 0) {
                            currentFrameRef.current = 0;
                            state.direction = 1;
                        }

                        render();
                    }
                }
            }
            requestRef.current = requestAnimationFrame(tick);
        };
        requestRef.current = requestAnimationFrame(tick);

        // Scroll mapping
        let lastProgress = 0;

        const scrollTrigger = ScrollTrigger.create({
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0,
            onUpdate: (self) => {
                const progress = self.progress;
                state.idleTimer = 0; // Reset idle timer on scroll

                if (state.isReversing) return; // Prevent scroll updates during cinematic reverse

                // Detect Lenis infinite scroll wrapping from bottom back to top
                // Progress jumps from ~0.999 to 0
                if (lastProgress > 0.9 && progress < 0.1) {
                    lastProgress = progress;

                    // Cinematic Reverse: 118 -> 0
                    state.isReversing = true;
                    state.direction = -1;

                    // The user wanted speed to match scroll, but for a guaranteed 
                    // smooth cinematic feel on a sudden jump, a fixed time ease is safest.
                    // We can use a 1.5s power2.inOut reverse sweep as requested.
                    const dummyObj = { frame: currentFrameRef.current };

                    gsap.to(dummyObj, {
                        frame: 0,
                        duration: 1.5,
                        ease: "power2.inOut",
                        onUpdate: () => {
                            currentFrameRef.current = Math.round(dummyObj.frame);
                            render();
                        },
                        onComplete: () => {
                            state.isReversing = false;
                            state.direction = 1;
                            currentFrameRef.current = 0;
                        }
                    });

                    return;
                }

                // Normal scrolling forward logic
                lastProgress = progress;

                // Only map progress normally if scrolling down (forward)
                // If the user scrolls up manually, or scrolls down, we just bind to progress linearly.
                // The prompt says: "Reverse on scroll up: direction = -1, currentFrame = Math.floor((1 - self.progress) * 118)"
                // But tying absolute physical page position inversely to progress means the image jumps
                // if they just change scroll direction. 
                // Let's stick closely to the prompt's provided logic verbatim.

                if (self.direction === 1) {
                    state.direction = 1;
                    const newFrame = Math.floor(progress * (FRAME_COUNT - 1));
                    if (newFrame !== currentFrameRef.current) {
                        currentFrameRef.current = newFrame;
                        render();
                    }
                } else if (self.direction === -1) {
                    state.direction = -1;
                    // The prompt specifically asked for inverse mapping on scroll up:
                    const newFrame = Math.floor((1 - progress) * (FRAME_COUNT - 1));
                    if (newFrame !== currentFrameRef.current) {
                        currentFrameRef.current = newFrame;
                        render();
                    }
                }
            },
        });

        return () => {
            window.removeEventListener("resize", handleResize);
            cancelAnimationFrame(requestRef.current);
            scrollTrigger.kill();
        };
    }, [loaded]);

    return (
        <div className="fixed inset-0 z-0 pointer-events-none bg-[#050508]">
            {!loaded && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-[#FF4500] z-20 font-mono tracking-widest gap-4">
                    <div className="text-xl">INITIALIZING NEURAL LINK...</div>
                    <div className="w-64 h-1 bg-[#050508] border border-[#00BFFF]/30 rounded overflow-hidden">
                        <div
                            className="h-full bg-[#FF4500] shadow-[0_0_10px_#FF4500] transition-all duration-[3000ms] ease-out"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </div>
                </div>
            )}

            <canvas
                ref={canvasRef}
                className={`w-full h-full object-cover transition-opacity duration-[2000ms] ${loaded ? "opacity-60" : "opacity-0"
                    }`}
                style={{
                    filter: "drop-shadow(0 0 25px rgba(255, 69, 0, 0.15)) drop-shadow(0 0 25px rgba(0, 191, 255, 0.15))",
                }}
            />

            {/* Vignette / Dark gradient overlay to ensure text is legible */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-[#050508]/60 mix-blend-multiply" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050508_100%)] opacity-80" />
        </div>
    );
}
