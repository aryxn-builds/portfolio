"use client";

import CanvasSequence from "@/components/CanvasSequence";
import AboutMeSection from "@/components/AboutMeSection";
import ScrollingCaptions from "@/components/hero/ScrollingCaptions";
import NeuralClusters from "@/components/NeuralClusters";
import ContactSection from "@/components/ContactSection";
import MorphingCardStack from "@/components/MorphingCardStack";
import SkillTree from "@/components/SkillTree";
import { FloatingResumeButton } from "@/components/FloatingResumeButton";
import { LoadingScreen } from "@/components/LoadingScreen";
import { GlitchHeading } from "@/components/GlitchHeading";
import RecruiterMode from "@/components/RecruiterMode";
import GitHubActivityFeed from "@/components/GitHubActivityFeed";
import { RecruiterModeProvider, useRecruiterMode } from "@/components/RecruiterModeContext";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export default function Home() {
  const [isOrbitalActive, setIsOrbitalActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(hover: none)').matches || window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <RecruiterModeProvider>
      <HomeContent isMobile={isMobile} isOrbitalActive={isOrbitalActive} setIsOrbitalActive={setIsOrbitalActive} />
    </RecruiterModeProvider>
  );
}

function HomeContent({ isMobile, isOrbitalActive, setIsOrbitalActive }: {
  isMobile: boolean;
  isOrbitalActive: boolean;
  setIsOrbitalActive: (v: boolean) => void;
}) {
  const { active: recruiterActive } = useRecruiterMode();
  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768;

  return (
    <main className="relative w-full h-full min-h-screen font-sans selection:bg-[#FF4500]/50 text-white overflow-hidden">

      {/* INITIALIZATION LOADING SCREEN */}
      <LoadingScreen />

      {/* RECRUITER MODE TOGGLE + PANEL */}
      <RecruiterMode />

      {/* GITHUB ACTIVITY FEED WIDGET */}
      <GitHubActivityFeed />

      {/* Background Canvas Layer (No mouse values passed) */}
      <CanvasSequence isMobile={isMobile} />

      {/* Dynamic Blur & Darkening Overlay for Orbital Selection */}
      <div
        className={cn(
          "fixed inset-0 z-[5] pointer-events-none transition-all duration-700",
          isOrbitalActive ? "backdrop-blur-[8px] bg-black/60" : "backdrop-blur-none bg-transparent"
        )}
      />

      {/* DOM Content Layer over Canvas */}
      <div className="relative z-10" style={{ marginRight: recruiterActive && isDesktop ? 280 : 0, transition: 'margin-right 0.4s ease' }}>

        {/* GLOBAL FLOATING RESUME BUTTON */}
        <FloatingResumeButton />

        {/* HERO SECTION */}
        <section
          id="hero"
          className="h-[120vh] flex flex-col items-center justify-center relative"
        >
          {/* Top fade — softens hero entry when loop restarts */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '320px', background: 'linear-gradient(to bottom, #050508 0%, #050508 8%, rgba(5,5,8,0.95) 18%, rgba(5,5,8,0.8) 32%, rgba(5,5,8,0.55) 50%, rgba(5,5,8,0.25) 70%, rgba(5,5,8,0.08) 88%, transparent 100%)', zIndex: 10, pointerEvents: 'none' }} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center text-center px-4"
          >
            <motion.div>
              <GlitchHeading />
            </motion.div>

            <motion.div>
              <p className="text-xl md:text-3xl font-light text-[#00BFFF] tracking-widest mb-6 uppercase">
                ML Engineer <span className="text-[#FF4500]">·</span> GenAI <span className="text-[#FF4500]">·</span> Computer Vision
              </p>
            </motion.div>

            {/* Injects the scroll-listener captions */}
            <ScrollingCaptions />

            {/* HERO INLINE RESUME BUTTON */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.5, delay: 1.2, ease: "easeOut" }}
              className="mt-12 md:mt-16 w-full flex justify-center px-4"
            >
              <a
                href="/resume/aryan-resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download
                className="
                  group relative flex items-center justify-center
                  w-full md:w-auto min-h-[44px] px-6 py-2.5
                  border border-white/20 bg-white/[0.04] rounded-lg
                  font-mono text-[0.75rem] tracking-[0.2em] text-white/70
                  transition-all duration-300 ease-out
                  hover:border-[#FF4500] hover:text-white hover:bg-[#FF4500]/[0.08] hover:shadow-[0_0_20px_rgba(255,69,0,0.2)]
                "
              >
                [ DOWNLOAD RESUME ] &darr;
              </a>
            </motion.div>

          </motion.div>

          <motion.div
            initial={{ y: 0 }}
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="absolute bottom-20 flex flex-col items-center gap-2 opacity-60"
          >
            <div className="w-[1px] h-16 bg-gradient-to-b from-[#00BFFF] to-transparent" />
            <span className="text-xs uppercase tracking-widest font-mono">Initiate Sequence</span>
          </motion.div>
        </section>
        {/* NEW ABOUT ME SECTION */}
        <section id="about" className="bg-transparent -mt-px w-full relative z-20">
          <AboutMeSection />
        </section>

        {/* SKILLS SECTION */}
        <section id="skills" className="h-auto min-h-[100vh] flex flex-col justify-center px-4 md:px-0 py-10">
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
        <section id="projects" className="min-h-[100vh] flex flex-col justify-center py-[20px] md:py-12 px-[16px] md:px-[80px] xl:px-24 max-w-[100vw] overflow-x-hidden relative">
          <h2 className="font-display text-[clamp(1.4rem,8vw,2.4rem)] md:text-[clamp(2rem,6vw,3rem)] xl:text-[4rem] font-bold mb-8 md:mb-16 text-center leading-tight">
            DEPLOYED <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00BFFF] to-[#FF4500]">MODELS.</span>
          </h2>

          <div className="relative z-10 w-full mt-4">
            <MorphingCardStack />
          </div>
          {/* Bottom fade — blends into Skill Tree */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '160px', background: 'linear-gradient(to top, #050508 0%, transparent 100%)', zIndex: 10, pointerEvents: 'none' }} />
        </section>

        {/* SKILL TREE CERTIFICATIONS SECTION */}
        <section id="certifications" className="w-full relative z-20">
          <SkillTree />
        </section>

        {/* NEW CONTACT SECTION */}
        <ContactSection />

        {/* SPACER SECTION FOR SEAMLESS INFINITE LOOP
            When using Lenis infinite scrolling, it abruptly loops the scroll container to the top.
            To make it invisible, the bottom of the page must look exactly like the top.
            Here we clone the Hero component text visually so the transition is pixel-perfect.
        */}
        <section className="h-[120vh] flex flex-col items-center justify-center relative pointer-events-none">
          <div className="flex flex-col items-center text-center px-4">
            <div>
              <h1 className="font-display text-5xl md:text-8xl font-bold uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-gray-500 drop-shadow-[0_0_15px_rgba(255,69,0,0.8)]">
                ARYAN YADAV
              </h1>
            </div>

            <div>
              <p className="text-xl md:text-3xl font-light text-[#00BFFF] tracking-widest mb-6 uppercase">
                ML Engineer <span className="text-[#FF4500]">·</span> GenAI <span className="text-[#FF4500]">·</span> Computer Vision
              </p>
            </div>

            <ScrollingCaptions />
          </div>

          <div className="absolute bottom-20 flex flex-col items-center gap-2 opacity-60">
            <div className="w-[1px] h-16 bg-gradient-to-b from-[#00BFFF] to-transparent" />
            <span className="text-xs uppercase tracking-widest font-mono">Initiate Sequence</span>
          </div>
        </section>

      </div>
    </main>
  );
}

