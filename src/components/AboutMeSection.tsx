"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { Code, Cpu, GitBranch, GraduationCap } from "lucide-react";
import { Card3D } from "./ui/Card3D";

// Helper for number count-up
function Counter({ from, to, duration = 1.5 }: { from: number; to: number; duration?: number }) {
    const count = useMotionValue(from);
    const rounded = useTransform(count, (latest) => Math.round(latest));
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, margin: "-10%" });

    useEffect(() => {
        if (inView) {
            const controls = animate(count, to, { duration, ease: "easeOut" });
            return controls.stop;
        }
    }, [count, to, duration, inView]);

    return <motion.span ref={ref}>{rounded}</motion.span>;
}

const BIO_PARAGRAPHS = [
    (
        <React.Fragment key="1">
            I'm Aryan Yadav — a 3rd year B.Tech student obsessed with building machines that think. My journey started with a simple question: what if software could learn from the world instead of just following instructions?
        </React.Fragment>
    ),
    (
        <React.Fragment key="2">
            I specialize in <span className="text-[#FF4500]">Machine Learning</span>, <span className="text-[#00BFFF]">Generative AI</span>, and <span className="text-[#FF4500]">Computer Vision</span> — building systems that see, understand, and create. From training <span className="text-[#00BFFF]">neural networks</span> to deploying real-time CV pipelines, I turn ideas into intelligent systems.
        </React.Fragment>
    ),
    (
        <React.Fragment key="3">
            When I'm not training models, I'm exploring the intersection of AI and human experience — how intelligent systems can augment creativity, automate complexity, and solve problems that matter at scale.
        </React.Fragment>
    )
];

const TIMELINE_POINTS = [
    { year: "2023", label: "Started B.Tech", color: "orange" },
    { year: "2024", label: "First ML model & Python", color: "blue" },
    { year: "2025", label: "Built CV & GenAI Apps", color: "orange" },
    { year: "NOW", label: "Building Future Systems", color: "blue", isLive: true }
];

const STATS = [
    { number: 15, suffix: "+", label: "Projects Built", icon: Code, theme: "orange" as const },
    { number: 30, suffix: "+", label: "Technologies", icon: Cpu, theme: "blue" as const },
    { number: 500, suffix: "+", label: "GitHub Commits", icon: GitBranch, theme: "orange" as const },
    { number: 3, suffix: "rd", label: "Year B.Tech", icon: GraduationCap, theme: "blue" as const, noCount: true } // "3rd" is hard to count up cleanly as a string, we'll handle specifically
];

const CURRENTLY_BUILDING = [
    "Fine-tuning LLaMA for Hindi NLP",
    "Real-time gesture control system",
    "Generative AI art pipeline"
];

export default function AboutMeSection() {
    const [buildingIndex, setBuildingIndex] = useState(0);

    // Rotate "Currently Building" text
    useEffect(() => {
        const interval = setInterval(() => {
            setBuildingIndex((prev) => (prev + 1) % CURRENTLY_BUILDING.length);
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    return (
        <section className="min-h-screen w-full relative flex flex-col justify-center py-20 overflow-hidden bg-[#050508]">
            {/* Background Portrait Fade */}
            <div className="absolute inset-0 z-0 pointer-events-none opacity-20 flex items-center justify-center">
                <img
                    src="/sequence/frame_118_delay-0.05s.webp"
                    alt="Aryan Background"
                    className="w-full h-full object-cover"
                />
            </div>
            {/* Dark Overlay over Portrait */}
            <div className="absolute inset-0 z-0 bg-black/80 pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 w-full relative z-10 flex flex-col h-full items-center justify-center mt-12 md:mt-20">

                {/* Section Heading */}
                <motion.div
                    initial={{ opacity: 0, y: -40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-10%" }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="w-full text-center mb-16 md:mb-24"
                >
                    <h2 className="font-display text-[clamp(2.5rem,5vw,4rem)] font-bold tracking-wider uppercase">
                        WHO I <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] to-[#00BFFF]">AM.</span>
                    </h2>
                </motion.div>

                {/* Main Content Grid */}
                <div className="flex flex-col lg:flex-row w-full gap-16 lg:gap-24">

                    {/* LEFT COLUMN: Bio & Timeline */}
                    <div className="w-full lg:w-[60%] flex flex-col justify-between">

                        {/* Bio Text */}
                        <div className="flex flex-col gap-[20px] mb-16">
                            {BIO_PARAGRAPHS.map((text, i) => (
                                <motion.p
                                    key={i}
                                    initial={{ opacity: 0, x: -30 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-10%" }}
                                    transition={{ duration: 0.6, delay: i * 0.15, ease: "easeOut" }}
                                    className="font-sans text-[clamp(0.9rem,1.5vw,1.05rem)] leading-[1.8] text-white/75"
                                >
                                    {text}
                                </motion.p>
                            ))}
                        </div>

                        {/* Timeline */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-10%" }}
                            variants={{
                                hidden: {},
                                visible: {
                                    transition: { staggerChildren: 0.2, delayChildren: 0.4 }
                                }
                            }}
                            className="relative w-full mt-auto"
                        >
                            {/* Main Line */}
                            <motion.div
                                variants={{
                                    hidden: { scaleX: 0 },
                                    visible: { scaleX: 1, transition: { duration: 1, ease: "easeInOut" } }
                                }}
                                className="absolute top-[40px] left-0 w-full h-[1px] bg-gradient-to-r from-[#FF4500] to-[#00BFFF] origin-left"
                            />

                            {/* Timeline Points */}
                            <div className="relative flex justify-between w-full">
                                {TIMELINE_POINTS.map((point, i) => {
                                    const isOrange = point.color === "orange";
                                    return (
                                        <motion.div
                                            key={i}
                                            variants={{
                                                hidden: { opacity: 0, y: 10 },
                                                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
                                            }}
                                            className="flex flex-col items-center w-[20%] relative"
                                        >
                                            <span className="font-display text-[0.75rem] text-white mb-2 h-4">{point.year}</span>

                                            {/* Point Circle */}
                                            <div className="relative flex items-center justify-center h-[20px] w-full mb-3">
                                                {point.isLive ? (
                                                    <div className="relative flex items-center justify-center w-4 h-4">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00BFFF] opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-4 w-4 bg-[#00BFFF]"></span>
                                                    </div>
                                                ) : (
                                                    <div className={`w-[6px] h-[6px] rounded-full z-10 ${isOrange ? "bg-[#FF4500]" : "bg-[#00BFFF]"}`} />
                                                )}
                                            </div>

                                            <span className="font-sans text-[0.65rem] text-white/55 text-center leading-tight whitespace-pre-wrap">{point.label}</span>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </motion.div>
                    </div>

                    {/* RIGHT COLUMN: Stats & Currently Building */}
                    <div className="w-full lg:w-[40%] flex flex-col justify-between h-full gap-8">

                        {/* Stat Cards Grid */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: "-10%" }}
                            variants={{
                                hidden: {},
                                visible: { transition: { staggerChildren: 0.15 } }
                            }}
                            className="grid grid-cols-2 gap-4 md:gap-6"
                        >
                            {STATS.map((stat, i) => (
                                <motion.div
                                    key={i}
                                    variants={{
                                        hidden: { opacity: 0, y: 30 },
                                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                                    }}
                                >
                                    <Card3D
                                        title={<></>}
                                        description={<></>}
                                        icon={stat.icon}
                                        theme={stat.theme}
                                        size="sm"
                                        variant="premium"
                                        animated={false} // We handle animation here with stagger
                                    >
                                        <div className="flex flex-col mt-[-10px] pointer-events-none">
                                            <div className="font-display text-[2rem] lg:text-[2.5rem] text-white font-bold leading-none mb-1">
                                                {stat.noCount ? (
                                                    stat.number
                                                ) : (
                                                    <Counter from={0} to={stat.number} duration={1.5} />
                                                )}
                                                {stat.suffix}
                                            </div>
                                            <div className="font-sans text-[0.8rem] text-white/60 uppercase tracking-wider">{stat.label}</div>
                                        </div>
                                    </Card3D>
                                </motion.div>
                            ))}
                        </motion.div>

                        {/* Currently Building Box */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-10%" }}
                            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
                            className="bg-[#FF4500]/5 border border-[#FF4500]/30 rounded-xl p-[16px_20px] backdrop-blur-sm mt-4 relative overflow-hidden h-[90px] flex flex-col justify-center"
                        >
                            <h4 className="font-mono text-[0.7rem] text-[#FF4500] tracking-[0.2em] mb-2 flex items-center">
                                CURRENTLY BUILDING <span className="animate-pulse ml-1">▋</span>
                            </h4>

                            <div className="relative h-[24px]">
                                {CURRENTLY_BUILDING.map((text, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
                                        animate={{
                                            opacity: buildingIndex === idx ? 1 : 0,
                                            y: buildingIndex === idx ? 0 : buildingIndex > idx ? -20 : 20,
                                            filter: buildingIndex === idx ? "blur(0px)" : "blur(6px)",
                                        }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                        className="absolute inset-0 font-sans font-light italic text-[clamp(0.9rem,1.2vw,1rem)] text-white/90"
                                    >
                                        {text}
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </section>
    );
}
