"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRecruiterMode } from "./RecruiterModeContext";
import { Github, Linkedin, Mail, Download, MessageCircle, X, GripHorizontal } from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════════════════
   SECTION DATA for scroll spy
   ═══════════════════════════════════════════════════════════════════════════════ */
const SECTIONS = [
    { id: "hero", label: "Hero" },
    { id: "about", label: "About Me" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "contact", label: "Contact" },
];

const SKILLS = ["Python", "TensorFlow", "OpenCV", "PyTorch", "MediaPipe", "Keras"];

const STATS = [
    { icon: "🎓", text: "B.Tech 3rd Year · 2023→Now" },
    { icon: "💻", text: "15+ Projects Built" },
    { icon: "🛠️", text: "30+ Technologies" },
    { icon: "📍", text: "India · Open to Remote" },
];

/* ═══════════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════════════ */
export default function RecruiterMode() {
    const { active, toggle } = useRecruiterMode();
    const [showTransition, setShowTransition] = useState(false);
    const [transProgress, setTransProgress] = useState(0);
    const [showToast, setShowToast] = useState(false);
    const [activeSection, setActiveSection] = useState("hero");
    const [isMobile, setIsMobile] = useState(false);
    const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);

    // Track if we auto-activated from LinkedIn
    const linkedInChecked = useRef(false);

    // Mobile detection
    useEffect(() => {
        const check = () => setIsMobile(window.innerWidth < 768);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, []);

    // LinkedIn auto-detect toast
    useEffect(() => {
        if (linkedInChecked.current) return;
        linkedInChecked.current = true;
        if (
            typeof document !== "undefined" &&
            document.referrer.includes("linkedin") &&
            active
        ) {
            setShowToast(true);
            setTimeout(() => setShowToast(false), 4000);
        }
    }, [active]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
            if (e.key === "r" || e.key === "R") {
                handleToggle();
            }
            if (e.key === "Escape" && active) {
                handleToggle();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    // Scroll spy
    useEffect(() => {
        if (!active) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id);
                    }
                });
            },
            { threshold: 0.3, rootMargin: "-10% 0px -60% 0px" }
        );
        SECTIONS.forEach((s) => {
            const el = document.getElementById(s.id);
            if (el) observer.observe(el);
        });
        return () => observer.disconnect();
    }, [active]);

    // Handle toggle with transition animation
    const handleToggle = useCallback(() => {
        if (!active) {
            // Turning ON: show transition overlay
            setShowTransition(true);
            setTransProgress(0);
            const start = Date.now();
            const dur = 1200;
            const step = () => {
                const elapsed = Date.now() - start;
                const p = Math.min(elapsed / dur, 1);
                setTransProgress(p);
                if (p < 1) requestAnimationFrame(step);
                else {
                    toggle();
                    if (isMobile) setMobileSheetOpen(true);
                    setTimeout(() => setShowTransition(false), 300);
                }
            };
            requestAnimationFrame(step);
        } else {
            // Turning OFF
            toggle();
            setMobileSheetOpen(false);
        }
    }, [active, toggle, isMobile]);

    // Scroll to section
    const scrollTo = (id: string) => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    /* ─── RENDER ───────────────────────────────────────────────────────────── */
    return (
        <>
            {/* ───── TOGGLE BUTTON ───── */}
            <button
                onClick={handleToggle}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                style={{
                    position: "fixed",
                    top: 24,
                    right: 24,
                    zIndex: 9997,
                    height: isMobile ? 32 : 36,
                    padding: isMobile ? "0 12px" : "0 16px",
                    background: active ? "rgba(255,69,0,0.12)" : "rgba(5,5,8,0.9)",
                    border: `1px solid ${active ? "rgba(255,69,0,0.8)" : "rgba(255,255,255,0.15)"}`,
                    borderRadius: 18,
                    backdropFilter: "blur(12px)",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: active
                        ? "0 0 20px rgba(255,69,0,0.3), 0 0 40px rgba(255,69,0,0.1)"
                        : "none",
                    outline: "none",
                }}
            >
                {/* Pulsing dot */}
                <span
                    style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: active ? "#FF4500" : "rgba(255,255,255,0.3)",
                        display: "inline-block",
                        animation: active ? "recruiterPulse 1.5s ease-in-out infinite" : "none",
                        transition: "background 0.3s",
                    }}
                />
                <span
                    style={{
                        fontFamily: "monospace",
                        fontSize: isMobile ? "0.6rem" : "0.65rem",
                        letterSpacing: "0.12em",
                        color: active ? "white" : "rgba(255,255,255,0.4)",
                        transition: "color 0.3s",
                        whiteSpace: "nowrap",
                    }}
                >
                    RECRUITER MODE
                </span>
                {active && (
                    <span
                        style={{
                            background: "#FF4500",
                            borderRadius: 4,
                            padding: "1px 5px",
                            fontFamily: "monospace",
                            fontSize: "0.55rem",
                            color: "white",
                            lineHeight: 1.4,
                        }}
                    >
                        ON
                    </span>
                )}
            </button>

            {/* Tooltip */}
            <AnimatePresence>
                {showTooltip && !isMobile && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: "fixed",
                            top: isMobile ? 60 : 66,
                            right: 24,
                            zIndex: 9998,
                            fontFamily: "monospace",
                            fontSize: "0.6rem",
                            color: "rgba(255,255,255,0.4)",
                            pointerEvents: "none",
                        }}
                    >
                        Press R to toggle
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ───── TRANSITION OVERLAY ───── */}
            <AnimatePresence>
                {showTransition && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 99999,
                            background: "rgba(5,5,8,0.95)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 24,
                        }}
                    >
                        <p
                            style={{
                                fontFamily: "monospace",
                                fontSize: "1rem",
                                color: "#FF4500",
                                letterSpacing: "0.15em",
                            }}
                        >
                            SWITCHING TO RECRUITER MODE...
                        </p>
                        <div
                            style={{
                                width: 240,
                                height: 3,
                                background: "rgba(255,255,255,0.08)",
                                borderRadius: 2,
                                overflow: "hidden",
                            }}
                        >
                            <motion.div
                                style={{
                                    height: "100%",
                                    borderRadius: 2,
                                    background: `linear-gradient(90deg, #FF4500 ${transProgress * 60}%, #00BFFF ${transProgress * 100}%)`,
                                    width: `${transProgress * 100}%`,
                                    transition: "width 0.05s linear",
                                }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ───── DESKTOP SIDEBAR PANEL ───── */}
            <AnimatePresence>
                {active && !isMobile && (
                    <motion.aside
                        initial={{ x: 280 }}
                        animate={{ x: 0 }}
                        exit={{ x: 280 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        style={{
                            position: "fixed",
                            right: 0,
                            top: 0,
                            width: 280,
                            height: "100vh",
                            background: "rgba(5,5,8,0.97)",
                            borderLeft: "1px solid rgba(255,69,0,0.3)",
                            backdropFilter: "blur(20px)",
                            zIndex: 9990,
                            padding: "24px 20px",
                            overflowY: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: 16,
                        }}
                    >
                        <PanelContent
                            activeSection={activeSection}
                            scrollTo={scrollTo}
                        />
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ───── MOBILE BOTTOM SHEET ───── */}
            <AnimatePresence>
                {active && isMobile && mobileSheetOpen && (
                    <>
                        {/* Dark backdrop — covers everything including GitHub trigger button */}
                        <motion.div
                            key="rm-backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileSheetOpen(false)}
                            style={{
                                position: "fixed",
                                inset: 0,
                                background: "rgba(0,0,0,0.6)",
                                zIndex: 9996,
                            }}
                        />
                        <motion.div
                            key="rm-sheet"
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            drag="y"
                            dragConstraints={{ top: 0, bottom: 0 }}
                            dragElastic={0.2}
                            onDragEnd={(_e, info) => {
                                if (info.offset.y > 100) setMobileSheetOpen(false);
                            }}
                            style={{
                                position: "fixed",
                                bottom: 0,
                                left: 0,
                                right: 0,
                                height: "65vh",
                                background: "rgba(5,5,8,0.97)",
                                borderTop: "1px solid rgba(255,69,0,0.3)",
                                backdropFilter: "blur(20px)",
                                zIndex: 9997,
                                padding: "12px 20px 24px",
                                overflowY: "auto",
                                borderRadius: "20px 20px 0 0",
                                display: "flex",
                                flexDirection: "column",
                            }}
                        >
                            {/* Drag handle */}
                            <div style={{ display: "flex", justifyContent: "center", paddingBottom: 12 }}>
                                <div
                                    style={{
                                        width: 40,
                                        height: 4,
                                        borderRadius: 2,
                                        background: "rgba(255,255,255,0.2)",
                                    }}
                                />
                            </div>
                            {/* Close button — 44px touch target */}
                            <button
                                onClick={() => setMobileSheetOpen(false)}
                                style={{
                                    position: "absolute",
                                    top: 8,
                                    right: 8,
                                    background: "none",
                                    border: "none",
                                    color: "rgba(255,255,255,0.5)",
                                    cursor: "pointer",
                                    padding: 10,
                                    minWidth: 44,
                                    minHeight: 44,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <X size={18} />
                            </button>
                            <div style={{ flex: 1, overflowY: "auto" }}>
                                <PanelContent
                                    activeSection={activeSection}
                                    scrollTo={(id) => {
                                        scrollTo(id);
                                        setMobileSheetOpen(false);
                                    }}
                                />
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* ───── LINKEDIN TOAST ───── */}
            <AnimatePresence>
                {showToast && (
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 30 }}
                        style={{
                            position: "fixed",
                            bottom: 32,
                            left: "50%",
                            transform: "translateX(-50%)",
                            zIndex: 99999,
                            background: "rgba(5,5,8,0.95)",
                            border: "1px solid rgba(255,69,0,0.6)",
                            boxShadow: "0 0 30px rgba(255,69,0,0.25)",
                            borderRadius: 12,
                            padding: "14px 24px",
                            textAlign: "center",
                            backdropFilter: "blur(12px)",
                        }}
                    >
                        <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#FF4500", margin: 0, letterSpacing: "0.1em" }}>
                            RECRUITER MODE AUTO-ACTIVATED
                        </p>
                        <p style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.5)", margin: "4px 0 0", letterSpacing: "0.05em" }}>
                            Welcome from LinkedIn 👋
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ───── PULSE ANIMATION KEYFRAMES ───── */}
            <style jsx global>{`
        @keyframes recruiterPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.8); opacity: 0.5; }
        }
      `}</style>
        </>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   PANEL CONTENT (shared between desktop sidebar and mobile bottom sheet)
   ═══════════════════════════════════════════════════════════════════════════════ */
function PanelContent({
    activeSection,
    scrollTo,
}: {
    activeSection: string;
    scrollTo: (id: string) => void;
}) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, fontSize: "0.72rem" }}>

            {/* CURRENTLY VIEWING */}
            <div>
                <p style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.15em", margin: "0 0 4px" }}>
                    CURRENTLY VIEWING
                </p>
                <p style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "#00BFFF", margin: 0, letterSpacing: "0.1em", transition: "all 0.3s" }}>
                    {SECTIONS.find((s) => s.id === activeSection)?.label.toUpperCase() ?? "HERO"}
                </p>
            </div>

            {/* SECTION NAVIGATOR */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {SECTIONS.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "3px 0",
                            fontFamily: "monospace",
                            fontSize: "0.65rem",
                            color: activeSection === s.id ? "white" : "rgba(255,255,255,0.35)",
                            transition: "color 0.2s",
                            textAlign: "left",
                        }}
                    >
                        <span
                            style={{
                                width: activeSection === s.id ? 8 : 5,
                                height: activeSection === s.id ? 8 : 5,
                                borderRadius: "50%",
                                background: activeSection === s.id ? "#FF4500" : "rgba(255,255,255,0.2)",
                                transition: "all 0.3s",
                                flexShrink: 0,
                            }}
                        />
                        {s.label}
                    </button>
                ))}
            </div>

            <Divider />

            {/* AVAILABILITY BADGE */}
            <div
                style={{
                    background: "rgba(0,255,136,0.08)",
                    border: "1px solid rgba(0,255,136,0.4)",
                    borderRadius: 10,
                    padding: 12,
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                        style={{
                            width: 8, height: 8, borderRadius: "50%",
                            background: "#00FF88",
                            animation: "recruiterPulse 1.5s ease-in-out infinite",
                            display: "inline-block",
                        }}
                    />
                    <span style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "white", letterSpacing: "0.08em" }}>
                        AVAILABLE FOR HIRE
                    </span>
                </div>
                <p style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.5)", margin: "6px 0 0 16px" }}>
                    Internship · Full-time
                </p>
            </div>

            <Divider />

            {/* QUICK STATS */}
            <div>
                <p style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#FF4500", letterSpacing: "0.2em", margin: "0 0 8px" }}>
                    AT A GLANCE
                </p>
                {STATS.map((s, i) => (
                    <div
                        key={i}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "8px 0",
                            borderBottom: "1px solid rgba(255,255,255,0.05)",
                            fontFamily: "monospace",
                            fontSize: "0.72rem",
                            color: "rgba(255,255,255,0.7)",
                        }}
                    >
                        <span>{s.icon}</span>
                        <span>{s.text}</span>
                    </div>
                ))}
            </div>

            <Divider />

            {/* CORE SKILLS */}
            <div>
                <p style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#FF4500", letterSpacing: "0.2em", margin: "0 0 8px" }}>
                    CORE SKILLS
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {SKILLS.map((sk) => (
                        <span
                            key={sk}
                            style={{
                                background: "rgba(255,69,0,0.1)",
                                border: "1px solid rgba(255,69,0,0.3)",
                                borderRadius: 20,
                                padding: "4px 10px",
                                fontFamily: "monospace",
                                fontSize: "0.65rem",
                                color: "white",
                            }}
                        >
                            {sk}
                        </span>
                    ))}
                </div>
            </div>

            <Divider />

            {/* RESUME BUTTON */}
            <a
                href="/resume/aryan-yadav-resume.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    height: 44,
                    background: "linear-gradient(135deg, #FF4500, #FF8C00)",
                    borderRadius: 8,
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.75rem",
                    color: "white",
                    letterSpacing: "0.1em",
                    textDecoration: "none",
                    transition: "filter 0.2s",
                    cursor: "pointer",
                }}
                onMouseEnter={(e) => ((e.target as HTMLElement).style.filter = "brightness(1.15)")}
                onMouseLeave={(e) => ((e.target as HTMLElement).style.filter = "none")}
            >
                <Download size={14} /> DOWNLOAD RESUME
            </a>

            {/* CONTACT BUTTON */}
            <a
                href="mailto:aryanyadav.work@gmail.com"
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    height: 44,
                    background: "rgba(0,191,255,0.1)",
                    border: "1px solid rgba(0,191,255,0.4)",
                    borderRadius: 8,
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: "0.75rem",
                    color: "white",
                    letterSpacing: "0.1em",
                    textDecoration: "none",
                    transition: "all 0.2s",
                    cursor: "pointer",
                }}
            >
                <MessageCircle size={14} /> GET IN TOUCH
            </a>

            <Divider />

            {/* PROFILES */}
            <div>
                <p style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "#FF4500", letterSpacing: "0.2em", margin: "0 0 8px" }}>
                    PROFILES
                </p>
                <ProfileLink icon={<Github size={14} />} label="GitHub" href="https://github.com/7etsuo" />
                <ProfileLink icon={<Linkedin size={14} />} label="LinkedIn" href="https://linkedin.com/in/aryan-yadav" />
                <ProfileLink icon={<Mail size={14} />} label="Email" href="mailto:aryanyadav.work@gmail.com" />
            </div>

            <Divider />

            {/* CLOSE HINT */}
            <p style={{
                fontFamily: "monospace",
                fontSize: "0.55rem",
                color: "rgba(255,255,255,0.2)",
                textAlign: "center",
                margin: 0,
            }}>
                PRESS ESC OR TOGGLE TO EXIT
            </p>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════════
   SMALL HELPERS
   ═══════════════════════════════════════════════════════════════════════════════ */
function Divider() {
    return <div style={{ height: 1, background: "rgba(255,255,255,0.08)" }} />;
}

function ProfileLink({ icon, label, href }: { icon: React.ReactNode; label: string; href: string }) {
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "6px 0",
                fontFamily: "monospace",
                fontSize: "0.7rem",
                color: "rgba(255,255,255,0.6)",
                textDecoration: "none",
                transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = "white";
                (e.currentTarget as HTMLElement).style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
                (e.currentTarget as HTMLElement).style.textDecoration = "none";
            }}
        >
            {icon}
            <span>{label}</span>
            <span style={{ marginLeft: "auto", fontSize: "0.6rem" }}>↗</span>
        </a>
    );
}
