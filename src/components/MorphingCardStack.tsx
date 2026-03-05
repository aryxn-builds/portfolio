"use client";

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, PanInfo, useInView } from 'framer-motion';
import { Eye, Activity, Brain, Layers, Grid, List, ExternalLink } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CardStack, { type CardStackItem } from './CardStack';
import { Tilt } from "./ui/tilt";
import { Spotlight } from "./ui/spotlight";
import { Card3D, Card3DList } from "./ui/Card3D";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const CARDS = [
    {
        id: "1",
        title: "Customer Churn Prediction (ANN)",
        description: "Predicts customer churn using an Artificial Neural Network built with TensorFlow/Keras, deployed as an interactive Streamlit web app.",
        icon: Brain,
        tags: ["TensorFlow", "Keras", "Streamlit"],
        link: "https://github.com/aryan00756/ANN-Chrun-Project",
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "2",
        title: "IMDB Sentiment Classifier (RNN)",
        description: "Binary sentiment classification on IMDB movie reviews using a Recurrent Neural Network with embedding and SimpleRNN layers.",
        icon: Activity,
        tags: ["TensorFlow", "Keras", "Scikit-Learn"],
        link: "https://github.com/aryan00756/IMDB-Sentiment-Classification-using-Recurrent-Neural-Networks",
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "3",
        title: "Trader Profitability Predictor",
        description: "Neural network model predicting trader profitability based on trade frequency, size, and market sentiment, deployed via Streamlit.",
        icon: Layers,
        tags: ["TensorFlow", "Streamlit", "Pandas"],
        link: "https://github.com/aryan00756/trader-profit-prediction",
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "4",
        title: "Pose-Based Movement Analysis",
        description: "Cricket player movement analysis using MediaPipe Pose estimation — tracks hip, knee and ankle keypoints to compute knee angle metrics.",
        icon: Eye,
        tags: ["MediaPipe", "OpenCV", "Python"],
        link: "https://github.com/aryan00756/-pose-based-movement-analysis",
        linkLabel: "ACCESS REPOSITORY ↗"
    },
    {
        id: "5",
        title: "YOLO Object Detection Lab",
        description: "Hands-on exploration of YOLO (You Only Look Once) for real-time object detection with custom weights and training pipelines.",
        icon: Grid,
        tags: ["YOLO", "OpenCV", "Python"],
        link: "https://github.com/aryan00756/YOLO-Learning",
        linkLabel: "ACCESS REPOSITORY ↗"
    }
];

// Map CARDS to CardStackItem format
const cardStackItems: CardStackItem[] = CARDS.map((card, idx) => ({
    id: card.id,
    title: card.title,
    description: card.description,
    href: card.link,
    // Provide alternating dark tech-themed placeholders
    imageSrc: [
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1000&auto=format&fit=crop",
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1000&auto=format&fit=crop"
    ][idx % 5],
    // Keep the original data available for custom rendering
    originalCard: card
}));

type LayoutMode = 'stack' | 'grid' | 'list';

export default function MorphingCardStack() {
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

    // Use window size to determine responsive props
    const [windowWidth, setWindowWidth] = useState(1024);
    useEffect(() => {
        // Only access window on client side
        setWindowWidth(window.innerWidth);
        const handleResize = () => setWindowWidth(window.innerWidth);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleDragEnd = (e: any, info: PanInfo) => {
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
            {/* Layout Toggle Buttons */}
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

            {/* Cards Container */}
            <div
                className={cn(
                    "relative w-full z-10 transition-all duration-700 ease-in-out min-h-[400px]",
                    layout === 'stack' ? "flex items-center justify-center pt-8" : ""
                )}
            >
                {layout === 'stack' ? (
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
                                const card = item.originalCard;
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
                                                <card.icon size={26} />
                                            </div>
                                            <h3 className="text-[1.3rem] font-bold font-display text-white leading-tight">
                                                {card.title}
                                            </h3>
                                        </div>

                                        <div className="relative z-10 flex flex-col grow">
                                            <p className="text-[0.9rem] text-[rgba(255,255,255,0.65)] font-sans leading-[1.6] mb-5 xl:mb-6 min-h-[3rem] pointer-events-none">
                                                {card.description}
                                            </p>

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

                                            <div className="mt-auto flex items-center gap-2">
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
                                        </div>
                                    </Tilt>
                                );
                            }}
                        />
                    </motion.div>
                ) : (
                    <Card3DList
                        columns={layout === 'grid' ? (windowWidth < 768 ? 1 : 2) : 1}
                        gap={layout === 'grid' ? (windowWidth < 768 ? "md" : "lg") : (windowWidth < 768 ? "sm" : "md")}
                        className={layout === 'list' ? "max-w-full md:max-w-[680px] mx-auto" : ""}
                    >
                        {CARDS.map((card, index) => {
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
                                        <div className="flex flex-wrap gap-[6px] md:gap-2 pointer-events-none mb-6 md:mb-0 w-full md:w-auto">
                                            {card.tags.map((tag) => (
                                                <span
                                                    key={tag}
                                                    className="text-[0.65rem] min-[375px]:text-[0.7rem] md:text-[0.75rem] font-mono px-[8px] py-[4px] md:px-[12px] md:py-[4px] min-[320px]:max-[374px]:px-[7px] min-[320px]:max-[374px]:py-[3px] rounded-md bg-white/5 border border-white/15 text-white/80 whitespace-nowrap"
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="pointer-events-auto shrink-0 w-full md:w-auto">
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
