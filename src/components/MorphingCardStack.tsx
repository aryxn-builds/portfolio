"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useInView } from 'framer-motion';
import { Eye, Activity, Brain, Layers, Grid, List, ExternalLink, Github } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CardStack, { type CardStackItem } from './CardStack';
import { Tilt } from "./ui/tilt";
import { Spotlight } from "./ui/spotlight";
import { Card3D, Card3DList } from "./ui/Card3D";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// ─── Static fallback cards (used when GitHub API fails) ───────────────────────
const STATIC_CARDS = [
    {
        id: "1",
        title: "Customer Churn Prediction (ANN)",
        description: "Predicts customer churn using an Artificial Neural Network built with TensorFlow/Keras, deployed as an interactive Streamlit web app.",
        icon: Brain,
        tags: ["TensorFlow", "Keras", "Streamlit"],
        link: "https://github.com/aryxn-builds/ANN-Chrun-Project",
        liveUrl: null as string | null,
        stars: 0,
        forks: 0,
        language: null as string | null,
        languageColor: '#FF4500',
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "2",
        title: "IMDB Sentiment Classifier (RNN)",
        description: "Binary sentiment classification on IMDB movie reviews using a Recurrent Neural Network with embedding and SimpleRNN layers.",
        icon: Activity,
        tags: ["TensorFlow", "Keras", "Scikit-Learn"],
        link: "https://github.com/aryxn-builds/IMDB-Sentiment-Classification-using-Recurrent-Neural-Networks",
        liveUrl: null as string | null,
        stars: 0,
        forks: 0,
        language: null as string | null,
        languageColor: '#FF4500',
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "3",
        title: "Trader Profitability Predictor",
        description: "Neural network model predicting trader profitability based on trade frequency, size, and market sentiment, deployed via Streamlit.",
        icon: Layers,
        tags: ["TensorFlow", "Streamlit", "Pandas"],
        link: "https://github.com/aryxn-builds/trader-profit-prediction",
        liveUrl: null as string | null,
        stars: 0,
        forks: 0,
        language: null as string | null,
        languageColor: '#FF4500',
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "4",
        title: "Pose-Based Movement Analysis",
        description: "Cricket player movement analysis using MediaPipe Pose estimation — tracks hip, knee and ankle keypoints to compute knee angle metrics.",
        icon: Eye,
        tags: ["MediaPipe", "OpenCV", "Python"],
        link: "https://github.com/aryxn-builds/-pose-based-movement-analysis",
        liveUrl: null as string | null,
        stars: 0,
        forks: 0,
        language: null as string | null,
        languageColor: '#FF4500',
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "5",
        title: "YOLO Object Detection Lab",
        description: "Hands-on exploration of YOLO (You Only Look Once) for real-time object detection with custom weights and training pipelines.",
        icon: Grid,
        tags: ["YOLO", "OpenCV", "Python"],
        link: "https://github.com/aryxn-builds/YOLO-Learning",
        liveUrl: null as string | null,
        stars: 0,
        forks: 0,
        language: null as string | null,
        languageColor: '#FF4500',
        linkLabel: "ACCESS REPOSITORY ↗"
    }
];

// ─── Unsplash images for card backgrounds ────────────────────────────────────
const BG_IMAGES = [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop",
];

const ICONS = [Brain, Activity, Layers, Eye, Grid, Github];

// ─── Types ────────────────────────────────────────────────────────────────────
type ProjectCard = {
    id: string;
    title: string;
    description: string;
    icon: React.ElementType<{ size?: number; className?: string }>;
    tags: string[];
    link: string;
    liveUrl: string | null;
    stars: number;
    forks: number;
    language: string | null;
    languageColor: string;
    linkLabel: string;
};

type LayoutMode = 'stack' | 'grid' | 'list';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatRepoName(name: string): string {
    return name
        .replace(/-/g, ' ')
        .replace(/_/g, ' ')
        .split(' ')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function buildCardStackItems(cards: ProjectCard[]): CardStackItem[] {
    return cards.map((card, idx) => ({
        id: card.id,
        title: card.title,
        description: card.description,
        href: card.link,
        imageSrc: BG_IMAGES[idx % BG_IMAGES.length],
        originalCard: card,
    }));
}

// ─── Skeleton loading cards ───────────────────────────────────────────────────
function SkeletonCards() {
    return (
        <div className="flex flex-col items-center w-full">
            <style>{`
                @keyframes shimmer {
                    0%   { background-position: -200% 0 }
                    100% { background-position:  200% 0 }
                }
                .shimmer-card {
                    background: linear-gradient(
                        90deg,
                        rgba(255,255,255,0.03) 25%,
                        rgba(255,255,255,0.07) 50%,
                        rgba(255,255,255,0.03) 75%
                    );
                    background-size: 200% 100%;
                    animation: shimmer 1.5s infinite;
                    border: 0.5px solid rgba(255,255,255,0.06);
                    border-radius: 16px;
                    height: 280px;
                }
            `}</style>
            <div className="w-full max-w-[520px] flex flex-col gap-4">
                {[0, 1, 2].map((i) => (
                    <div key={i} className="shimmer-card w-full" />
                ))}
            </div>
            <p
                className="mt-6"
                style={{
                    fontFamily: 'monospace',
                    fontSize: '0.65rem',
                    color: 'rgba(255,255,255,0.25)',
                    letterSpacing: '0.1em',
                    textAlign: 'center',
                }}
            >
                FETCHING PINNED REPOS...
            </p>
        </div>
    );
}

// ─── Live badge ───────────────────────────────────────────────────────────────
function LiveBadge() {
    return (
        <div
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(0,191,255,0.08)',
                border: '0.5px solid rgba(0,191,255,0.3)',
                borderRadius: '20px',
                padding: '4px 12px',
                marginBottom: '24px',
            }}
        >
            {/* Pulsing dot */}
            <span
                style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: '#00BFFF',
                    display: 'inline-block',
                    animation: 'pulse-dot 1.8s ease-in-out infinite',
                }}
            />
            <style>{`
                @keyframes pulse-dot {
                    0%, 100% { opacity: 1; transform: scale(1); }
                    50%       { opacity: 0.4; transform: scale(0.7); }
                }
            `}</style>
            <span
                style={{
                    fontFamily: 'monospace',
                    fontSize: '0.6rem',
                    color: 'rgba(0,191,255,0.7)',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                }}
            >
                LIVE · SYNCED WITH GITHUB
            </span>
        </div>
    );
}

// ─── Stats row (stars / forks) ────────────────────────────────────────────────
function StatsRow({ stars, forks }: { stars: number; forks: number }) {
    if (stars === 0 && forks === 0) return null;
    return (
        <div
            style={{
                display: 'flex',
                gap: '12px',
                fontFamily: 'monospace',
                fontSize: '0.6rem',
                color: 'rgba(255,255,255,0.35)',
                marginBottom: '6px',
            }}
        >
            <span>⭐ {stars}</span>
            <span>🍴 {forks}</span>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function MorphingCardStack() {
    // ── GitHub live-data state
    const [projects, setProjects] = useState<ProjectCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isLive, setIsLive] = useState(false);  // true only when live data loaded

    // ── Layout state (stack / grid / list)
    const [layout, setLayout] = useState<LayoutMode>('stack');
    const [currentIndex, setCurrentIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInView = useInView(containerRef, { once: true, margin: "-10%" });
    const [hasEntered, setHasEntered] = useState(false);

    useEffect(() => {
        if (isInView && !hasEntered) {
            setHasEntered(true);
        }
    }, [isInView, hasEntered]);

    // Responsive window width
    const [windowWidth, setWindowWidth] = useState(1024);
    useEffect(() => {
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // ── Fetch pinned repos
    useEffect(() => {
        const fetchPinned = async () => {
            try {
                setLoading(true);
                const res = await fetch('/api/github/pinned', { cache: 'no-store' });
                const data = await res.json();

                if (data.repos && data.repos.length > 0) {
                    const mapped: ProjectCard[] = data.repos.map(
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        (repo: any, index: number) => {
                            const rawTags: string[] =
                                repo.repositoryTopics?.nodes?.map(
                                    (n: { topic: { name: string } }) => n.topic.name
                                ) ?? [];

                            // Combine language + topics; cap at 5
                            const allTags = repo.primaryLanguage?.name
                                ? [repo.primaryLanguage.name, ...rawTags].slice(0, 5)
                                : rawTags.slice(0, 5);

                            return {
                                id: String(index + 1),
                                title: formatRepoName(repo.name),
                                description: repo.description || 'No description provided.',
                                icon: ICONS[index % ICONS.length],
                                tags: allTags,
                                link: repo.url,
                                liveUrl: repo.homepageUrl || null,
                                stars: repo.stargazerCount || 0,
                                forks: repo.forkCount || 0,
                                language: repo.primaryLanguage?.name ?? null,
                                languageColor: repo.primaryLanguage?.color ?? '#FF4500',
                                linkLabel: "ACCESS REPOSITORY ↗",
                            };
                        }
                    );

                    setProjects(mapped);
                    setIsLive(true);
                } else {
                    // API succeeded but no pinned repos — fall back to static
                    setProjects(STATIC_CARDS);
                    setIsLive(false);
                }
            } catch (err) {
                console.error('Failed to fetch pinned repos:', err);
                setProjects(STATIC_CARDS);
                setIsLive(false);
            } finally {
                setLoading(false);
            }
        };

        fetchPinned();
    }, []);

    // Active card set (live or static fallback)
    const CARDS = projects.length > 0 ? projects : STATIC_CARDS;
    const cardStackItems = buildCardStackItems(CARDS);

    const handleDragEnd = (_e: unknown, info: PanInfo) => {
        if (layout !== 'stack') return;
        const threshold = 50;
        if (info.offset.x < -threshold) {
            setCurrentIndex((prev) => (prev + 1) % CARDS.length);
        } else if (info.offset.x > threshold) {
            setCurrentIndex((prev) => (prev - 1 + CARDS.length) % CARDS.length);
        }
    };

    return (
        <div ref={containerRef} className="w-full flex flex-col items-center justify-center max-w-6xl mx-auto">

            {/* ── Live badge (only when live data loaded) */}
            {!loading && isLive && <LiveBadge />}

            {/* ── Layout Toggle Buttons ── UNCHANGED */}
            <div className="flex items-center justify-center gap-3 md:gap-4 mb-8 md:mb-10 z-20 scale-90 md:scale-[0.85] xl:scale-100 origin-center min-h-[44px]">
                <button
                    onClick={() => setLayout('stack')}
                    className={cn(
                        "p-3 md:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border transition-all duration-300 touch-manipulation",
                        layout === 'stack'
                            ? "bg-[#FF4500]/20 border-[#FF4500] text-[#FF4500]"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10"
                    )}
                    aria-label="Stack view"
                >
                    <Layers size={20} />
                </button>
                <button
                    onClick={() => setLayout('grid')}
                    className={cn(
                        "p-3 md:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border transition-all duration-300 touch-manipulation",
                        layout === 'grid'
                            ? "bg-[#FF4500]/20 border-[#FF4500] text-[#FF4500]"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10"
                    )}
                    aria-label="Grid view"
                >
                    <Grid size={20} />
                </button>
                <button
                    onClick={() => setLayout('list')}
                    className={cn(
                        "p-3 md:p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg border transition-all duration-300 touch-manipulation",
                        layout === 'list'
                            ? "bg-[#FF4500]/20 border-[#FF4500] text-[#FF4500]"
                            : "bg-white/5 border-white/10 text-white/40 hover:text-white/60 hover:bg-white/10"
                    )}
                    aria-label="List view"
                >
                    <List size={20} />
                </button>
            </div>

            {/* ── Cards Container */}
            <div
                className={cn(
                    "relative w-full z-10 transition-all duration-700 ease-in-out min-h-[400px]",
                    layout === 'stack' ? "flex items-center justify-center pt-8" : ""
                )}
            >
                {/* Loading skeleton */}
                {loading ? (
                    <SkeletonCards />
                ) : layout === 'stack' ? (
                    /* ─── STACK VIEW ──────────────────────────────────────── */
                    <motion.div
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="w-full"
                    >
                        <CardStack
                            items={cardStackItems}
                            cardWidth={windowWidth < 768 ? windowWidth - 32 : windowWidth < 1024 ? Math.min(windowWidth - 80, 560) : windowWidth < 1280 ? Math.min(windowWidth * 0.9, 600) : 520}
                            cardHeight={windowWidth < 768 ? 240 : windowWidth < 1024 ? 260 : windowWidth < 1280 ? 280 : 320}
                            overlap={0.48}
                            spreadDeg={windowWidth < 768 ? 15 : windowWidth < 1024 ? 30 : windowWidth < 1280 ? 36 : 48}
                            hideInactiveCards={windowWidth < 768}
                            perspectivePx={1100}
                            depthPx={140}
                            tiltXDeg={12}
                            activeLiftPx={22}
                            activeScale={1.03}
                            inactiveScale={0.94}
                            springStiffness={280}
                            springDamping={28}
                            loop={true}
                            autoAdvance={false}
                            pauseOnHover={true}
                            showDots={true}
                            initialIndex={0}
                            renderCard={(item, isActive) => {
                                const card: ProjectCard = item.originalCard;
                                const isOdd = parseInt(card.id) % 2 !== 0;
                                const linkColorClass = isOdd ? "text-[#00BFFF]" : "text-[#FF4500]";
                                const linkHoverClass = isOdd ? "hover:text-[#FF4500]" : "hover:text-[#00BFFF]";

                                return (
                                    <Tilt
                                        rotationFactor={6}
                                        isRevese={true}
                                        springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
                                        className={cn(
                                            "relative w-full h-full rounded-[16px] overflow-hidden transition-all duration-300 flex flex-col p-6 md:p-8",
                                            "bg-[rgba(8,8,12,0.88)] backdrop-blur-[20px]",
                                            isActive
                                                ? "border border-[rgba(255,100,0,0.6)] shadow-[0_0_30px_rgba(255,69,0,0.25),0_0_60px_rgba(0,0,0,0.5)]"
                                                : "border border-[rgba(255,100,0,0.25)] shadow-lg"
                                        )}
                                        style={{ transformOrigin: 'center center' }}
                                    >
                                        <Spotlight
                                            size={280}
                                            springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
                                            className={cn("z-10", isOdd ? "from-[#00BFFF]/25 via-[#00BFFF]/10 to-transparent blur-2xl" : "from-[#FF4500]/25 via-[#FF4500]/10 to-transparent blur-2xl")}
                                        />
                                        <img
                                            src={item.imageSrc}
                                            alt={item.title}
                                            className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay pointer-events-none"
                                        />

                                        <div className="relative z-10 flex items-start gap-4 mb-4 pointer-events-none">
                                            <div className="shrink-0 p-3 rounded-[10px] bg-[rgba(255,100,0,0.1)] border border-[rgba(255,100,0,0.3)] text-[#FF6600]">
                                                {React.createElement(card.icon, { size: 26 })}
                                            </div>
                                            <h3 className="text-[1.3rem] font-bold font-display text-white leading-tight">
                                                {card.title}
                                            </h3>
                                        </div>

                                        <div className="relative z-10 flex flex-col grow">
                                            <p className="text-[0.9rem] text-[rgba(255,255,255,0.65)] font-sans leading-[1.6] mb-3 xl:mb-4 line-clamp-3 pointer-events-none">
                                                {card.description}
                                            </p>

                                            {/* Stats row */}
                                            <div className="pointer-events-none mb-2">
                                                <StatsRow stars={card.stars} forks={card.forks} />
                                            </div>

                                            <div className="flex flex-wrap gap-[6px] md:gap-2 mb-6 xl:mb-8 pointer-events-none w-full">
                                                {card.tags.map((tag: string) => (
                                                    <span
                                                        key={tag}
                                                        className="text-[0.65rem] min-[375px]:text-[0.7rem] md:text-[0.75rem] font-mono px-[8px] py-[4px] md:px-[12px] md:py-[4px] min-[320px]:max-[374px]:px-[7px] min-[320px]:max-[374px]:py-[3px] rounded-[6px] bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.15)] text-[rgba(255,255,255,0.8)] whitespace-nowrap"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>

                                            <div className="mt-auto flex flex-col gap-2">
                                                {/* Primary: repo link */}
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={card.link}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className={cn(
                                                            "inline-flex items-center justify-center md:justify-start gap-2 text-[0.65rem] min-[375px]:text-[0.7rem] md:text-[0.8rem] font-mono tracking-[0.1em] md:tracking-[0.15em] uppercase transition-colors duration-300 pointer-events-auto min-h-[44px] w-full md:w-auto",
                                                            linkColorClass, linkHoverClass
                                                        )}
                                                        onClick={(e) => {
                                                            if (!isActive) e.preventDefault();
                                                        }}
                                                    >
                                                        [ ACCESS REPOSITORY ]
                                                    </a>
                                                    {isActive && (
                                                        <ExternalLink size={14} className="text-[#00BFFF]" />
                                                    )}
                                                </div>

                                                {/* Secondary: live demo (only if liveUrl exists) */}
                                                {card.liveUrl && (
                                                    <a
                                                        href={card.liveUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center justify-center md:justify-start gap-2 text-[0.65rem] min-[375px]:text-[0.7rem] md:text-[0.8rem] font-mono tracking-[0.1em] md:tracking-[0.15em] uppercase transition-colors duration-300 pointer-events-auto min-h-[44px] w-full md:w-auto text-[#00BFFF] hover:text-[#FF4500]"
                                                        style={{
                                                            border: '0.5px solid rgba(0,191,255,0.4)',
                                                            borderRadius: '6px',
                                                            padding: '4px 10px',
                                                        }}
                                                        onClick={(e) => {
                                                            if (!isActive) e.preventDefault();
                                                        }}
                                                    >
                                                        [ LIVE DEMO ] <ExternalLink size={12} />
                                                    </a>
                                                )}
                                            </div>
                                        </div>
                                    </Tilt>
                                );
                            }}
                        />
                    </motion.div>
                ) : (
                    /* ─── GRID / LIST VIEW ────────────────────────────────── */
                    <Card3DList
                        columns={layout === 'grid' ? (windowWidth < 768 ? 1 : 2) : 1}
                        gap={layout === 'grid' ? (windowWidth < 768 ? "md" : "lg") : (windowWidth < 768 ? "sm" : "md")}
                        className={layout === 'list' ? "max-w-full md:max-w-[680px] mx-auto" : ""}
                    >
                        {CARDS.map((card) => {
                            const isOdd = parseInt(card.id) % 2 !== 0;
                            const themeKey = isOdd ? "orange" : "blue";
                            const linkColorClass = isOdd ? "text-[#00BFFF] hover:text-[#FF4500]" : "text-[#FF4500] hover:text-[#00BFFF]";

                            return (
                                <Card3D
                                    key={card.id}
                                    title={card.title}
                                    description={card.description}
                                    icon={card.icon}
                                    theme={themeKey}
                                    size={layout === 'grid' ? (windowWidth < 1280 ? "md" : "lg") : "md"}
                                    variant="premium"
                                    animated={true}
                                >
                                    <div className={cn(
                                        "flex flex-col grow",
                                        layout === 'list' && "md:flex-row md:items-end md:justify-between w-full"
                                    )}>
                                        {/* Tags + stats */}
                                        <div className="flex flex-col gap-2 pointer-events-none mb-6 md:mb-0 w-full md:w-auto">
                                            {/* Stats */}
                                            <StatsRow stars={card.stars} forks={card.forks} />
                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-[6px] md:gap-2">
                                                {card.tags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="text-[0.65rem] min-[375px]:text-[0.7rem] md:text-[0.75rem] font-mono px-[8px] py-[4px] md:px-[12px] md:py-[4px] min-[320px]:max-[374px]:px-[7px] min-[320px]:max-[374px]:py-[3px] rounded-md bg-white/5 border border-white/15 text-white/80 whitespace-nowrap"
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Buttons */}
                                        <div className="pointer-events-auto shrink-0 flex flex-col gap-2 w-full md:w-auto">
                                            <a
                                                href={card.link}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={cn(
                                                    "inline-flex items-center justify-center md:justify-start gap-2 text-[0.65rem] min-[375px]:text-[0.7rem] md:text-[0.8rem] font-mono tracking-[0.1em] md:tracking-[0.15em] uppercase transition-colors duration-300 min-h-[44px] w-full md:w-auto",
                                                    linkColorClass
                                                )}
                                            >
                                                [ ACCESS REPOSITORY ] <ExternalLink size={14} />
                                            </a>
                                            {card.liveUrl && (
                                                <a
                                                    href={card.liveUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center justify-center md:justify-start gap-2 text-[0.65rem] min-[375px]:text-[0.7rem] md:text-[0.8rem] font-mono tracking-[0.1em] md:tracking-[0.15em] uppercase transition-colors duration-300 min-h-[44px] w-full md:w-auto text-[#00BFFF] hover:text-[#FF4500]"
                                                    style={{
                                                        border: '0.5px solid rgba(0,191,255,0.4)',
                                                        borderRadius: '6px',
                                                        padding: '4px 10px',
                                                    }}
                                                >
                                                    [ LIVE DEMO ] <ExternalLink size={12} />
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </Card3D>
                            );
                        })}
                    </Card3DList>
                )}
            </div>
        </div>
    );
}
