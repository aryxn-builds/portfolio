"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

const FRAME_COUNT = 119;
// Using image path structure frame_000_delay-0.05s.webp -> frame_118_delay-0.05s.webp

interface CanvasSequenceProps {
    isMobile?: boolean;
}

export default function CanvasSequence({ isMobile = false }: CanvasSequenceProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loaded, setLoaded] = useState(false);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const framesRef = useRef<HTMLImageElement[]>([]);
    const currentFrameRef = useRef(0);

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
                    setLoaded(true);
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
        };

        // Scroll mapping
        let lastProgress = 0;

        const scrollTrigger = ScrollTrigger.create({
            trigger: document.documentElement,
            start: "top top",
            end: "bottom bottom",
            scrub: 0,
            onUpdate: (self) => {
                const progress = self.progress;

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
            scrollTrigger.kill();
        };
    }, [loaded]);

    // Control body overflow while loading
    useEffect(() => {
        if (!loaded) {
            document.body.style.overflow = "hidden";
        } else {
            const timer = setTimeout(() => {
                document.body.style.overflow = "";
            }, 1000); // 1s for fadeout
            return () => clearTimeout(timer);
        }
    }, [loaded]);

    // --------------------------------------------------------
    // LAYER PARALLAX MAPPINGS (Mobile receives static values)
    // --------------------------------------------------------
    // Parallax completely removed per user request.

    // EASTER EGG: 5 Clicks on Canvas
    const [isComic, setIsComic] = useState(false);

    useEffect(() => {
        let clickCount = 0;
        let clickTimer: NodeJS.Timeout;

        const handleWindowClick = (e: MouseEvent) => {
            // Only trigger if in Hero section (scrolled less than 50vh)
            if (window.scrollY > window.innerHeight * 0.5) return;

            // Ignore UI clicks (buttons, links)
            const target = e.target as HTMLElement;
            if (target.closest('a, button, [role=button]')) return;

            clickCount++;
            clearTimeout(clickTimer);

            if (clickCount >= 5) {
                clickCount = 0;
                setIsComic(true);
                setTimeout(() => setIsComic(false), 2000);
            } else {
                clickTimer = setTimeout(() => { clickCount = 0; }, 800);
            }
        };

        window.addEventListener('click', handleWindowClick);
        return () => window.removeEventListener('click', handleWindowClick);
    }, []);

    return (
        <>

            <div className="fixed inset-0 z-0 pointer-events-none bg-[#050508] overflow-hidden">
                <motion.div
                    className="absolute inset-0 w-full h-full flex items-center justify-center transition-all duration-500"
                    style={{
                        filter: isComic ? "grayscale(100%) contrast(200%)" : "none"
                    }}
                >
                    <canvas
                        ref={canvasRef}
                        className={`w-full h-full object-cover transition-opacity duration-[2000ms] ${loaded ? "opacity-60" : "opacity-0"}`}
                        style={{
                            filter: "drop-shadow(0 0 25px rgba(255, 69, 0, 0.15)) drop-shadow(0 0 25px rgba(0, 191, 255, 0.15))",
                        }}
                    />
                </motion.div>

                {/* Layer 2: Parallax Lighting Glow (Static) */}
                <div className="absolute inset-0 pointer-events-none mix-blend-screen">
                    {/* Left Orange Glow */}
                    <motion.div
                        className="absolute left-[-10%] top-0 w-[40%] h-full bg-[radial-gradient(circle_at_left,rgba(255,69,0,0.8)_0%,transparent_70%)]"
                        style={{ opacity: isMobile ? 0.3 : 0.4 }}
                        transition={{ ease: "easeOut", duration: 0.5 }}
                    />
                    {/* Right Blue Glow */}
                    <motion.div
                        className="absolute right-[-10%] top-0 w-[40%] h-full bg-[radial-gradient(circle_at_right,rgba(0,191,255,0.8)_0%,transparent_70%)]"
                        style={{ opacity: isMobile ? 0.3 : 0.4 }}
                        transition={{ ease: "easeOut", duration: 0.5 }}
                    />
                </div>

                {/* Vignette / Dark gradient overlay to ensure text is legible */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-[#050508]/60 mix-blend-multiply transition-opacity" style={{ opacity: isComic ? 0 : 1 }} />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#050508_100%)] opacity-80 transition-opacity" style={{ opacity: isComic ? 0 : 1 }} />

                {/* COMIC EASTER EGG SPEECH BUBBLE */}
                <AnimatePresence>
                    {isComic && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            transition={{ type: "spring", bounce: 0.6 }}
                            className="absolute top-[30%] left-[10%] max-w-xs md:max-w-md bg-white text-black px-6 py-4 rounded-3xl border-4 border-[#FF4500] font-sans font-bold text-lg md:text-xl shadow-[0_10px_30px_rgba(255,69,0,0.5)] z-[100]"
                            style={{
                                borderBottomLeftRadius: 4 // classic cartoon bubble tail
                            }}
                        >
                            Stop clicking me! I'm training a model 😄
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
}
