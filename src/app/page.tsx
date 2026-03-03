"use client";

import CanvasSequence from "@/components/CanvasSequence";
import NeuralClusters from "@/components/NeuralClusters";
import RadialOrbitalTimeline from "@/components/RadialOrbitalTimeline";
import MorphingCardStack from "@/components/MorphingCardStack";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ExternalLink, Activity } from "lucide-react";
import { useState } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [isOrbitalActive, setIsOrbitalActive] = useState(false);
  return (
    <main className="relative w-full h-full min-h-screen font-sans selection:bg-[#FF4500]/50 text-white overflow-hidden">
      {/* Background Canvas Layer */}
      <CanvasSequence />

      {/* Dynamic Blur & Darkening Overlay for Orbital Selection */}
      <div
        className={cn(
          "fixed inset-0 z-[5] pointer-events-none transition-all duration-700",
          isOrbitalActive ? "backdrop-blur-[8px] bg-black/60" : "backdrop-blur-none bg-transparent"
        )}
      />

      {/* DOM Content Layer over Canvas */}
      <div className="relative z-10">

        {/* HERO SECTION */}
        <section className="h-[120vh] flex flex-col items-center justify-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center text-center px-4"
          >
            {/* Glitch / Typewriter effect handled by pure CSS or Framer */}
            <h1 className="font-display text-5xl md:text-8xl font-bold uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 drop-shadow-[0_0_15px_rgba(255,69,0,0.8)]">
              ARYAN YADAV
            </h1>
            <p className="text-xl md:text-3xl font-light text-[#00BFFF] tracking-widest mb-6 uppercase">
              ML Engineer <span className="text-[#FF4500]">·</span> GenAI <span className="text-[#FF4500]">·</span> Computer Vision
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-black/20 backdrop-blur-md">
              <Activity size={16} className="text-[#FF4500]" />
              <span className="text-sm tracking-wider uppercase font-mono">B.Tech · 3rd Year</span>
            </div>
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute bottom-20 flex flex-col items-center gap-2 opacity-60"
          >
            <div className="w-[1px] h-16 bg-gradient-to-b from-[#00BFFF] to-transparent" />
            <span className="text-xs uppercase tracking-widest font-mono">Initiate Sequence</span>
          </motion.div>
        </section>

        {/* ABOUT SECTION */}
        <section className="h-[100vh] flex items-center px-8 md:px-24">
          <motion.div
            whileInView={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: -50 }}
            transition={{ duration: 1 }}
            viewport={{ once: true, margin: "-20%" }}
            className="max-w-2xl bg-black/30 p-8 rounded-2xl backdrop-blur-sm border border-white/5"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold mb-6 text-[#00BFFF]">
              SYSTEM <span className="text-white">OVERRIDE.</span>
            </h2>
            <p className="text-lg md:text-xl leading-relaxed text-gray-300 font-light">
              AI engineer working across Machine Learning, Deep Learning, Computer Vision, and Generative AI, focused on building end-to-end intelligent systems. I design, train, and optimize models, then integrate them into scalable full-stack applications built for real-world deployment.
            </p>
          </motion.div>
        </section>

        {/* SKILLS SECTION */}
        <section className="h-auto min-h-[150vh] flex flex-col justify-center px-4 md:px-0 py-20">
          <motion.div
            whileInView={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 50 }}
            viewport={{ once: true, margin: "-10%" }}
            className="w-full h-auto md:h-[80vh] flex flex-col items-center md:items-stretch md:flex-row relative gap-8 md:gap-0"
          >
            {/* Title Overlay */}
            <div className="relative md:absolute top-0 md:top-10 md:right-24 z-20 pointer-events-none text-center md:text-right w-full">
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
                NEURAL <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] to-[#00BFFF]">CLUSTERS.</span>
              </h2>
              <p className="text-gray-400 font-mono text-sm uppercase tracking-widest mt-2">The tech stack that powers my thinking</p>
            </div>

            {/* 3D Component */}
            <div className="w-full h-full relative z-10 md:px-12">
              <NeuralClusters />
            </div>
          </motion.div>
        </section>

        {/* PROJECTS SECTION */}
        <section className="min-h-[150vh] flex flex-col justify-center py-24 px-8 md:px-24 relative overflow-hidden">
          <h2 className="font-display text-4xl md:text-6xl font-bold mb-16 text-center">
            DEPLOYED <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BFFF] to-[#FF4500]">MODELS.</span>
          </h2>

          <div className="relative z-10 w-full mt-4">
            <MorphingCardStack />
          </div>
        </section>

        {/* CONTACT SECTION / RADIAL ORBITAL TIMELINE */}
        <section className="min-h-[100vh] flex flex-col items-center justify-center relative py-20 overflow-hidden">
          {/* LAYER 1: Dark overlay gradient */}
          <div className="absolute inset-0 bg-transparent pointer-events-none z-0" />

          {/* LAYER 3: Heading (Top) */}
          <motion.div
            whileInView="visible"
            initial="hidden"
            viewport={{ once: false, margin: "-20%" }}
            variants={{
              hidden: { opacity: 0, y: -20 },
              visible: {
                opacity: 1,
                y: 0,
                transition: { duration: 1.4, ease: "easeOut", staggerChildren: 0.1 }
              }
            }}
            className="text-center z-30 pb-12 pt-8 md:pt-0 max-w-4xl mx-auto px-4"
          >
            <motion.h2
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="font-display text-4xl md:text-[4rem] font-bold mb-4 tracking-tighter uppercase leading-none"
            >
              LET&apos;S BUILD <br className="md:hidden" /> THE <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] to-[#00BFFF]">FUTURE.</span>
            </motion.h2>
            <motion.p
              variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
              className="text-[rgba(255,255,255,0.7)] text-base md:text-lg max-w-2xl mx-auto font-light leading-relaxed"
            >
              Open to collaborative research, challenging engineering roles, and building things that matter.
            </motion.p>
          </motion.div>

          {/* LAYER 2: Radial Orbital Timeline (Middle) */}
          <motion.div
            whileInView="visible"
            initial="hidden"
            viewport={{ once: false, margin: "-20%" }}
            variants={{
              hidden: { opacity: 0, scale: 0.8 },
              visible: { opacity: 1, scale: 1, transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.2 } }
            }}
            className="w-full relative z-20"
          >
            <RadialOrbitalTimeline
              onNodeStateChange={(id) => setIsOrbitalActive(id !== null)}
            />
          </motion.div>

          {/* LAYER 4: Infinite Loop Active Text */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1] flex items-center justify-center text-center w-full pointer-events-none">
            <span style={{
              fontFamily: "'Courier New', monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.3em",
              color: "rgba(255, 100, 0, 0.5)",
              textTransform: "uppercase"
            }}>
              Infinite Loop Active
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 1, repeat: Infinity, times: [0, 0.5, 0.5, 1] }}
              >
                {" ▋"}
              </motion.span>
            </span>
          </div>
        </section>

        {/* SPACER SECTION FOR SEAMLESS INFINITE LOOP 
            When using Lenis infinite scrolling, it abruptly loops the scroll container.
            To make it invisible, the end of the scroll container should look exactly 
            like the start. Hence we add a visual clone of the first section's layout,
            although the user requested text in Hero only. Since Lenis simply resets the scroll position
            when we hit the bottom, if Canvas plays from frame 118 back to 0 seamlessly, 
            the user will barely notice if we don't have text. Wait, if we DO have text in Hero, 
            when the page loops back to top, the Hero text will just suddenly reappear. 
            To solve this, we clone the HERO component text visually here at the bottom of the page!
        */}
        <section className="h-[120vh] flex flex-col items-center justify-center relative pointer-events-none opacity-0">
          {/* Space holder for smooth loop. The actual DOM jump will happen here. 
               We set opacity 0 so that no text clash happens, but it provides scrolling room.
               Since the background Canvas spans fixed, it acts normally. */}
        </section>

      </div>
    </main>
  );
}
