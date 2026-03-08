"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { Tilt } from "./ui/tilt";
import { Spotlight } from "./ui/spotlight";
import { Card3D } from "./ui/Card3D";
import { Code, Eye, Brain, Database, Terminal } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

// ─── CLUSTER DATA ────────────────────────────────────────────────────────────

const CLUSTERS = [
    {
        id: "web", coreName: "Code", color: "#00BFFF",
        position: [-4.5, 1.5, 0] as [number, number, number],
        children: ["Python", "Java", "HTML", "CSS", "JavaScript", "SQL"],
        desc: "Languages bridging logic and the web."
    },
    {
        id: "vision", coreName: "Vision", color: "#FF6600",
        position: [4, 2.5, 0] as [number, number, number],
        children: ["OpenCV", "YOLO", "MediaPipe", "CVZone"],
        desc: "Teaching machines to see."
    },
    {
        id: "ml", coreName: "Intelligence", color: "#A855F7",
        position: [0, -0.5, 2] as [number, number, number],
        children: ["TensorFlow", "Scikit-Learn", "NLP", "Keras", "TensorBoard", "CNN", "RNN", "LSTM", "GRU"],
        desc: "Architectures that learn and adapt."
    },
    {
        id: "data", coreName: "Data", color: "#00FFFF",
        position: [-4, -2.5, 0] as [number, number, number],
        children: ["Pandas", "NumPy", "Matplotlib"],
        desc: "Extracting meaning from noise."
    },
    {
        id: "devops", coreName: "DevOps", color: "#39FF14",
        position: [4, -2.5, 0] as [number, number, number],
        children: ["Streamlit", "Git", "GitHub"],
        desc: "Shipping intelligence to the world."
    }
];

const CROSS_LINES = [
    ["OpenCV", "NumPy"], ["YOLO", "Keras"], ["NLP", "LSTM"],
    ["Scikit-Learn", "Pandas"], ["Streamlit", "Matplotlib"],
    ["GitHub", "Git"], ["TensorBoard", "Keras"], ["CNN", "OpenCV"],
    ["GRU", "RNN"], ["RNN", "LSTM"]
];

// ─── TYPES ───────────────────────────────────────────────────────────────────
interface NeuralCtx {
    hovered: string | null;
    setHovered: (n: string | null) => void;
    focused: string | null;
    setFocused: (c: string | null) => void;
    nodeWorldPos: React.MutableRefObject<Record<string, THREE.Vector3>>;
    mouseLerped: React.MutableRefObject<THREE.Vector2>;
    isTouch: boolean;
    visible: boolean;
}

const NCtx = React.createContext<NeuralCtx>(null!);

// ─── NODE ────────────────────────────────────────────────────────────────────

function Node({
    name, isCore, color, clusterId, radius, baseAngle, orbitSpeed, spawnDelay, depthGroup
}: {
    name: string; isCore: boolean; color: string; clusterId: string;
    radius: number; baseAngle: number; orbitSpeed: number; spawnDelay: number;
    depthGroup: 'A' | 'B' | 'C';
}) {
    const mesh = useRef<THREE.Mesh>(null!);
    const mat = useRef<THREE.MeshStandardMaterial>(null!);
    const { hovered, setHovered, focused, setFocused, nodeWorldPos, mouseLerped, isTouch, visible } = React.useContext(NCtx);

    const angle = useRef(baseAngle);
    const breathPh = useRef(0);
    const spawned = useRef(false);
    const spawnComplete = useRef(false);

    // Entry animation: fly in from specific depth group
    useEffect(() => {
        breathPh.current = Math.random() * Math.PI * 2;
        if (!visible || spawned.current) return;
        spawned.current = true;

        const startZ = depthGroup === 'A' ? -4 : depthGroup === 'B' ? -2 : -6;
        const startScale = depthGroup === 'A' ? 0.3 : depthGroup === 'B' ? 0.6 : 0.1;

        const target = isCore
            ? new THREE.Vector3(0, 0, 0)
            : new THREE.Vector3(Math.cos(baseAngle) * radius, 0, Math.sin(baseAngle) * radius);

        mesh.current.position.copy(target).setZ(target.z + startZ);
        mesh.current.scale.set(startScale, startScale, startScale);

        gsap.to(mesh.current.position, {
            x: target.x, y: target.y, z: target.z,
            duration: 1.2, delay: spawnDelay, ease: "expo.out",
            onComplete: () => {
                spawnComplete.current = true;
            }
        });
        gsap.to(mesh.current.scale, {
            x: isCore ? 1.1 : 1.0, y: isCore ? 1.1 : 1.0, z: isCore ? 1.1 : 1.0,
            duration: 1.2, delay: spawnDelay, ease: "expo.out"
        });
        gsap.to(mat.current, {
            opacity: 0.85,
            duration: 1.2, delay: spawnDelay, ease: "power2.out"
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible]);

    useFrame((state) => {
        if (!mesh.current || !mat.current) return;

        const t = state.clock.elapsedTime;

        // Group Bobbing Modifiers
        const bobAmp = depthGroup === 'A' ? 0.3 : depthGroup === 'B' ? 0.2 : 0.1;
        const bobSpeed = depthGroup === 'A' ? 1.5 : depthGroup === 'B' ? 1.2 : 1.0;

        // Parallax depth modifiers mapped safely to R3F units
        const pX = depthGroup === 'A' ? 1.8 : depthGroup === 'B' ? 1.0 : 0.4;
        const pY = depthGroup === 'A' ? 1.2 : depthGroup === 'B' ? 0.7 : 0.3;

        // Orbit & breathe & parallax only after entry delay
        if (spawnComplete.current && !focused) {
            angle.current += orbitSpeed;
            const basex = isCore ? 0 : Math.cos(angle.current) * radius;
            const basez = isCore ? 0 : Math.sin(angle.current) * radius;

            const bobY = Math.sin(t * bobSpeed + breathPh.current) * bobAmp;

            // Continuous parallax displacement based on mouseLerped
            const pxOffset = isTouch ? 0 : mouseLerped.current.x * pX;
            const pyOffset = isTouch ? 0 : mouseLerped.current.y * pY * -1; // Invert Y for correct feel

            const targetPos = new THREE.Vector3(basex + pxOffset, bobY + pyOffset, basez);
            mesh.current.position.lerp(targetPos, 0.08); // Springly smoothing
        }

        // Register world position for connection lines
        // eslint-disable-next-line react-hooks/immutability
        if (!nodeWorldPos.current[name]) nodeWorldPos.current[name] = new THREE.Vector3();
        mesh.current.getWorldPosition(nodeWorldPos.current[name]);

        // Scale & emissive
        const isHov = hovered === name;
        const isOtherFoc = focused && focused !== clusterId;
        const targetScale = isHov ? (isCore ? 1.6 : 1.5) : (isCore ? 1.1 : 1.0);
        const breathScale = isCore ? Math.sin(t * 2 + breathPh.current) * 0.05 : 0;

        // Wait for spawn animation to finish before applying lerped scale
        if (spawnComplete.current) {
            mesh.current.scale.lerp(
                new THREE.Vector3(targetScale + breathScale, targetScale + breathScale, targetScale + breathScale), 0.1
            );
        }

        mat.current.emissiveIntensity = THREE.MathUtils.lerp(
            mat.current.emissiveIntensity, isHov ? 3 : 1, 0.1
        );
        // Only lerp opacity AFTER spawn animation completes — otherwise useFrame fights GSAP
        if (spawnComplete.current) {
            mat.current.opacity = THREE.MathUtils.lerp(
                mat.current.opacity, isOtherFoc ? 0.08 : 0.85, 0.08
            );
        }
    });

    const clusterLabel = CLUSTERS.find(c => c.id === clusterId)?.coreName ?? "";

    return (
        <mesh
            ref={mesh}
            onPointerOver={(e) => { e.stopPropagation(); setHovered(name); document.body.style.cursor = "pointer"; }}
            onPointerOut={(e) => { e.stopPropagation(); setHovered(null); document.body.style.cursor = "auto"; }}
            onClick={(e) => {
                e.stopPropagation();
                setFocused(focused === clusterId ? null : clusterId);
            }}
        >
            <sphereGeometry args={[isCore ? 0.55 : 0.28, 32, 32]} />
            <meshStandardMaterial
                ref={mat}
                color={color}
                emissive={color}
                emissiveIntensity={1}
                transparent
                opacity={0}
                roughness={0.1}
                metalness={0.3}
            />
            {/* Core glow light */}
            {isCore && <pointLight color={color} intensity={1.2} distance={9} />}

            {/* Tooltip */}
            {hovered === name && (
                <Html center position={[0, isCore ? 1.1 : 0.75, 0]} zIndexRange={[100, 0]}>
                    <Tilt
                        rotationFactor={5}
                        isRevese={true}
                        springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
                        style={{
                            position: "relative",
                            background: "rgba(5,5,8,0.85)",
                            border: `1px solid ${color}60`,
                            boxShadow: `0 0 18px ${color}50`,
                            borderRadius: 10, padding: "8px 14px",
                            minWidth: 140, textAlign: "center",
                            pointerEvents: "none", backdropFilter: "blur(10px)",
                            transformOrigin: 'center center'
                        }}
                    >
                        <Spotlight
                            size={180}
                            springOptions={{ stiffness: 26.7, damping: 4.1, mass: 0.2 }}
                            className="z-10"
                            style={{ background: `radial-gradient(circle, ${color}30 0%, ${color}10 30%, transparent 70%)` }}
                        />
                        <p style={{ color: "#fff", fontFamily: "monospace", fontSize: 13, fontWeight: 700, letterSpacing: 2, margin: 0 }}>
                            {name.toUpperCase()}
                        </p>
                        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${color}, transparent)`, margin: "4px 0" }} />
                        <p style={{ color: "#aaa", fontFamily: "monospace", fontSize: 10, margin: 0 }}>
                            {clusterLabel} Stack
                        </p>
                    </Tilt>
                </Html>
            )}

            {/* Proficiency badge on cluster focus */}
            {focused === clusterId && !isCore && (
                <Html center position={[0, -0.7, 0]} zIndexRange={[90, 0]}>
                    <div style={{ textAlign: "center", pointerEvents: "none" }}>
                        <span style={{ color: "#fff", fontSize: 9, fontFamily: "monospace", letterSpacing: 2, background: "rgba(0,0,0,0.6)", padding: "2px 6px", borderRadius: 4, borderLeft: `2px solid ${color}` }}>
                            {name}
                        </span>
                    </div>
                </Html>
            )}
        </mesh>
    );
}

// ─── CLUSTER GROUP ────────────────────────────────────────────────────────────

function Cluster({ data, idx }: { data: typeof CLUSTERS[0]; idx: number }) {
    const grp = useRef<THREE.Group>(null!);
    const { focused } = React.useContext(NCtx);

    useFrame(() => {
        if (!focused) grp.current.rotation.y += 0.003;
    });

    return (
        <group ref={grp} position={data.position}>
            <Node name={data.coreName} isCore color={data.color} clusterId={data.id}
                radius={0} baseAngle={0} orbitSpeed={0} spawnDelay={idx * 0.06 + 0.3} depthGroup="A" />
            {data.children.map((child, ci) => {
                const r = 2.0 + (ci % 3) * 0.5;
                const a = (ci / data.children.length) * Math.PI * 2;
                const spd = 0.004 + (ci % 4) * 0.001 * (ci % 2 === 0 ? 1 : -1);

                const isMid = ci < 3;
                const dGroup = isMid ? "B" : "C";
                const delay = isMid
                    ? 0.5 + (idx * data.children.length + ci) * 0.05
                    : 0.7 + (idx * data.children.length + ci) * 0.04;

                return (
                    <Node key={child} name={child} isCore={false} color={data.color} clusterId={data.id}
                        radius={r} baseAngle={a} orbitSpeed={spd} spawnDelay={delay} depthGroup={dGroup} />
                );
            })}
        </group>
    );
}

// ─── CROSS-CLUSTER LINES ──────────────────────────────────────────────────────
// Lines are drawn imperatively: THREE.Line objects created once and updated each frame.

function CrossLines() {
    const { nodeWorldPos, hovered } = React.useContext(NCtx);

    // Build THREE.Line objects once on mount
    const lineObjects = useRef<THREE.Line[]>([]);
    const dotObjects = useRef<THREE.Mesh[]>([]);

    // No-op raycast to prevent lines/dots from intercepting pointer events on nodes
    const noopRaycast = () => { };

    // Create primitives once
    const { lines, dots } = React.useMemo(() => {
        const lines = CROSS_LINES.map(() => {
            const geo = new THREE.BufferGeometry();
            // seed geometry with 2 dummy points so it can be updated
            const pos = new Float32Array(6);
            geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
            const mat = new THREE.LineBasicMaterial({ color: "#aaaaff", transparent: true, opacity: 0.14 });
            const line = new THREE.Line(geo, mat);
            line.raycast = () => { };  // Disable raycasting — lines must not block node hover
            return line;
        });
        const dots = CROSS_LINES.map(() => {
            const geo = new THREE.SphereGeometry(0.07, 8, 8);
            const mat = new THREE.MeshBasicMaterial({ color: "#00CFFF", transparent: true, opacity: 0.35 });
            const dot = new THREE.Mesh(geo, mat);
            dot.raycast = () => { };  // Disable raycasting — dots must not block node hover
            return dot;
        });
        return { lines, dots };
    }, []);

    useEffect(() => {
        lineObjects.current = lines;
        dotObjects.current = dots;
    }, [lines, dots]);

    useFrame((state) => {
        CROSS_LINES.forEach(([n1, n2], i) => {
            const p1 = nodeWorldPos.current[n1];
            const p2 = nodeWorldPos.current[n2];
            if (!p1 || !p2) return;

            // Update line geometry
            const line = lineObjects.current[i];
            if (line) {
                const buf = line.geometry.getAttribute("position") as THREE.BufferAttribute;
                buf.setXYZ(0, p1.x, p1.y, p1.z);
                buf.setXYZ(1, p2.x, p2.y, p2.z);
                buf.needsUpdate = true;
                line.geometry.computeBoundingSphere();

                const highlighted = hovered === n1 || hovered === n2;
                const mat = line.material as THREE.LineBasicMaterial;
                mat.opacity = highlighted ? 0.75 : 0.14;
                mat.color.set(highlighted ? "#FF4500" : "#aaaaff");
            }

            // Travel dot
            const dot = dotObjects.current[i];
            if (dot) {
                const t = (state.clock.elapsedTime * 0.3 + i * 0.09) % 1;
                dot.position.lerpVectors(p1, p2, t);
                const highlighted = hovered === n1 || hovered === n2;
                (dot.material as THREE.MeshBasicMaterial).opacity = highlighted ? 1.0 : 0.35;
            }
        });
    });

    return (
        <>
            {lines.map((line, i) => (
                <primitive key={`line-${i}`} object={line} />
            ))}
            {dots.map((dot, i) => (
                <primitive key={`dot-${i}`} object={dot} />
            ))}
        </>
    );
}

// ─── CAMERA ZOOM CONTROLLER ───────────────────────────────────────────────────

function CameraCtrl() {
    const { focused } = React.useContext(NCtx);
    const { camera } = useThree();

    useEffect(() => {
        if (focused) {
            const c = CLUSTERS.find(x => x.id === focused);
            if (!c) return;
            gsap.to(camera.position, { x: c.position[0], y: c.position[1], z: c.position[2] + 9, duration: 1.4, ease: "expo.out" });
        } else {
            gsap.to(camera.position, { x: 0, y: 0, z: 15, duration: 1.4, ease: "expo.out" });
        }
    }, [focused, camera]);

    return null;
}

// ─── SCENE ───────────────────────────────────────────────────────────────────

function Scene({ visible }: { visible: boolean }) {
    const [hovered, setHovered] = useState<string | null>(null);
    const [focused, setFocused] = useState<string | null>(null);
    // Smooth mouse tracking for Parallax
    const nodeWorldPos = useRef<Record<string, THREE.Vector3>>({});
    const mouseLerped = useRef(new THREE.Vector2(0, 0));
    const targetMouse = useRef(new THREE.Vector2(0, 0));
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        setIsTouch(window.matchMedia("(hover: none)").matches);
    }, []);

    useFrame(() => {
        if (!isTouch) {
            // Spring interpolation for smooth parallax tracking
            mouseLerped.current.lerp(targetMouse.current, 0.05);
        }
    });

    const handlePointerMove = (e: any) => {
        if (isTouch) return;
        // Normalize coordinates to -0.5 to +0.5 based on viewport
        const { width, height } = e.camera.viewport;
        const x = (e.pointer.x * width) / 2; // R3F pointer is already -1 to 1 mathematically
        const y = (e.pointer.y * height) / 2;
        targetMouse.current.set(e.pointer.x, e.pointer.y);
    };

    const handlePointerLeave = () => {
        if (isTouch) return;
        targetMouse.current.set(0, 0);
    };

    return (
        <NCtx.Provider value={{ hovered, setHovered, focused, setFocused, nodeWorldPos, mouseLerped, isTouch, visible }}>
            {/* No <color> or <fog> — let canvas stay transparent so portrait shows through */}
            <ambientLight intensity={0.2} />
            <pointLight position={[-12, 6, 4]} color="#FF4500" intensity={3} distance={35} />
            <pointLight position={[12, -6, 4]} color="#00BFFF" intensity={3} distance={35} />

            <group
                onPointerMissed={() => setFocused(null)}
                onPointerMove={handlePointerMove}
                onPointerLeave={handlePointerLeave}
                onPointerOut={handlePointerLeave}
            >
                {CLUSTERS.map((c, i) => <Cluster key={c.id} data={c} idx={i} />)}
                <CrossLines />
            </group>

            <CameraCtrl />
        </NCtx.Provider>
    );
}

// ─── MOBILE FALLBACK ──────────────────────────────────────────────────────────

function getClusterIcon(id: string) {
    switch (id) {
        case "web": return Code;
        case "vision": return Eye;
        case "ml": return Brain;
        case "data": return Database;
        case "devops": return Terminal;
        default: return Brain;
    }
}

function MobileSkills() {
    return (
        <div className="flex flex-col gap-5 py-8 px-4">
            {CLUSTERS.map((c, i) => (
                <div key={c.id} className="pointer-events-none">
                    <Card3D
                        title={
                            <span style={{ color: c.color }} className="font-mono text-lg font-bold">{c.coreName}</span>
                        }
                        description={
                            <span className="text-white/50 text-xs">{c.desc}</span>
                        }
                        icon={getClusterIcon(c.id)}
                        theme={i % 2 === 0 ? "orange" : "blue"}
                        size="sm"
                        variant="minimal"
                        animated={true}
                        disabled={true} // touch devices inherently disable tilt globally, but disabled=true enforces it directly
                    >
                        <div className="relative z-20 flex flex-wrap gap-2 pointer-events-none mt-2">
                            {c.children.map(s => (
                                <span key={s} className="text-xs font-mono px-3 py-1 rounded-full border border-white/10 bg-white/5 text-white/80">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </Card3D>
                </div>
            ))}
        </div>
    );
}

// ─── MAIN EXPORT ──────────────────────────────────────────────────────────────

export default function NeuralClusters() {
    const [mobile, setMobile] = useState(false);
    const [visible, setVisible] = useState(false);
    const sectionRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onResize = () => setMobile(window.innerWidth < 768);
        onResize();
        window.addEventListener("resize", onResize);
        return () => window.removeEventListener("resize", onResize);
    }, []);

    useEffect(() => {
        if (!sectionRef.current) return;
        ScrollTrigger.create({
            trigger: sectionRef.current,
            start: "top 65%",
            onEnter: () => setVisible(true)
        });
    }, []);

    return (
        <div ref={sectionRef} className="w-full h-full relative">
            {mobile ? (
                <MobileSkills />
            ) : (
                <>
                    {/* gl alpha:true makes the WebGL canvas background fully transparent */}
                    <Canvas
                        camera={{ position: [0, 0, 15], fov: 45 }}
                        gl={{ alpha: true, antialias: true }}
                        style={{ background: "transparent" }}
                    >
                        <Scene visible={visible} />
                    </Canvas>
                    <div className="absolute top-6 left-6 text-white/40 text-[11px] font-mono pointer-events-none space-y-1 z-20">
                        <p>[ HOVER ] Node insights</p>
                        <p>[ CLICK ] Isolate cluster</p>
                        <p>[ BG ] Reset view</p>
                    </div>
                </>
            )}
        </div>
    );
}
