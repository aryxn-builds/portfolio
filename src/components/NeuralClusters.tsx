"use client";

import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// ─── CLUSTER DATA ────────────────────────────────────────────────────────────

const CLUSTERS = [
    {
        id: "web", coreName: "Code", color: "#00BFFF",
        position: [-4.5, 1.5, -1] as [number, number, number],
        children: ["Java", "HTML", "CSS", "JavaScript", "SQL"],
        desc: "Languages bridging logic and the web."
    },
    {
        id: "vision", coreName: "Vision", color: "#FF6600",
        position: [4, 2.5, -1] as [number, number, number],
        children: ["OpenCV", "YOLO", "MediaPipe", "CVZone"],
        desc: "Teaching machines to see."
    },
    {
        id: "ml", coreName: "Intelligence", color: "#A855F7",
        position: [0, -0.5, 2] as [number, number, number],
        children: ["Scikit-Learn", "NLP", "Keras", "TensorBoard", "CNN", "RNN", "LSTM", "GRU"],
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
        position: [4, -2.5, -1] as [number, number, number],
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
    visible: boolean;
}

const NCtx = React.createContext<NeuralCtx>(null!);

// ─── NODE ────────────────────────────────────────────────────────────────────

function Node({
    name, isCore, color, clusterId, radius, baseAngle, orbitSpeed, spawnDelay
}: {
    name: string; isCore: boolean; color: string; clusterId: string;
    radius: number; baseAngle: number; orbitSpeed: number; spawnDelay: number;
}) {
    const mesh = useRef<THREE.Mesh>(null!);
    const mat = useRef<THREE.MeshStandardMaterial>(null!);
    const { hovered, setHovered, focused, setFocused, nodeWorldPos, visible } = React.useContext(NCtx);

    const angle = useRef(baseAngle);
    const breathPh = useRef(0);
    const spawned = useRef(false);

    // Entry animation: fly in from random far point
    useEffect(() => {
        breathPh.current = Math.random() * Math.PI * 2;
        if (!visible || spawned.current) return;
        spawned.current = true;

        const start = new THREE.Vector3(
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80,
            (Math.random() - 0.5) * 80
        );
        const target = isCore
            ? new THREE.Vector3(0, 0, 0)
            : new THREE.Vector3(Math.cos(baseAngle) * radius, 0, Math.sin(baseAngle) * radius);

        mesh.current.position.copy(start);

        gsap.to(mesh.current.position, {
            x: target.x, y: target.y, z: target.z,
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

        // Orbit & breathe only after entry delay
        if (spawned.current && !focused && t > spawnDelay + 1) {
            angle.current += orbitSpeed;
            const tx = isCore ? 0 : Math.cos(angle.current) * radius;
            const ty = Math.sin(t * 1.5 + breathPh.current) * 0.15;
            const tz = isCore ? 0 : Math.sin(angle.current) * radius;
            mesh.current.position.lerp(new THREE.Vector3(tx, ty, tz), 0.08);
        }

        // Register world position for connection lines
        // eslint-disable-next-line react-hooks/immutability
        if (!nodeWorldPos.current[name]) nodeWorldPos.current[name] = new THREE.Vector3();
        mesh.current.getWorldPosition(nodeWorldPos.current[name]);

        // Scale & emissive
        const isHov = hovered === name;
        const isOtherFoc = focused && focused !== clusterId;
        const targetScale = isHov ? (isCore ? 1.6 : 1.5) : (isCore ? 1.1 : 1.0);
        const breathScale = isCore ? 0 : Math.sin(t * 2 + breathPh.current) * 0.07;
        mesh.current.scale.lerp(
            new THREE.Vector3(targetScale + breathScale, targetScale + breathScale, targetScale + breathScale), 0.1
        );

        mat.current.emissiveIntensity = THREE.MathUtils.lerp(
            mat.current.emissiveIntensity, isHov ? 3 : 1, 0.1
        );
        mat.current.opacity = THREE.MathUtils.lerp(
            mat.current.opacity, isOtherFoc ? 0.08 : 0.85, 0.08
        );
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
                    <div style={{
                        background: "rgba(5,5,8,0.85)",
                        border: `1px solid ${color}60`,
                        boxShadow: `0 0 18px ${color}50`,
                        borderRadius: 10, padding: "8px 14px",
                        minWidth: 140, textAlign: "center",
                        pointerEvents: "none", backdropFilter: "blur(10px)"
                    }}>
                        <p style={{ color: "#fff", fontFamily: "monospace", fontSize: 13, fontWeight: 700, letterSpacing: 2, margin: 0 }}>
                            {name.toUpperCase()}
                        </p>
                        <div style={{ height: 1, background: `linear-gradient(to right, transparent, ${color}, transparent)`, margin: "4px 0" }} />
                        <p style={{ color: "#aaa", fontFamily: "monospace", fontSize: 10, margin: 0 }}>
                            {clusterLabel} Stack
                        </p>
                    </div>
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
                radius={0} baseAngle={0} orbitSpeed={0} spawnDelay={idx * 0.15} />
            {data.children.map((child, ci) => {
                const r = 2.0 + (ci % 3) * 0.5;
                const a = (ci / data.children.length) * Math.PI * 2;
                const spd = 0.004 + (ci % 4) * 0.001 * (ci % 2 === 0 ? 1 : -1);
                return (
                    <Node key={child} name={child} isCore={false} color={data.color} clusterId={data.id}
                        radius={r} baseAngle={a} orbitSpeed={spd} spawnDelay={idx * 0.15 + 0.1} />
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

    // Create primitives once
    const { lines, dots } = React.useMemo(() => {
        const lines = CROSS_LINES.map(() => {
            const geo = new THREE.BufferGeometry();
            // seed geometry with 2 dummy points so it can be updated
            const pos = new Float32Array(6);
            geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
            const mat = new THREE.LineBasicMaterial({ color: "#aaaaff", transparent: true, opacity: 0.14 });
            return new THREE.Line(geo, mat);
        });
        const dots = CROSS_LINES.map(() => {
            const geo = new THREE.SphereGeometry(0.07, 8, 8);
            const mat = new THREE.MeshBasicMaterial({ color: "#00CFFF", transparent: true, opacity: 0.35 });
            return new THREE.Mesh(geo, mat);
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
    const nodeWorldPos = useRef<Record<string, THREE.Vector3>>({});

    return (
        <NCtx.Provider value={{ hovered, setHovered, focused, setFocused, nodeWorldPos, visible }}>
            {/* No <color> or <fog> — let canvas stay transparent so portrait shows through */}
            <ambientLight intensity={0.2} />
            <pointLight position={[-12, 6, 4]} color="#FF4500" intensity={3} distance={35} />
            <pointLight position={[12, -6, 4]} color="#00BFFF" intensity={3} distance={35} />

            <group onPointerMissed={() => setFocused(null)}>
                {CLUSTERS.map((c, i) => <Cluster key={c.id} data={c} idx={i} />)}
                <CrossLines />
            </group>

            <CameraCtrl />
        </NCtx.Provider>
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
        <div ref={sectionRef} className="w-full min-h-[60vh] md:min-h-0 h-full relative">
            {/* gl alpha:true makes the WebGL canvas background fully transparent */}
            <Canvas
                camera={{ position: [0, 0, mobile ? 32 : 15], fov: 45 }}
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
        </div>
    );
}
