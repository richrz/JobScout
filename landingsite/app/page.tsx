"use client";

import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";
import { ArrowRight, Activity, Globe, Zap, Box, Lock } from "lucide-react";

export default function AyuRebornHero() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Smooth mouse for the interactive background
    const smoothX = useSpring(mouseX, { stiffness: 100, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 100, damping: 20 });

    function handleMouseMove(e: React.MouseEvent) {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        mouseX.set(clientX / innerWidth - 0.5);
        mouseY.set(clientY / innerHeight - 0.5);
    }

    return (
        <main
            className="h-screen w-full relative flex flex-col items-center justify-center overflow-hidden bg-ayu-bg isolate"
            onMouseMove={handleMouseMove}
        >
            {/* 
        LAYER 0: BACKGROUND ATMOSPHERE
        A subtle, breathing void. 
      */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(11,14,20,0)_0%,rgba(11,14,20,1)_100%)] z-10" />
                <motion.div
                    style={{ x: smoothX, y: smoothY }}
                    className="absolute inset-[-20%] opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150"
                />
                {/* The "Source" Light */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-ayu-accent/5 rounded-full blur-[120px] animate-pulse" />
            </div>

            {/* 
        LAYER 1: THE "IMPOSSIBLE OBJECT"
        A central, rotating 3D-ish structure made of SVG paths.
        Not a card. Not a terminal. A "Core".
      */}
            <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
                    className="relative w-[600px] h-[600px] opacity-40"
                >
                    {/* Outer Ring */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path d="M50,10 A40,40 0 1,1 50,90 A40,40 0 1,1 50,10" fill="none" stroke="var(--ayu-tag)" strokeWidth="0.2" strokeDasharray="4 2" />
                        <path d="M50,20 A30,30 0 1,1 50,80 A30,30 0 1,1 50,20" fill="none" stroke="var(--ayu-func)" strokeWidth="0.1" />
                        <path d="M50,30 A20,20 0 1,1 50,70 A20,20 0 1,1 50,30" fill="none" stroke="var(--ayu-accent)" strokeWidth="0.3" strokeDasharray="1 4" />
                    </svg>
                </motion.div>

                {/* Counter-Rotating Inner Ring */}
                <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
                    className="absolute w-[400px] h-[400px] opacity-30"
                >
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <rect x="25" y="25" width="50" height="50" fill="none" stroke="var(--ayu-fg)" strokeWidth="0.1" transform="rotate(45 50 50)" />
                    </svg>
                </motion.div>
            </div>

            {/* 
        LAYER 2: THE TYPOGRAPHY (CENTERED & BOLD)
        Massive text that interacts with the user.
      */}
            <div className="relative z-20 text-center flex flex-col items-center gap-8">

                {/* Top Label */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 px-4 py-2 border border-ayu-selection bg-ayu-bg/50 backdrop-blur-md rounded-full"
                >
                    <div className="w-2 h-2 rounded-full bg-ayu-accent animate-ping" />
                    <span className="font-mono text-xs text-ayu-accent tracking-widest uppercase">Restricted Access // Architects Only</span>
                </motion.div>

                {/* Main Headline */}
                <h1 className="relative font-bold text-7xl md:text-9xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-ayu-fg via-ayu-fg to-ayu-bg selection:bg-ayu-accent selection:text-ayu-bg">
                    <span className="block hover:scale-105 transition-transform duration-500 cursor-default">BUILD</span>
                    <span className="block text-ayu-accent/90 hover:scale-105 transition-transform duration-500 cursor-default">YOUR</span>
                    <span className="block hover:scale-105 transition-transform duration-500 cursor-default">DYNASTY.</span>
                </h1>

                {/* Subtext */}
                <p className="max-w-lg text-ayu-comment text-center font-mono text-sm md:text-base leading-relaxed">
                    The global career infrastructure is collapsing. <br />
                    We built the <span className="text-ayu-tag">ark</span> for the 0.1%.
                </p>

                {/* CTA Area */}
                <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="mt-8 group relative"
                >
                    <div className="absolute -inset-1 bg-gradient-to-r from-ayu-accent to-ayu-tag rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200" />
                    <button className="relative px-8 py-4 bg-ayu-bg ring-1 ring-white/10 rounded-lg flex items-center gap-4">
                        <span className="font-bold text-white tracking-wide">ENTER THE PROTOCOL</span>
                        <ArrowRight className="w-4 h-4 text-ayu-accent group-hover:translate-x-1 transition-transform" />
                    </button>
                </motion.div>

            </div>

            {/* 
        LAYER 3: PERIPHERAL HUD ELEMENTS 
        Floating data points that make it feel like a cockpit/dashboard.
      */}

            {/* Top Left: Logo */}
            <div className="absolute top-8 left-8 flex items-center gap-2 mix-blend-difference">
                <Box className="w-6 h-6 text-ayu-accent" />
                <span className="font-mono font-bold text-ayu-fg">JOBSCOUT_ZERO</span>
            </div>

            {/* Bottom Left: Live Metrics */}
            <div className="absolute bottom-8 left-8 hidden md:block">
                <div className="flex flex-col gap-2 font-mono text-[10px] text-ayu-comment">
                    <div className="flex items-center gap-2">
                        <Activity className="w-3 h-3 text-ayu-func" />
                        <span>SYSTEM_LATENCY: 12ms</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Globe className="w-3 h-3 text-ayu-tag" />
                        <span>NODES_ACTIVE: 8,402</span>
                    </div>
                </div>
            </div>

            {/* Bottom Right: Security Verification */}
            <div className="absolute bottom-8 right-8 hidden md:block">
                <div className="flex items-center gap-3 px-4 py-2 border border-ayu-error/20 bg-ayu-error/5 rounded text-ayu-error">
                    <Lock className="w-3 h-3" />
                    <span className="font-mono text-[10px] tracking-wider">ENCRYPTED_CONNECTION</span>
                </div>
            </div>

            {/* Floating Particles/Nodes */}
            <FloatingNode x="10%" y="20%" delay={0} icon={<Zap className="w-4 h-4 text-ayu-accent" />} />
            <FloatingNode x="80%" y="15%" delay={2} icon={<Box className="w-4 h-4 text-ayu-tag" />} />
            <FloatingNode x="85%" y="80%" delay={4} icon={<Activity className="w-4 h-4 text-ayu-func" />} />

        </main>
    );
}

function FloatingNode({ x, y, delay, icon }: { x: string, y: string, delay: number, icon: React.ReactNode }) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1, y: [0, -20, 0] }}
            transition={{
                opacity: { delay, duration: 1 },
                scale: { delay, duration: 1 },
                y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay }
            }}
            className="absolute p-3 bg-ayu-panel/80 border border-white/5 backdrop-blur-sm rounded-xl shadow-2xl"
            style={{ left: x, top: y }}
        >
            {icon}
        </motion.div>
    );
}
