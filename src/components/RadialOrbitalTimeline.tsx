"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Briefcase, Github, Linkedin, Mail, Rocket, X } from 'lucide-react';
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Tilt } from "./ui/tilt";
import { Spotlight } from "./ui/spotlight";
import { Card3D } from "./ui/Card3D";

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

// ----------------------------------------------------------------------------
// DATA DEFINITION
// ----------------------------------------------------------------------------
interface NodeData {
    id: number;
    title: string;
    date: string;
    content: string;
    category: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    status: 'completed' | 'in-progress' | 'pending';
    energy: number;
    relatedIds: number[];
    actionUrl?: string;
    actionText?: string;
}

const NODES: NodeData[] = [
    {
        id: 1,
        title: "Collaborate",
        date: "Open Now",
        content: "Looking for research partnerships, open source collabs, and innovative AI projects.",
        category: "Research",
        icon: Users,
        status: "in-progress",
        energy: 95,
        relatedIds: [2, 3]
    },
    {
        id: 2,
        title: "Hire Me",
        date: "Available",
        content: "Open to ML Engineer, GenAI, and Computer Vision roles — internships or full-time.",
        category: "Career",
        icon: Briefcase,
        status: "in-progress",
        energy: 90,
        relatedIds: [1, 4]
    },
    {
        id: 3,
        title: "GitHub",
        date: "Active",
        content: "Explore my open source projects, experiments, and code repositories.",
        category: "Code",
        icon: Github,
        status: "completed",
        energy: 85,
        relatedIds: [1, 5],
        actionUrl: "https://github.com/aryan00756",
        actionText: "Visit GitHub",
    },
    {
        id: 4,
        title: "LinkedIn",
        date: "Connected",
        content: "Connect professionally. Let's grow our networks and explore opportunities together.",
        category: "Network",
        icon: Linkedin,
        status: "completed",
        energy: 80,
        relatedIds: [2, 5],
        actionUrl: "https://www.linkedin.com/in/aryan0203",
        actionText: "Visit LinkedIn",
    },
    {
        id: 5,
        title: "Email Me",
        date: "24hr Reply",
        content: "Drop a message for any collaboration, project inquiry, or just to say hello.",
        category: "Contact",
        icon: Mail,
        status: "pending",
        energy: 75,
        relatedIds: [3, 4],
        actionUrl: "mailto:ay6033756@gmail.com",
        actionText: "Send Email",
    },
    {
        id: 6,
        title: "Let's Build",
        date: "Now",
        content: "Have an idea that needs AI? Let's turn it into reality together. No idea is too ambitious.",
        category: "Vision",
        icon: Rocket,
        status: "in-progress",
        energy: 100,
        relatedIds: [1, 2]
    }
];

// ----------------------------------------------------------------------------
// COMPONENT
// ----------------------------------------------------------------------------
interface Props {
    className?: string;
    onNodeStateChange?: (expandedNodeId: number | null) => void;
}

export default function RadialOrbitalTimeline({ className, onNodeStateChange }: Props) {
    const [expandedNodeId, setExpandedNodeId] = useState<number | null>(null);
    const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null);
    const [rotationBase, setRotationBase] = useState(0);
    const isPaused = expandedNodeId !== null || hoveredNodeId !== null;

    const [viewportSize, setViewportSize] = useState({ w: 1024, h: 768 });

    // Auto-rotation logic
    useEffect(() => {
        let animationFrameId: number;
        let lastTime = performance.now();

        const rotate = (time: number) => {
            if (!isPaused) {
                const deltaTime = time - lastTime;
                // 0.3 deg / 50ms = 6 deg / second
                const rotationDelta = (deltaTime / 1000) * 6;
                setRotationBase((prev) => (prev + rotationDelta) % 360);
            }
            lastTime = time;
            animationFrameId = requestAnimationFrame(rotate);
        };

        animationFrameId = requestAnimationFrame(rotate);
        return () => cancelAnimationFrame(animationFrameId);
    }, [isPaused]);

    const [isMounted, setIsMounted] = useState(false);

    // EASTER EGG STATE
    const [centerClicks, setCenterClicks] = useState(0);
    const [isEggActive, setIsEggActive] = useState(false);
    const eggTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleCenterClick = () => {
        setCenterClicks(prev => prev + 1);
        if (eggTimeoutRef.current) clearTimeout(eggTimeoutRef.current);
        eggTimeoutRef.current = setTimeout(() => setCenterClicks(0), 800);
    };

    useEffect(() => {
        if (centerClicks >= 3 && !isEggActive) {
            setCenterClicks(0);
            setIsEggActive(true);
            setTimeout(() => {
                setIsEggActive(false);
            }, 4000); // Active for 4 seconds
        }
    }, [centerClicks, isEggActive]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
        if (typeof window !== 'undefined') {
            setViewportSize({ w: window.innerWidth, h: window.innerHeight });
            const handleResize = () => setViewportSize({ w: window.innerWidth, h: window.innerHeight });
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    // Notify parent of state changes (e.g., to blur the background more)
    useEffect(() => {
        onNodeStateChange?.(expandedNodeId);
    }, [expandedNodeId, onNodeStateChange]);

    const handleNodeClick = (node: NodeData) => {
        if (node.id === 3 || node.id === 4 || node.id === 5) {
            // Direct link opening for social nodes
            if (node.actionUrl) {
                window.open(node.actionUrl, '_blank');
            }
            return;
        }
        if (expandedNodeId === node.id) {
            setExpandedNodeId(null);
        } else {
            setExpandedNodeId(node.id);
        }
    };

    const getStatusColor = (status: NodeData['status']) => {
        switch (status) {
            case 'completed': return 'bg-[#FF4500] text-white';
            case 'in-progress': return 'bg-[#00BFFF] text-black';
            case 'pending': return 'bg-transparent border border-[#FF4500] text-[#FF4500]';
            default: return 'bg-gray-500 text-white';
        }
    };

    const getCardPosition = (nodeX: number, nodeY: number) => {
        const cardW = 320;
        const cardH = 220;

        const absX = (viewportSize.w / 2) + nodeX;
        const absY = (viewportSize.h / 2) + nodeY;

        let top = absY > viewportSize.h / 2 ? -(cardH + 20) : 60;
        let left = absX > viewportSize.w / 2 ? -(cardW - 40) : -(cardW / 2 - 20);

        const absoluteLeft = absX + left;
        const absoluteTop = absY + top;

        if (absoluteLeft < 16) left += (16 - absoluteLeft);
        if (absoluteLeft + cardW > viewportSize.w - 16)
            left -= (absoluteLeft + cardW - viewportSize.w + 16);
        if (absoluteTop < 16) top += (16 - absoluteTop);
        if (absoluteTop + cardH > viewportSize.h - 16)
            top -= (absoluteTop + cardH - viewportSize.h + 16);

        return { top, left };
    };

    const radius = 220; // Radius for nodes placement

    const currentScale = viewportSize.w < 768 ? 0.55 : (viewportSize.w < 1280 ? 0.75 : 1);
    const expandedNode = expandedNodeId !== null ? NODES.find(n => n.id === expandedNodeId) : null;
    let expandedNodePos = { top: 0, left: 0 };
    if (expandedNodeId !== null) {
        const activeIndex = NODES.findIndex(n => n.id === expandedNodeId);
        const angle = (activeIndex * (360 / NODES.length) + rotationBase) * (Math.PI / 180);
        const x = Number((Math.cos(angle) * radius).toFixed(2));
        const y = Number((Math.sin(angle) * radius).toFixed(2));

        // Use base absolute positions then add offsets to position relative to the scaled root container
        const offsets = getCardPosition(x, y);
        expandedNodePos = {
            top: (viewportSize.h / 2) + (y * currentScale) + offsets.top,
            left: (viewportSize.w / 2) + (x * currentScale) + offsets.left
        };
    }

    return (
        <div className={cn("relative w-full max-w-5xl mx-auto min-h-[600px] flex items-center justify-center", className)}>

            {/* ORBITAL VIEW (Desktop & Mobile) */}
            <div className="flex relative w-full h-full items-center justify-center max-md:scale-[0.55] md:max-xl:scale-[0.75] origin-center -mt-10 md:mt-0">

                {/* CONNECTION LINES (SVG layer behind nodes) */}
                {isMounted && (
                    <svg className="absolute top-1/2 left-1/2 pointer-events-none z-0 overflow-visible">
                        <g>
                            {NODES.map((node, i) => {
                                const angleA = ((i * (360 / NODES.length) + rotationBase) * Math.PI) / 180;
                                const xA = Number((Math.cos(angleA) * radius).toFixed(2));
                                const yA = Number((Math.sin(angleA) * radius).toFixed(2));

                                return node.relatedIds.map(targetId => {
                                    // Only draw lines in one direction to avoid duplicates
                                    if (targetId <= node.id) return null;

                                    const targetIndex = NODES.findIndex(n => n.id === targetId);
                                    const angleB = ((targetIndex * (360 / NODES.length) + rotationBase) * Math.PI) / 180;
                                    const xB = Number((Math.cos(angleB) * radius).toFixed(2));
                                    const yB = Number((Math.sin(angleB) * radius).toFixed(2));

                                    const isActive = (hoveredNodeId === node.id || hoveredNodeId === targetId) ||
                                        (expandedNodeId === node.id || expandedNodeId === targetId);

                                    return (
                                        <g key={`${node.id}-${targetId}`}>
                                            <line
                                                x1={xA} y1={yA} x2={xB} y2={yB}
                                                stroke={isActive ? "rgba(0,191,255,0.6)" : "rgba(255,100,0,0.15)"}
                                                strokeWidth={isActive ? 2 : 1}
                                                className="transition-colors duration-500"
                                            />
                                            {/* Traveling Light Dot */}
                                            {isActive && (
                                                <circle r="3" fill="#FF4500">
                                                    <animateMotion
                                                        dur="2s"
                                                        repeatCount="indefinite"
                                                        path={`M ${xA},${yA} L ${xB},${yB}`}
                                                    />
                                                </circle>
                                            )}
                                        </g>
                                    );
                                });
                            })}

                            {/* Inner Core Connection Lines (Optional) */}
                            {NODES.map((node, i) => {
                                const angleA = ((i * (360 / NODES.length) + rotationBase) * Math.PI) / 180;
                                const xA = Number((Math.cos(angleA) * radius).toFixed(2));
                                const yA = Number((Math.sin(angleA) * radius).toFixed(2));
                                const isActive = hoveredNodeId === node.id || expandedNodeId === node.id;

                                return (
                                    <line
                                        key={`core-${node.id}`}
                                        x1={0} y1={0} x2={xA} y2={yA}
                                        stroke={isActive ? "rgba(0,191,255,0.3)" : "transparent"}
                                        strokeWidth={1}
                                        className="transition-colors duration-500"
                                    />
                                );
                            })}
                        </g>
                    </svg>
                )}

                {/* ORBITAL RINGS */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(255,100,0,0.2)]"
                        style={{ width: radius * 2, height: radius * 2 }}
                    />
                    <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[rgba(0,191,255,0.15)]"
                        style={{ width: radius * 2 + 30, height: radius * 2 + 30 }}
                    />
                </div>

                {/* CENTER CORE NODE */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
                    {/* Pulsing glow rings */}
                    <motion.div
                        animate={isEggActive ? { scale: [1, 4, 1.5], opacity: [0.8, 0, 0] } : { scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: isEggActive ? 1 : 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 rounded-full border-2 border-[#FF4500] scale-150 pointer-events-none"
                    />
                    <motion.div
                        animate={isEggActive ? { scale: [1, 5, 2], opacity: [0.8, 0, 0] } : { scale: [1, 1.8, 1], opacity: [0.3, 0, 0.3] }}
                        transition={{ duration: isEggActive ? 1 : 4, repeat: Infinity, ease: "easeInOut", delay: isEggActive ? 0.2 : 1 }}
                        className="absolute inset-0 rounded-full border-2 border-[#00BFFF] scale-150 pointer-events-none"
                    />
                    <motion.button
                        onClick={handleCenterClick}
                        whileTap={{ scale: 0.9 }}
                        animate={isEggActive ? { scale: [1, 0, 1] } : {}}
                        transition={{ duration: 0.8, times: [0, 0.5, 1] }}
                        className={cn(
                            "w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-[#FF4500] via-[#FF8C00] to-[#00BFFF] shadow-[0_0_30px_rgba(255,69,0,0.4)] border border-white/20 transition-all duration-300",
                            isEggActive && "shadow-[0_0_60px_rgba(255,69,0,0.8),0_0_60px_rgba(0,191,255,0.8)] border-[rgba(255,255,255,0.8)] animate-pulse"
                        )}
                    >
                        <span className="font-display font-bold text-3xl text-white tracking-widest drop-shadow-md pointer-events-none">AY</span>
                    </motion.button>

                    <AnimatePresence>
                        {isEggActive && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.5, y: -40 }}
                                animate={{ opacity: 1, scale: 1, y: -80 }}
                                exit={{ opacity: 0, scale: 0.8, y: -60 }}
                                transition={{ type: "spring", duration: 0.6, delay: 0.4 }}
                                className="absolute font-display font-bold text-lg md:text-xl text-white text-center w-[300px] drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] pointer-events-none"
                            >
                                Building the future, one model at a time.
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* ORBITAL NODES */}
                {
                    NODES.map((node, i) => {
                        const angle = (i * (360 / NODES.length) + rotationBase) * (Math.PI / 180);
                        const x = Number((Math.cos(angle) * radius).toFixed(2));
                        const y = Number((Math.sin(angle) * radius).toFixed(2));

                        const isExpanded = expandedNodeId === node.id;
                        const isHovered = hoveredNodeId === node.id;
                        const isRelated = expandedNodeId !== null && NODES.find(n => n.id === expandedNodeId)?.relatedIds.includes(node.id);
                        const isDimmed = expandedNodeId !== null && !isExpanded && !isRelated;
                        const isSocial = node.id === 3 || node.id === 4 || node.id === 5;
                        const pos = getCardPosition(x, y);

                        const Icon = node.icon;

                        return (
                            <motion.div
                                key={node.id}
                                initial={{ opacity: 0, scale: 0, x: "-50%", y: "-50%" }}
                                animate={{ opacity: 1, scale: 1, x: "-50%", y: "-50%" }}
                                transition={{ delay: i * 0.1, duration: 0.8, ease: "easeOut" }}
                                className="absolute z-20"
                                style={{ left: `calc(50% + ${x}px)`, top: `calc(50% + ${y}px)` }}
                            >
                                <motion.div
                                    animate={isEggActive ? { x: Math.cos(angle) * 150, y: Math.sin(angle) * 150, scale: 0.8 } : { x: 0, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: isEggActive ? 100 : 250, damping: isEggActive ? 6 : 12 }}
                                    className="relative"
                                >
                                    {/* Node Button */}
                                    <button
                                        onClick={() => handleNodeClick(node)}
                                        onMouseEnter={() => setHoveredNodeId(node.id)}
                                        onMouseLeave={() => setHoveredNodeId(null)}
                                        className={cn(
                                            "flex flex-col items-center justify-center w-16 h-16 rounded-full transition-all duration-300",
                                            isExpanded ? "bg-gradient-to-br from-[#FF4500] to-[#FF8C00] border-2 border-[#FF4500] text-white shadow-[0_0_20px_rgba(255,69,0,0.9),0_0_40px_rgba(255,69,0,0.5),0_0_60px_rgba(0,191,255,0.3)] z-30 scale-150" :
                                                isRelated ? "bg-[rgba(0,191,255,0.15)] border-2 border-[#00BFFF] shadow-[0_0_15px_rgba(0,191,255,1),0_0_30px_rgba(0,191,255,0.7),0_0_50px_rgba(0,191,255,0.4)] text-[#00BFFF] animate-pulse scale-110" :
                                                    isDimmed ? "opacity-25 border border-white/15 bg-[rgba(0,0,0,0.7)] text-[#FF6600]" :
                                                        "bg-[rgba(0,0,0,0.7)] border border-[rgba(255,100,0,0.4)] text-[#FF6600] opacity-100 hover:shadow-[0_0_12px_rgba(255,100,0,0.6)] hover:scale-110",
                                            isDimmed && "pointer-events-none hover:scale-100" // prevent hover if dimmed
                                        )}
                                    >
                                        <Icon size={isExpanded ? 20 : 24} className={isExpanded ? "text-white" : ""} />
                                        {isSocial && <ExternalLinkIcon size={12} className={cn("absolute top-2 right-2", isDimmed ? "opacity-20" : "opacity-70")} />}
                                        {/* Subtle Label for non-expanded state */}
                                        {!isExpanded && (
                                            <span className={cn("absolute -bottom-6 font-mono text-[10px] whitespace-nowrap tracking-wider", isDimmed ? "opacity-25" : "opacity-70")}>
                                                {node.title}
                                            </span>
                                        )}
                                    </button>
                                </motion.div>
                            </motion.div>
                        );
                    })
                }
            </div>

            {/* Expanded Card Popup (Rendered outside scaled container to fix mobile positioning / sizing) */}
            <AnimatePresence>
                {expandedNode && !(expandedNode.id === 3 || expandedNode.id === 4 || expandedNode.id === 5) && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className={cn(
                            "absolute z-40",
                            "max-md:!fixed max-md:!bottom-8 max-md:!top-auto max-md:!left-1/2 max-md:!-translate-x-1/2 max-md:w-[calc(100vw-32px)] max-md:max-w-sm"
                        )}
                        style={viewportSize.w < 768 ? {} : {
                            width: '320px',
                            top: `${expandedNodePos.top}px`,
                            left: `${expandedNodePos.left}px`
                        }}
                    >
                        <button
                            onClick={(e) => { e.stopPropagation(); setExpandedNodeId(null); }}
                            className="absolute z-[100] top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 bg-black/40 rounded-full backdrop-blur-md border border-white/10 hover:bg-white/10"
                        >
                            <X size={14} />
                        </button>

                        <Card3D
                            title={
                                <div className="flex flex-col gap-1 -mt-1">
                                    <span className="font-display font-bold text-xl text-white tracking-wide">{expandedNode.title}</span>
                                    <span className="font-mono text-[10px] text-[#FF4500] uppercase tracking-wider">{expandedNode.category} &middot; {expandedNode.date}</span>
                                </div>
                            }
                            description={
                                <span className="text-sm text-white/70 leading-relaxed font-light">
                                    {expandedNode.content}
                                </span>
                            }
                            icon={expandedNode.icon}
                            theme={expandedNode.id % 2 === 0 ? "orange" : "blue"}
                            size="sm"
                            variant="premium"
                            className="pt-10" // Padding top to avoid the absolute positioned Close button
                        >
                            <div className="space-y-4 relative z-20 pointer-events-auto">
                                <div className="flex items-center justify-between text-xs font-mono pointer-events-none">
                                    <span className="text-gray-400">STATUS</span>
                                    <span className={cn("px-2 py-0.5 rounded uppercase text-[10px] font-bold tracking-wider", getStatusColor(expandedNode.status))}>
                                        {expandedNode.status.replace('-', ' ')}
                                    </span>
                                </div>

                                <div className="pointer-events-none">
                                    <div className="flex justify-between text-xs font-mono mb-1 text-gray-400">
                                        <span>ALIGNMENT</span>
                                        <span>{expandedNode.energy}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${expandedNode.energy}%` }}
                                            transition={{ duration: 1, delay: 0.2 }}
                                            className="h-full bg-gradient-to-r from-[#FF4500] to-[#00BFFF] shadow-[0_0_10px_rgba(0,191,255,0.5)]"
                                        />
                                    </div>
                                </div>

                                {expandedNode.actionUrl && (
                                    <motion.a
                                        href={expandedNode.actionUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 rounded-lg border border-[#00BFFF]/50 bg-gradient-to-r from-[#00BFFF]/10 to-[#FF4500]/10 hover:from-[#00BFFF]/20 hover:to-[#FF4500]/20 text-white font-mono text-sm uppercase tracking-wider transition-all pointer-events-auto cursor-pointer"
                                    >
                                        <span>{expandedNode.actionText || "Explore"}</span>
                                        <expandedNode.icon size={14} />
                                    </motion.a>
                                )}
                            </div>
                        </Card3D>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// Minimal icon fallback if not imported above
const ExternalLinkIcon = ({ size = 12, className }: { size?: number, className?: string }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line>
    </svg>
);
