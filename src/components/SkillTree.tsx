"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, useInView, useMotionValue, useTransform, animate, AnimatePresence } from "framer-motion";
import { Lock, X } from "lucide-react";

/* ─────────────────────────────────────────
   COUNTER COMPONENT
───────────────────────────────────────── */
function Counter({ from, to, duration = 1.5, separator = false }: { from: number; to: number; duration?: number; separator?: boolean }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (v) => {
    const n = Math.round(v);
    return separator ? n.toLocaleString() : String(n);
  });
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref as React.RefObject<Element>, { once: true, margin: "-10%" });

  useEffect(() => {
    if (inView) {
      const controls = animate(count, to, { duration, ease: "easeOut" });
      return controls.stop;
    }
  }, [count, to, duration, inView]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

/* ─────────────────────────────────────────
   DATA TYPES
───────────────────────────────────────── */
interface SkillNode {
  id: string;
  label: string;
  fullName: string;
  platform: string;
  date?: string;
  duration?: string;
  xp: number;
  skills?: string[];
  status: "unlocked" | "locked";
  size?: number; // override circle size in px
  icon?: string;
  badge?: string;
  certImage?: string;
  verifyUrl?: string;
  certId?: string;
  organizer?: string;
  isFinalBoss?: boolean;
}

interface Track {
  id: string;
  title: string;
  color: string;
  nodes: SkillNode[];
}

/* ─────────────────────────────────────────
   TRACK DATA
───────────────────────────────────────── */
const TRACKS: Track[] = [
  {
    id: "ml",
    title: "ML FOUNDATION",
    color: "#FF4500",
    nodes: [
      {
        id: "ml-az",
        label: "ML A-Z",
        fullName: "Machine Learning A-Z: AI, Python & R + ChatGPT Prize",
        platform: "Udemy",
        date: "Nov 18, 2025",
        duration: "43 hours",
        xp: 1500,
        skills: ["Python", "ML", "AI", "R", "ChatGPT"],
        status: "unlocked",
        size: 56,
        icon: "ML",
        certImage: "/certifications/Udemy ML.jpg",
      },
      {
        id: "ai-tools",
        label: "AI TOOLS",
        fullName: "AI Tools Skill Up",
        platform: "GeeksforGeeks × NationSkillUp",
        xp: 800,
        skills: ["AI Tools", "Productivity", "LLMs"],
        status: "unlocked",
        size: 44,
        icon: "AI",
        certImage: "/certifications/GFG Ai tools certificates.jpg",
      },
      {
        id: "deep-learning",
        label: "DEEP LEARNING",
        fullName: "Deep Learning Specialization",
        platform: "DeepLearning.AI (planned)",
        xp: 2000,
        status: "locked",
        size: 44,
      },
      {
        id: "tf-cert",
        label: "TF CERT",
        fullName: "TensorFlow Developer Certificate",
        platform: "Google (planned)",
        xp: 2500,
        status: "locked",
        size: 44,
      },
    ],
  },
  {
    id: "genai",
    title: "GENAI TRACK",
    color: "#00BFFF",
    nodes: [
      {
        id: "gen-ai-jam",
        label: "GEN AI JAM",
        fullName: "Gen AI Study Jam -24, Cohort-2",
        platform: "GDG On Campus IEC",
        date: "Nov 24, 2024",
        xp: 1000,
        skills: ["Google Cloud", "Generative AI", "Cloud Services"],
        status: "unlocked",
        size: 44,
        icon: "GDG",
        certImage: "/certifications/Gen Ai jam GDG.jpg",
      },
      {
        id: "claude-101",
        label: "CLAUDE 101",
        fullName: "Claude 101",
        platform: "Anthropic",
        xp: 600,
        skills: ["Claude API", "Prompt Engineering", "LLM Fundamentals"],
        status: "unlocked",
        size: 44,
        icon: "C1",
        certImage: "/certifications/Screenshot 2026-03-13 112028.png",
      },
      {
        id: "agent-skills",
        label: "AGENT SKILLS",
        fullName: "Introduction to Agent Skills",
        platform: "Anthropic",
        xp: 700,
        skills: ["AI Agents", "Tool Use", "Agentic Systems"],
        status: "unlocked",
        size: 44,
        icon: "AS",
        certImage: "/certifications/Screenshot 2026-03-13 152249.png",
      },
      {
        id: "claude-code",
        label: "CLAUDE CODE",
        fullName: "Claude Code in Action",
        platform: "Anthropic",
        date: "Mar 12, 2026",
        certId: "z5qwgk2bfyba",
        verifyUrl: "https://verify.skilljar.com/c/z5qwgk2bfyba",
        xp: 900,
        skills: ["Claude Code", "Agentic Coding", "AI-Assisted Development"],
        status: "unlocked",
        size: 48,
        icon: "CC",
        certImage: "/certifications/Screenshot 2026-03-13 152321.png",
      },
      {
        id: "anthropic-api",
        label: "ANTHROPIC API",
        fullName: "Claude with the Anthropic API",
        platform: "Anthropic",
        date: "March 13, 2026",
        certId: "gbxfgv3tanj",
        verifyUrl: "https://verify.skilljar.com/c/gbxfgv3tanj",
        xp: 1000,
        skills: ["Claude API", "REST API", "Integration", "Prompt Engineering", "API Development"],
        status: "unlocked",
        size: 48,
        icon: "API",
        badge: "NEW",
        certImage: "/certifications/API.png",
      },
      {
        id: "langchain",
        label: "LANGCHAIN",
        fullName: "LangChain + RAG Mastery",
        platform: "(planned)",
        xp: 1800,
        status: "locked",
        size: 44,
      },
      {
        id: "fine-tuning",
        label: "FINE-TUNING",
        fullName: "LoRA/QLoRA Fine-Tuning",
        platform: "(planned)",
        xp: 2200,
        status: "locked",
        size: 44,
      },
    ],
  },
  {
    id: "competitions",
    title: "HACKATHONS & CHALLENGES",
    color: "#CC44FF",
    nodes: [
      {
        id: "gdg-challenge",
        label: "GDG CHALLENGE",
        fullName: "GDG Solution Challenge 2025",
        platform: "Google Developer Groups On Campus × Hack2Skill",
        xp: 1200,
        skills: ["Real-world AI", "Problem Solving", "Google Tech Stack"],
        status: "unlocked",
        size: 52,
        icon: "GDG",
        badge: "ACHIEVEMENT",
        certImage: "/certifications/gdg hackerthon.jpg",
      },
      {
        id: "sih-2025",
        label: "SIH 2025",
        fullName: "Smart India Hackathon 2025",
        platform: "Govt. of India · IEC College Dept. of CSE/IT/CSE-AI & ML",
        date: "Sep 10, 2025",
        organizer: "Ministry of Education, Govt. of India",
        xp: 1500,
        skills: ["Problem Solving", "AI/ML", "National Level Competition", "Team Collaboration"],
        status: "unlocked",
        size: 52,
        icon: "SIH",
        badge: "NATIONAL",
        certImage: "/certifications/SIH.jpg",
      },
      {
        id: "kaggle-comp",
        label: "KAGGLE COMP",
        fullName: "Kaggle ML Competition",
        platform: "Kaggle (planned)",
        xp: 2000,
        status: "locked",
        size: 44,
      },
      {
        id: "open-source",
        label: "OPEN SOURCE",
        fullName: "Open Source Contribution",
        platform: "GitHub (planned)",
        xp: 1500,
        status: "locked",
        size: 44,
      },
    ],
  },
  {
    id: "future",
    title: "NEXT TARGETS",
    color: "rgba(255,255,255,0.15)",
    nodes: [
      {
        id: "mlops",
        label: "MLOPS",
        fullName: "MLOps Fundamentals",
        platform: "(planned)",
        xp: 1800,
        status: "locked",
        size: 44,
      },
      {
        id: "pytorch",
        label: "PYTORCH",
        fullName: "PyTorch Deep Learning",
        platform: "(planned)",
        xp: 1500,
        status: "locked",
        size: 44,
      },
      {
        id: "cloud-ml",
        label: "CLOUD ML",
        fullName: "Google Cloud ML Engineer",
        platform: "Google Cloud (planned)",
        xp: 3000,
        status: "locked",
        size: 44,
      },
      {
        id: "faang-ready",
        label: "FAANG READY",
        fullName: "FAANG ML Interview Ready",
        platform: "Personal Goal",
        xp: 5000,
        status: "locked",
        size: 44,
        isFinalBoss: true,
      },
    ],
  },
];

const STATS = [
  { label: "CERTS EARNED", value: 9 },
  { label: "COMPETITIONS", value: 2 },
  { label: "PLATFORMS", value: 5 },
  { label: "TOTAL XP", value: 9200, separator: true },
];

/* ─────────────────────────────────────────
   HELPER: hex to rgba
───────────────────────────────────────── */
function hexToRgba(hex: string, alpha: number) {
  if (hex.startsWith("rgba")) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* ─────────────────────────────────────────
   CONNECTOR COMPONENT
───────────────────────────────────────── */
function Connector({ fromStatus, toStatus, color, trackIndex, nodeIndex }: {
  fromStatus: "unlocked" | "locked";
  toStatus: "unlocked" | "locked";
  color: string;
  trackIndex: number;
  nodeIndex: number;
}) {
  const bothUnlocked = fromStatus === "unlocked" && toStatus === "unlocked";
  const isActive = bothUnlocked && !color.startsWith("rgba");
  const lineColor = bothUnlocked && !color.startsWith("rgba") ? color : "rgba(255,255,255,0.08)";

  return (
    <div className="relative flex flex-col items-center" style={{ height: 36, width: "100%" }}>
      <svg width="2" height="36" className="overflow-visible" style={{ position: "absolute", left: "50%", transform: "translateX(-50%)" }}>
        {bothUnlocked && !color.startsWith("rgba") ? (
          <line x1="1" y1="0" x2="1" y2="36" stroke={lineColor} strokeWidth="1.5" strokeOpacity="0.5" />
        ) : (
          <line x1="1" y1="0" x2="1" y2="36" stroke={lineColor} strokeWidth="1" strokeDasharray="4 4" />
        )}
      </svg>
      {/* Traveling dot for active connectors */}
      {isActive && (
        <motion.div
          style={{
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
            width: 4,
            height: 4,
            borderRadius: "50%",
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
          animate={{ top: [0, 32] }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear",
            delay: (trackIndex * 0.7) + (nodeIndex * 0.5),
          }}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   NODE COMPONENT
───────────────────────────────────────── */
function TreeNode({ node, color, trackIndex, nodeIndex, onNodeClick }: {
  node: SkillNode;
  color: string;
  trackIndex: number;
  nodeIndex: number;
  onNodeClick: (node: SkillNode) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [particles, setParticles] = useState<{ id: number; angle: number }[]>([]);
  const nodeRef = useRef<HTMLDivElement>(null);
  const isUnlocked = node.status === "unlocked";
  const isFuture = color.startsWith("rgba");
  const sz = node.size || 44;
  const resolvedColor = isUnlocked ? (isFuture ? "rgba(255,255,255,0.15)" : color) : "transparent";
  const breatheDuration = 3 + (trackIndex * 0.3) + (nodeIndex * 0.4);

  const handleMouseEnter = useCallback(() => {
    setHovered(true);
    if (isUnlocked && !isFuture) {
      setParticles([
        { id: Date.now(), angle: 0 },
        { id: Date.now() + 1, angle: 90 },
        { id: Date.now() + 2, angle: 180 },
        { id: Date.now() + 3, angle: 270 },
      ]);
    }
  }, [isUnlocked, isFuture]);

  const handleClick = useCallback(() => {
    if (isUnlocked && node.certImage) {
      onNodeClick(node);
    }
  }, [isUnlocked, node, onNodeClick]);

  return (
    <motion.div
      ref={nodeRef}
      className="relative flex flex-col items-center"
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 25,
        delay: 0.1 * nodeIndex,
      }}
      style={{ opacity: !isUnlocked ? 0.35 : 1 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setHovered(false)}
      onClick={handleClick}
    >
      {/* Particle burst on hover */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
            animate={{
              scale: [0, 1, 0],
              opacity: [0, 1, 0],
              x: Math.cos((p.angle * Math.PI) / 180) * 30,
              y: Math.sin((p.angle * Math.PI) / 180) * 30,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            onAnimationComplete={() =>
              setParticles((prev) => prev.filter((pp) => pp.id !== p.id))
            }
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 6px ${color}`,
              top: sz / 2,
              left: "50%",
              marginLeft: -2,
              zIndex: 10,
              pointerEvents: "none" as const,
            }}
          />
        ))}
      </AnimatePresence>

      {/* Badge (LATEST / ACHIEVEMENT / NATIONAL / FINAL BOSS) */}
      {node.badge && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap"
          style={{
            fontFamily: "monospace",
            fontSize: "0.5rem",
            letterSpacing: "0.1em",
            padding: "1px 6px",
            borderRadius: 6,
            background: isUnlocked ? hexToRgba(color, 0.2) : "rgba(255,255,255,0.05)",
            border: `1px solid ${isUnlocked ? color : "rgba(255,255,255,0.1)"}`,
            color: isUnlocked ? color : "rgba(255,255,255,0.3)",
          }}
        >
          {node.badge}
        </div>
      )}
      {node.isFinalBoss && (
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap"
          style={{
            fontFamily: "monospace",
            fontSize: "0.5rem",
            letterSpacing: "0.1em",
            padding: "1px 6px",
            borderRadius: 6,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.3)",
          }}
        >
          FINAL BOSS
        </div>
      )}

      {/* Node circle */}
      <motion.div
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: sz,
          height: sz,
          background: isUnlocked ? hexToRgba(color, 0.15) : "rgba(255,255,255,0.03)",
          border: isUnlocked
            ? `${sz >= 52 ? 2 : 1.5}px solid ${resolvedColor}`
            : "1.5px solid rgba(255,255,255,0.12)",
          boxShadow: isUnlocked && !isFuture
            ? `0 0 ${sz >= 52 ? 20 : 15}px ${hexToRgba(color, 0.3)}`
            : "none",
          cursor: isUnlocked && node.certImage ? "pointer" : "default",
        }}
        animate={
          isUnlocked && !isFuture
            ? { scale: [1, 1.04, 1] }
            : node.isFinalBoss
              ? { boxShadow: ["0 0 0px rgba(255,255,255,0.05)", "0 0 15px rgba(255,255,255,0.1)", "0 0 0px rgba(255,255,255,0.05)"] }
              : { opacity: [0.35, 0.2, 0.35] }
        }
        transition={{
          duration: isUnlocked ? breatheDuration : 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        whileHover={isUnlocked ? { scale: 1.1 } : {}}
      >
        {isUnlocked ? (
          <span
            style={{
              fontFamily: "var(--font-orbitron), 'Space Grotesk', monospace",
              fontSize: sz >= 52 ? "0.65rem" : "0.55rem",
              fontWeight: 700,
              color: isFuture ? "rgba(255,255,255,0.3)" : color,
              letterSpacing: "0.05em",
              userSelect: "none",
            }}
          >
            {node.icon || node.label.slice(0, 2)}
          </span>
        ) : (
          <Lock size={16} color="rgba(255,255,255,0.2)" />
        )}
      </motion.div>

      {/* Label */}
      <span
        className="mt-1.5 text-center leading-tight"
        style={{
          fontFamily: "monospace",
          fontSize: "0.6rem",
          color: isUnlocked ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.25)",
          maxWidth: 80,
          letterSpacing: "0.05em",
        }}
      >
        {node.label}
      </span>

      {/* Platform */}
      {isUnlocked && (
        <span
          className="text-center leading-tight"
          style={{
            fontFamily: "monospace",
            fontSize: "0.5rem",
            color: "rgba(255,255,255,0.35)",
            maxWidth: 80,
          }}
        >
          {node.platform}
        </span>
      )}

      {/* Locked badge */}
      {!isUnlocked && !node.isFinalBoss && !node.badge && (
        <span
          className="mt-0.5"
          style={{
            fontFamily: "monospace",
            fontSize: "0.45rem",
            color: "rgba(255,255,255,0.2)",
            background: "rgba(255,255,255,0.04)",
            padding: "1px 6px",
            borderRadius: 8,
            letterSpacing: "0.1em",
          }}
        >
          LOCKED
        </span>
      )}

      {/* TOOLTIP */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute z-[9999] pointer-events-none"
            style={{
              bottom: "calc(100% + 12px)",
              left: "50%",
              transform: "translateX(-50%)",
              width: 220,
              background: "rgba(5,5,8,0.95)",
              border: `1px solid ${isUnlocked && !isFuture ? color : "rgba(255,255,255,0.1)"}`,
              borderRadius: 10,
              padding: "12px 16px",
              backdropFilter: "blur(12px)",
            }}
          >
            {isUnlocked ? (
              <>
                <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: isFuture ? "rgba(255,255,255,0.3)" : color, marginBottom: 2 }}>
                  {node.platform}
                </div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "white", fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
                  {node.fullName}
                </div>
                {node.date && (
                  <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>
                    {node.date}
                    {node.duration && ` · ${node.duration}`}
                  </div>
                )}
                {node.organizer && (
                  <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "rgba(255,255,255,0.35)", marginBottom: 4 }}>
                    {node.organizer}
                  </div>
                )}
                <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 0" }} />
                {node.skills && node.skills.length > 0 && (
                  <>
                    <div style={{ fontFamily: "monospace", fontSize: "0.55rem", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>SKILLS:</div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {node.skills.map((s) => (
                        <span
                          key={s}
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.5rem",
                            padding: "1px 5px",
                            borderRadius: 4,
                            background: "rgba(255,255,255,0.04)",
                            border: `1px solid ${isFuture ? "rgba(255,255,255,0.1)" : hexToRgba(color, 0.3)}`,
                            color: "rgba(255,255,255,0.7)",
                          }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </>
                )}
                <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 0" }} />
                <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: isFuture ? "rgba(255,255,255,0.3)" : color }}>
                  +{node.xp.toLocaleString()} XP &nbsp;·&nbsp; ✓ COMPLETED
                </div>
                {node.verifyUrl && (
                  <div className="mt-1 pointer-events-auto">
                    <a
                      href={node.verifyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontFamily: "monospace",
                        fontSize: "0.65rem",
                        color: "#00BFFF",
                        textDecoration: "none",
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      VERIFY CERT ↗
                    </a>
                  </div>
                )}
              </>
            ) : (
              <>
                <div style={{ fontFamily: "monospace", fontSize: "0.7rem", color: "rgba(255,255,255,0.4)", marginBottom: 4 }}>🔒 LOCKED</div>
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "0.85rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, marginBottom: 4, lineHeight: 1.3 }}>
                  {node.fullName}
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "0.6rem", color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>
                  {node.platform}
                </div>
                <div style={{ width: "100%", height: 1, background: "rgba(255,255,255,0.08)", margin: "6px 0" }} />
                <div style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.35)" }}>
                  +{node.xp.toLocaleString()} XP to unlock
                </div>
                <div style={{ fontFamily: "monospace", fontSize: "0.5rem", color: "rgba(255,255,255,0.2)", marginTop: 2 }}>
                  Add to roadmap
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─────────────────────────────────────────
   CERTIFICATE MODAL
───────────────────────────────────────── */
function CertModal({ node, onClose }: { node: SkillNode | null; onClose: () => void }) {
  useEffect(() => {
    if (!node) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [node, onClose]);

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[10000] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(8px)" }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="relative max-w-[800px] w-[90vw] max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-2 -right-2 z-10 flex items-center justify-center rounded-full transition-colors"
              style={{
                width: 36,
                height: 36,
                background: "rgba(255,255,255,0.1)",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <X size={18} color="white" />
            </button>

            {/* Image */}
            <div className="w-full overflow-hidden rounded-lg" style={{ border: "1px solid rgba(255,255,255,0.1)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={node.certImage}
                alt={node.fullName}
                className="w-full h-auto object-contain"
                style={{ maxHeight: "70vh" }}
              />
            </div>

            {/* Caption */}
            <div className="mt-4 text-center">
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: "1rem", color: "white", fontWeight: 600 }}>
                {node.fullName}
              </div>
              <div style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "rgba(255,255,255,0.4)", marginTop: 4 }}>
                {node.platform}
                {node.date && ` · ${node.date}`}
              </div>
              {node.verifyUrl && (
                <a
                  href={node.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2"
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    color: "#00BFFF",
                    textDecoration: "none",
                  }}
                >
                  VERIFY CERT ↗
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─────────────────────────────────────────
   MAIN SKILL TREE COMPONENT
───────────────────────────────────────── */
export default function SkillTree() {
  const [modalNode, setModalNode] = useState<SkillNode | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <>
      <CertModal node={modalNode} onClose={() => setModalNode(null)} />
      <section
        ref={sectionRef}
        id="skill-tree"
        className="relative w-full min-h-screen py-20 px-4 md:px-12 lg:px-20 overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,69,0,0.04) 0%, transparent 70%), #050508",
        }}
      >
        {/* Top fade */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '160px', background: 'linear-gradient(to bottom, #050508 0%, transparent 100%)', zIndex: 10, pointerEvents: 'none' }} />
        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '160px', background: 'linear-gradient(to top, #050508 0%, transparent 100%)', zIndex: 10, pointerEvents: 'none' }} />

        {/* ── SECTION HEADING ── */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center mb-4"
        >
          <h2
            className="font-display text-[clamp(2rem,5vw,4rem)] font-bold tracking-wider uppercase"
            style={{ fontFamily: "var(--font-orbitron), 'Space Grotesk', sans-serif" }}
          >
            SKILL{" "}
            <span className="text-[#FF4500]">TREE.</span>
          </h2>
          <p
            style={{
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: "rgba(255,255,255,0.35)",
              letterSpacing: "0.2em",
              marginTop: 8,
            }}
          >
            CERTIFICATIONS · COMPETITIONS · GROWTH
          </p>
        </motion.div>

        {/* ── XP BAR ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center mb-8"
        >
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "0.7rem",
              color: "#FF4500",
              letterSpacing: "0.1em",
              marginBottom: 8,
            }}
          >
            TOTAL XP: 9,200 · RANK: AI ENGINEER II
          </div>
          <div
            style={{
              width: "min(400px, 80%)",
              height: 4,
              borderRadius: 2,
              background: "rgba(255,255,255,0.05)",
              overflow: "hidden",
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "78%" }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              style={{
                height: "100%",
                borderRadius: 2,
                background: "linear-gradient(90deg, #FF4500, #FF8C00)",
              }}
            />
          </div>
        </motion.div>

        {/* ── LEGEND ── */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center gap-6 mb-10 flex-wrap"
        >
          {[
            { color: "#FF4500", label: "UNLOCKED" },
            { color: "#00BFFF", label: "IN PROGRESS" },
            { color: "rgba(255,255,255,0.3)", label: "PLANNED" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: item.color,
                }}
              />
              <span style={{ fontFamily: "monospace", fontSize: "0.65rem", color: "rgba(255,255,255,0.5)" }}>
                {item.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* ── TREE TRACKS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 max-w-6xl mx-auto">
          {TRACKS.map((track, ti) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-5%" }}
              transition={{ duration: 0.6, delay: ti * 0.15 }}
              className="flex flex-col items-center"
            >
              {/* Track header */}
              <div className="w-full mb-4">
                <div
                  style={{
                    height: 2,
                    background: track.color,
                    borderRadius: 1,
                    marginBottom: 8,
                    opacity: track.id === "future" ? 0.15 : 0.6,
                  }}
                />
                <div
                  style={{
                    fontFamily: "monospace",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    color: "rgba(255,255,255,0.3)",
                    textAlign: "center",
                  }}
                >
                  {track.title}
                </div>
              </div>

              {/* Nodes */}
              <div className="flex flex-col items-center gap-0">
                {track.nodes.map((node, ni) => (
                  <React.Fragment key={node.id}>
                    <TreeNode
                      node={node}
                      color={track.color}
                      trackIndex={ti}
                      nodeIndex={ni}
                      onNodeClick={(n) => setModalNode(n)}
                    />
                    {ni < track.nodes.length - 1 && (
                      <Connector
                        fromStatus={node.status}
                        toStatus={track.nodes[ni + 1].status}
                        color={track.color}
                        trackIndex={ti}
                        nodeIndex={ni}
                      />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── STATS ROW ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-5%" }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto"
        >
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center justify-center py-5 px-3 rounded-xl"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div
                className="font-display font-bold text-2xl md:text-3xl"
                style={{ color: "#FF4500" }}
              >
                <Counter from={0} to={stat.value} duration={1.5} separator={stat.separator} />
              </div>
              <div
                style={{
                  fontFamily: "monospace",
                  fontSize: "0.6rem",
                  color: "rgba(255,255,255,0.4)",
                  letterSpacing: "0.1em",
                  marginTop: 4,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </section>
    </>
  );
}
