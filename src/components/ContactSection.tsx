"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Github, Linkedin, Mail, Briefcase, Download } from "lucide-react";

export default function ContactSection() {
  const containerRef = useRef<HTMLElement>(null);
  const isInView = useInView(containerRef, { once: true, amount: 0.3 });

  // Terminal Typing Animation State
  const [typedLines, setTypedLines] = useState<number>(-1);
  const [currentLineText, setCurrentLineText] = useState("");

  const terminalLines = [
    { text: "// secure connection established", type: "dim" },
    { text: "✓ Connected · aryan-yadav.dev", type: "green" },
    { text: "", type: "empty" },
    { text: "cat contact.json", type: "cmd" },
    { text: "{", type: "dim" },
    { text: "  name: ", val: "Aryan Yadav", type: "kv", valType: "green" },
    { text: "  role: ", val: "ML Engineer", type: "kv", valType: "blue" },
    { text: "  email: ", val: "ay6033756@gmail.com", type: "kv", valType: "green" },
    { text: "  github: ", val: "aryxn-builds", type: "kv", valType: "blue" },
    { text: "  linkedin: ", val: "aryan0203", type: "kv", valType: "blue" },
    { text: "  available: ", val: "true", type: "kv", valType: "green" },
    { text: "  response: ", val: "< 24 hours", type: "kv", valType: "green" },
    { text: "  location: ", val: "India · Remote OK", type: "kv", valType: "white" },
    { text: "}", type: "dim" },
    { text: "", type: "empty" },
    { text: "", type: "prompt" },
  ];

  useEffect(() => {
    if (!isInView) return;

    let currentLine = 0;
    
    // Start delay: 0.8s
    const startTimeout = setTimeout(() => {
      setTypedLines(0);
      typeNextLine(0);
    }, 800);

    const typeNextLine = (lineIdx: number) => {
      if (lineIdx >= terminalLines.length) return;

      const line = terminalLines[lineIdx];
      const fullText = line.type === "kv" ? line.text + line.val : line.text;
      
      if (!fullText) {
        setTypedLines(lineIdx);
        setCurrentLineText("");
        setTimeout(() => typeNextLine(lineIdx + 1), 150);
        return;
      }

      let charIdx = 0;
      const typeChar = () => {
        if (charIdx <= fullText.length) {
          setCurrentLineText(fullText.substring(0, charIdx));
          charIdx++;
          setTimeout(typeChar, 25);
        } else {
          setTypedLines(lineIdx);
          setTimeout(() => typeNextLine(lineIdx + 1), 150);
        }
      };
      
      typeChar();
    };

    return () => clearTimeout(startTimeout);
  }, [isInView]);

  const renderTerminalLine = (line: typeof terminalLines[0], index: number) => {
    // If we haven't reached this line, render nothing
    if (index > typedLines + 1) return null;
    
    // If this is the currently typing line
    const isTyping = index === typedLines + 1;
    let displayText = isTyping ? currentLineText : (line.type === "kv" ? line.text + line.val : line.text);

    if (line.type === "empty") return <div key={index} className="h-[1.8em]"></div>;
    
    if (line.type === "prompt") {
      if (!isTyping && index > typedLines) return null;
      return (
        <div key={index}>
          <span style={{ color: "#FF4500" }}>aryan@portfolio:~$ </span>
          <span className="inline-block w-2.5 h-[1.1em] bg-[#FF4500] align-middle animate-[blink_1s_infinite]"></span>
        </div>
      );
    }
    
    if (line.type === "cmd") {
      return (
        <div key={index}>
          <span style={{ color: "#FF4500" }}>aryan@portfolio:~$ </span>
          <span style={{ color: "rgba(255,255,255,0.85)" }}>{displayText}</span>
        </div>
      );
    }
    
    if (line.type === "kv") {
      let keyPart = displayText;
      let valPart = "";
      if (displayText.length > line.text.length) {
        keyPart = line.text;
        valPart = displayText.substring(line.text.length);
      }
      
      const valColor = line.valType === "green" ? "#00FF88" : 
                       line.valType === "blue" ? "#00BFFF" : 
                       "rgba(255,255,255,0.85)";
                       
      return (
        <div key={index}>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>{keyPart}</span>
          <span style={{ color: valColor }}>{valPart}</span>
        </div>
      );
    }
    
    const color = line.type === "dim" ? "rgba(255,255,255,0.3)" : 
                  line.type === "green" ? "#00FF88" : "inherit";
                  
    return <div key={index} style={{ color }}>{displayText}</div>;
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = '/resume/aryan-yadav-resume.pdf';
    a.download = 'Aryan-Yadav-Resume.pdf';
    a.click();
  };

  const useOrbitalSize = () => {
    const [size, setSize] = useState(360);
    useEffect(() => {
      const update = () => {
        const w = window.innerWidth;
        if (w < 380) setSize(260);
        else if (w < 480) setSize(300);
        else if (w < 768) setSize(320);
        else if (w < 1024) setSize(340);
        else setSize(360);
      };
      update();
      window.addEventListener('resize', update);
      return () => window.removeEventListener('resize', update);
    }, []);
    return size;
  };

  const ORBITAL_SIZE = useOrbitalSize();
  const center = ORBITAL_SIZE / 2;
  const radius = ORBITAL_SIZE * 0.44;
  const nodeSize = ORBITAL_SIZE < 300 ? 40 : ORBITAL_SIZE < 340 ? 44 : 52;

  const getNodePos = (angleDeg: number) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      left: center + radius * Math.sin(rad) - (nodeSize / 2),
      top: center - radius * Math.cos(rad) - (nodeSize / 2),
    };
  };

  const githubPos = getNodePos(0);
  const linkedinPos = getNodePos(72);
  const emailPos = getNodePos(144);
  const hiremePos = getNodePos(216);
  const resumePos = getNodePos(288);

  const nodes = [
    {
      id: "github",
      label: "GITHUB",
      color: "#FF4500",
      icon: Github,
      pos: githubPos,
      tooltip: ["GITHUB", "github.com/aryxn-builds", "18 Public Repos · Active", "VIEW PROFILE ↗"],
      action: () => window.open("https://github.com/aryxn-builds", "_blank"),
      dur: "3s"
    },
    {
      id: "linkedin",
      label: "LINKEDIN",
      color: "#00BFFF",
      icon: Linkedin,
      pos: linkedinPos,
      tooltip: ["LINKEDIN", "linkedin.com/in/aryan0203", "ML Engineer · B.Tech CSE", "CONNECT ↗"],
      action: () => window.open("https://www.linkedin.com/in/aryan0203", "_blank"),
      dur: "4s"
    },
    {
      id: "email",
      label: "EMAIL",
      color: "#CC44FF",
      icon: Mail,
      pos: emailPos,
      tooltip: ["EMAIL", "ay6033756@gmail.com", "Response time: < 24 hours", "SEND EMAIL ↗"],
      action: () => window.location.href = "mailto:ay6033756@gmail.com",
      dur: "3.5s"
    },
    {
      id: "hire",
      label: "HIRE ME",
      color: "#00FF88",
      icon: Briefcase,
      pos: hiremePos,
      tooltip: ["HIRE ME", "ML · GenAI · Computer Vision", "Internship or Full-time", "GET IN TOUCH ↗"],
      action: () => window.location.href = "mailto:ay6033756@gmail.com?subject=Internship%20Opportunity%20-%20Aryan%20Yadav",
      dur: "4.5s"
    },
    {
      id: "resume",
      label: "RESUME",
      color: "#FF8C00",
      icon: Download,
      pos: resumePos,
      tooltip: ["RESUME", "Aryan Yadav · ML Engineer", "Updated 2026 · PDF", "DOWNLOAD ↗"],
      action: handleDownload,
      dur: "2.5s"
    }
  ];

  const coreSize = ORBITAL_SIZE < 300 ? 60 : ORBITAL_SIZE < 340 ? 68 : 80;
  const coreFontSize = ORBITAL_SIZE < 300 ? '14px' : ORBITAL_SIZE < 340 ? '16px' : '18px';
  const labelSize = ORBITAL_SIZE < 300 ? '0.45rem' : ORBITAL_SIZE < 340 ? '0.5rem' : '0.55rem';

  return (
    <section 
      id="contact" 
      ref={containerRef}
      className="min-h-[100vh] w-full flex flex-col items-center justify-center relative"
      style={{ background: "rgba(5,5,8,0.72)", backdropFilter: "blur(2px)" }}
    >
      {/* Top fade */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '120px', background: 'linear-gradient(to bottom, #050508 0%, transparent 100%)', zIndex: 10, pointerEvents: 'none' }} />
      {/* Bottom fade */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '200px', background: 'linear-gradient(to top, #050508 0%, transparent 100%)', zIndex: 10, pointerEvents: 'none' }} />

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          from { transform: rotate(0deg) }
          to { transform: rotate(360deg) }
        }
        @keyframes spinReverse {
          from { transform: rotate(0deg) }
          to { transform: rotate(-360deg) }
        }
        @keyframes corePulse {
          0%,100% {
            box-shadow: 0 0 30px rgba(255,69,0,0.6), 0 0 60px rgba(255,69,0,0.2)
          }
          50% {
            box-shadow: 0 0 50px rgba(255,69,0,0.9), 0 0 80px rgba(255,69,0,0.35)
          }
        }
        @keyframes pulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.6); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}} />

      {/* BACKGROUND EFFECTS */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, rgba(255,69,0,0.05) 0%, rgba(0,191,255,0.03) 40%, transparent 70%)"
        }}
      />
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "repeating-linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px) 0 0 / 40px 40px"
        }}
      />

      {/* SECTION HEADING */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8 }}
        className="z-10 text-center mb-12 px-4"
      >
        <h2 className="font-display font-bold text-[2.5rem] leading-none mb-2">
          <span className="text-white">INITIATE</span> <span className="text-[#FF4500]">CONNECTION.</span>
        </h2>
        <p className="font-mono text-[0.75rem] text-[rgba(255,255,255,0.3)] tracking-[0.2em]">
          LET&apos;S BUILD THE FUTURE TOGETHER
        </p>
      </motion.div>

      {/* MAIN CONTENT ROW */}
      <div className="z-10 flex flex-col lg:flex-row items-center justify-center gap-10 w-full max-w-6xl px-4">
        
        {/* LEFT COLUMN: TERMINAL PANEL */}
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:block w-[260px] rounded-xl overflow-hidden shadow-2xl shrink-0"
          style={{ 
            background: "rgba(5,5,8,0.95)", 
            border: "0.5px solid rgba(255,69,0,0.25)" 
          }}
        >
          {/* Top Bar */}
          <div className="h-[36px] px-3 flex items-center border-b border-white/[0.06] bg-white/[0.03]">
            <div className="flex gap-[6px]">
              <div className="w-[10px] h-[10px] rounded-full bg-[#FF5F57]"></div>
              <div className="w-[10px] h-[10px] rounded-full bg-[#FFBD2E]"></div>
              <div className="w-[10px] h-[10px] rounded-full bg-[#28CA41]"></div>
            </div>
            <div className="ml-auto font-mono text-[0.6rem] text-white/20">ARYAN.SSH</div>
          </div>
          {/* Terminal Body */}
          <div className="p-4 font-mono text-[11px] leading-[1.8] min-h-[310px]">
            {terminalLines.map((line, i) => renderTerminalLine(line, i))}
          </div>
        </motion.div>

        {/* CENTER COLUMN: ORBITAL DIAGRAM */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 200 }}
          className="relative shrink-0"
          style={{ width: ORBITAL_SIZE, height: ORBITAL_SIZE }}
        >
          {/* Orbital Rings */}
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{ 
              top: 0, left: 0,
              width: ORBITAL_SIZE, height: ORBITAL_SIZE,
              border: "1px dashed rgba(255,69,0,0.15)", animation: "spin 40s linear infinite" 
            }}
          />
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{ 
              top: ORBITAL_SIZE * 0.14, left: ORBITAL_SIZE * 0.14,
              width: ORBITAL_SIZE * 0.72, height: ORBITAL_SIZE * 0.72,
              border: "1px dashed rgba(0,191,255,0.1)", animation: "spinReverse 28s linear infinite" 
            }}
          />
          <div 
            className="absolute rounded-full pointer-events-none"
            style={{ 
              top: ORBITAL_SIZE * 0.28, left: ORBITAL_SIZE * 0.28,
              width: ORBITAL_SIZE * 0.44, height: ORBITAL_SIZE * 0.44,
              border: "1px dashed rgba(255,69,0,0.2)", animation: "spin 18s linear infinite" 
            }}
          />

          {/* SVG Connection Lines */}
          <svg 
            className="absolute top-0 left-0 pointer-events-none z-[2]"
            style={{ width: ORBITAL_SIZE, height: ORBITAL_SIZE }}
            viewBox={`0 0 ${ORBITAL_SIZE} ${ORBITAL_SIZE}`}
          >
            {nodes.map((node) => {
              const pathId = `path-${node.id}`;
              const d = `M ${center} ${center} L ${node.pos.left + nodeSize / 2} ${node.pos.top + nodeSize / 2}`;
              
              return (
                <g key={node.id}>
                  <path id={pathId} d={d} fill="none" stroke={node.color} strokeWidth="1" strokeOpacity="0.2" />
                  <circle r="2" fill={node.color}>
                    <animateMotion dur={node.dur} repeatCount="indefinite">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                  <circle r="2" fill={node.color}>
                    <animateMotion dur={node.dur} repeatCount="indefinite" begin="1s">
                      <mpath href={`#${pathId}`} />
                    </animateMotion>
                  </circle>
                </g>
              );
            })}
          </svg>

          {/* Center Core */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full flex items-center justify-center font-display font-bold text-white z-[5]"
            style={{
              width: coreSize, height: coreSize, fontSize: coreFontSize,
              background: "linear-gradient(135deg, #FF4500, #FF8C00)",
              animation: "corePulse 2.5s ease-in-out infinite"
            }}
          >
            AY
          </div>

          {/* Nodes */}
          {nodes.map((node) => (
            <div 
              key={node.id}
              className="group absolute rounded-full flex items-center justify-center z-10 transition-all duration-300 ease-out cursor-pointer hover:scale-[115%]"
              style={{
                top: node.pos.top, left: node.pos.left,
                width: nodeSize, height: nodeSize,
                background: `${node.color}1E`, // approx hex for rgba(x,y,z,0.12)
                border: `1.5px solid ${node.color}`,
                boxShadow: `0 0 20px ${node.color}40`
              }}
              onClick={node.action}
            >
              <node.icon size={20} color={node.color} />
              
              {/* Node Label */}
              <div 
                className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono transition-opacity opacity-100 lg:opacity-100"
                style={{ color: node.color, fontSize: labelSize, top: nodeSize + 4 }}
              >
                {node.label}
              </div>

              {/* Hover Tooltip (Desktop only via group-hover and pointer constraints) */}
              <div 
                className="hidden lg:block absolute bottom-[64px] left-1/2 -translate-x-1/2 rounded-xl px-3.5 py-2.5 whitespace-nowrap z-20 font-mono text-[10px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{
                  background: "rgba(5,5,8,0.97)",
                  border: `1px solid ${node.color}`
                }}
              >
                <div style={{ color: node.color }} className="mb-0.5">{node.tooltip[0]}</div>
                <div className="text-white/40 mb-1 border-b border-white/10 pb-1">─────────────</div>
                <div className="text-white mb-0.5">{node.tooltip[1]}</div>
                <div className="text-white/30 mb-2">{node.tooltip[2]}</div>
                <div style={{ color: node.color }}>[ {node.tooltip[3]} ]</div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* RIGHT COLUMN: STATUS PANEL */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={isInView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="hidden lg:flex flex-col w-[200px] rounded-xl shrink-0 backdrop-blur-md"
          style={{ 
            background: "rgba(5,5,8,0.95)", 
            border: "0.5px solid rgba(255,69,0,0.25)",
            padding: "20px 16px"
          }}
        >
          {/* Availability Badge */}
          <div 
            className="rounded-lg text-center mb-4 pb-2"
            style={{
              background: "rgba(0,255,136,0.08)",
              border: "0.5px solid rgba(0,255,136,0.35)",
              padding: "10px 12px"
            }}
          >
            <div className="font-mono text-[0.65rem] tracking-[0.1em] text-[#00FF88] flex items-center justify-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-[pulseDot_2s_infinite]"></span>
              AVAILABLE FOR HIRE
            </div>
            <div className="font-mono text-[0.55rem] text-white/[0.35]">
              Internship · Full-time
            </div>
          </div>

          <div className="h-px bg-white/[0.06] mb-3"></div>

          <div className="font-mono text-[0.55rem] text-[#FF4500] tracking-[0.15em] mb-2">SYSTEM STATUS</div>

          {[
            { k: "STATUS", v: "AVAILABLE", c: "#00FF88", dot: true },
            { k: "ROLE", v: "ML ENGINEER", c: "#FF4500", dot: false },
            { k: "TYPE", v: "INTERNSHIP", c: "white", dot: false },
            { k: "LOCATION", v: "INDIA", c: "white", dot: false },
            { k: "REMOTE", v: "OPEN", c: "#00FF88", dot: false },
            { k: "RESPONSE", v: "< 24 HOURS", c: "#00FF88", dot: false },
            { k: "YEAR", v: "3RD B.TECH", c: "white", dot: false },
          ].map((row, i) => (
            <div key={i} className="flex justify-between items-center py-1.5 border-b border-white/[0.04] last:border-0">
              <span className="font-mono text-[0.58rem] text-white/30">{row.k}</span>
              <span className="font-mono text-[0.62rem] flex items-center gap-1.5" style={{ color: row.c }}>
                {row.dot && <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-[pulseDot_2s_infinite]"></span>}
                {row.v}
              </span>
            </div>
          ))}

          <div className="h-px bg-white/[0.06] my-3"></div>

          <div className="font-mono text-[0.55rem] text-[#FF4500] tracking-[0.15em] mb-2">QUICK ACCESS</div>
          
          <a href="https://github.com/aryxn-builds" target="_blank" className="font-mono text-[0.6rem] text-white/[0.35] py-1 hover:text-white hover:underline transition-colors">↗ github.com/aryxn-builds</a>
          <a href="https://www.linkedin.com/in/aryan0203" target="_blank" className="font-mono text-[0.6rem] text-white/[0.35] py-1 hover:text-white hover:underline transition-colors">↗ linkedin/aryan0203</a>
          <a href="mailto:ay6033756@gmail.com" className="font-mono text-[0.6rem] text-white/[0.35] py-1 hover:text-white hover:underline transition-colors">↗ ay6033756@gmail.com</a>

          <button 
            onClick={() => window.location.href = "mailto:ay6033756@gmail.com?subject=Let%27s%20Connect%20-%20Aryan%20Yadav%27s%20Portfolio"}
            className="w-full h-10 mt-4 rounded-lg font-display text-[0.65rem] tracking-[0.1em] text-white transition-all duration-200 hover:brightness-115 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, #FF4500, #FF8C00)", border: "none" }}
          >
            [ INITIATE CONTACT ]
          </button>
        </motion.div>
      </div>

      {/* MOBILE ONLY: STATUS BADGE & LINKS */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex lg:hidden flex-col w-full max-w-[340px] px-4 mt-8 z-10"
      >
        <div 
          className="rounded-lg text-center mb-6"
          style={{
            background: "rgba(0,255,136,0.08)",
            border: "0.5px solid rgba(0,255,136,0.35)",
            padding: "12px"
          }}
        >
          <div className="font-mono text-[0.65rem] tracking-[0.1em] text-[#00FF88] flex items-center justify-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-[pulseDot_2s_infinite]"></span>
            AVAILABLE FOR HIRE
          </div>
          <div className="font-mono text-[0.55rem] text-white/[0.35]">
            Internship · Full-time
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <a 
            href="https://github.com/aryxn-builds" target="_blank"
            className="flex items-center gap-3 w-full h-12 px-4 rounded-xl bg-white/[0.02]"
            style={{ border: "0.5px solid rgba(255,69,0,0.3)" }}
          >
            <Github size={18} color="#FF4500" />
            <span className="font-mono text-[0.75rem] text-white">GitHub — aryxn-builds</span>
          </a>
          <a 
            href="https://www.linkedin.com/in/aryan0203" target="_blank"
            className="flex items-center gap-3 w-full h-12 px-4 rounded-xl bg-white/[0.02]"
            style={{ border: "0.5px solid rgba(0,191,255,0.25)" }}
          >
            <Linkedin size={18} color="#00BFFF" />
            <span className="font-mono text-[0.75rem] text-white">LinkedIn — aryan0203</span>
          </a>
          <a 
            href="mailto:ay6033756@gmail.com"
            className="flex items-center gap-3 w-full h-12 px-4 rounded-xl bg-white/[0.02]"
            style={{ border: "0.5px solid rgba(204,68,255,0.25)" }}
          >
            <Mail size={18} color="#CC44FF" />
            <span className="font-mono text-[0.75rem] text-white">Email — ay6033756@gmail.com</span>
          </a>
          <a 
            href="mailto:ay6033756@gmail.com?subject=Internship%20Opportunity"
            className="flex items-center gap-3 w-full h-12 px-4 rounded-xl bg-white/[0.02]"
            style={{ border: "0.5px solid rgba(0,255,136,0.25)" }}
          >
            <Briefcase size={18} color="#00FF88" />
            <span className="font-mono text-[0.75rem] text-white">Hire Me — Open to roles</span>
          </a>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-3 w-full h-12 px-4 rounded-xl bg-white/[0.02]"
            style={{ border: "0.5px solid rgba(255,140,0,0.25)" }}
          >
            <Download size={18} color="#FF8C00" />
            <span className="font-mono text-[0.75rem] text-white">Resume — Download PDF</span>
          </button>
        </div>
      </motion.div>

      {/* SECTION FOOTER */}
      <div className="w-full mt-16 pt-6 border-t border-white/[0.05] text-center z-10 px-4">
        <div className="font-mono text-[0.65rem] text-white/20 tracking-[0.15em]">
          BUILT WITH PASSION · DEPLOYED WITH PURPOSE
        </div>
        <div className="font-mono text-[0.55rem] text-white/[0.12] tracking-[0.1em] mt-1.5">
          © 2026 ARYAN YADAV · ALL RIGHTS RESERVED
        </div>
      </div>

    </section>
  );
}
