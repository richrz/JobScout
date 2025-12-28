"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { MoveRight, Terminal, Shield, Cpu, Zap, MousePointer2 } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

export default function AyuHero() {
    const [hovered, setHovered] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Mouse position for 3D tilt effect
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseX = useSpring(x, { stiffness: 500, damping: 50 });
    const mouseY = useSpring(y, { stiffness: 500, damping: 50 });

    function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const centerX = rect.left + width / 2;
        const centerY = rect.top + height / 2;

        // Calculate normalized mouse position (-1 to 1)
        const rotateX = (event.clientY - centerY) / (height / 2);
        const rotateY = (event.clientX - centerX) / (width / 2);

        x.set(rotateY);
        y.set(rotateX);
    }

    function handleMouseLeave() {
        x.set(0);
        y.set(0);
        setHovered(false);
    }

    // Transform for the 3D card
    const rotateX = useTransform(mouseY, [-1, 1], [10, -10]);
    const rotateY = useTransform(mouseX, [-1, 1], [-10, 10]);

    return (
        <main
            className="min-h-screen bg-ayu-bg text-ayu-fg selection:bg-ayu-selection overflow-hidden relative"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        >
            {/* Background Grid & Particles */}
            <BackgroundEffect />

            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 px-6 py-6 flex justify-between items-center backdrop-blur-sm bg-ayu-bg/50 border-b border-white/5">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-ayu-accent rounded-full animate-pulse" />
                    <span className="font-mono font-bold tracking-widest text-sm">JOBSCOUT.AI</span>
                </div>
                <div className="hidden md:flex gap-8 text-xs font-mono text-ayu-fg/60">
                    <NavItem label="MODULES" />
                    <NavItem label="PRICING" />
                    <NavItem label="MANIFESTO" />
                </div>
                <button className="px-4 py-2 border border-ayu-accent/20 text-ayu-accent text-xs font-mono hover:bg-ayu-accent/10 transition-colors">
                    [ ACCESS_TERMINAL ]
                </button>
            </nav>

            {/* Hero Section */}
            <section className="h-screen w-full flex flex-col items-center justify-center relative z-10 px-4">

                {/* Main Content Container */}
                <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                    {/* Left: Typography & CTA */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="flex flex-col gap-6"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ayu-panel border border-ayu-func/20 w-fit">
                            <span className="w-1.5 h-1.5 rounded-full bg-ayu-func animate-ping" />
                            <span className="text-[10px] font-mono tracking-wider text-ayu-func uppercase">System Online v2.0</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]">
                            <span className="text-white">COMMAND</span> <br />
                            <span className="text-ayu-accent">YOUR FUTURE.</span>
                        </h1>

                        <p className="text-lg text-ayu-fg/70 max-w-lg leading-relaxed">
                            Access the unfair advantage. A career architecture platform reserved for those who refuse to settle for the standard path.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 mt-4">
                            <button className="group relative px-8 py-4 bg-ayu-accent text-black font-bold tracking-wide overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <span className="relative flex items-center gap-2">
                                    INITIALIZE SEQUENCE <MoveRight className="w-4 h-4" />
                                </span>
                            </button>
                            <button className="px-8 py-4 border border-ayu-selection hover:bg-ayu-panel transition-colors text-ayu-fg/80 font-mono text-sm flex items-center gap-2">
                                <Terminal className="w-4 h-4 text-ayu-tag" />
                                VIEW_DEMO_LOGS
                            </button>
                        </div>

                        <div className="mt-8 pt-8 border-t border-white/5 flex gap-8">
                            <Stat label="SUCCESS_RATE" value="98.4%" />
                            <Stat label="TIME_TO_HIRE" value="14 DAYS" />
                            <Stat label="SYSTEM_LOAD" value="OPTIMAL" />
                        </div>
                    </motion.div>

                    {/* Right: Interactive 3D Artifact */}
                    <div className="relative h-[600px] flex items-center justify-center perspective-1000">
                        <motion.div
                            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
                            className="relative w-80 md:w-96 aspect-[3/4] bg-ayu-panel/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl shadow-ayu-accent/5 ml-auto mr-auto lg:mr-0 cursor-crosshair group"
                        >
                            {/* Glass Reflection */}
                            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-50 rounded-xl pointer-events-none" />

                            {/* Floating Elements (Parallax) */}
                            <motion.div
                                style={{ translateZ: 50 }}
                                className="absolute top-8 left-8 p-3 bg-ayu-bg/80 border border-ayu-tag/30 rounded-lg shadow-lg flex items-center gap-3"
                            >
                                <Cpu className="w-5 h-5 text-ayu-tag" />
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-ayu-tag font-mono">CORE_PROCESSOR</span>
                                    <span className="text-xs font-bold text-white">ANALYZING SKILLS</span>
                                </div>
                            </motion.div>

                            <motion.div
                                style={{ translateZ: 80 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-ayu-accent/20 flex items-center justify-center"
                            >
                                <div className="w-32 h-32 rounded-full border border-ayu-accent/40 animate-[spin_10s_linear_infinite]" />
                                <div className="absolute w-40 h-40 rounded-full border border-ayu-func/30 border-dashed animate-[spin_15s_linear_infinite_reverse]" />
                                <div className="absolute w-24 h-24 bg-ayu-accent/10 rounded-full blur-xl animate-pulse" />
                                <Shield className="w-12 h-12 text-ayu-accent absolute z-10" />
                            </motion.div>

                            <motion.div
                                style={{ translateZ: 60 }}
                                className="absolute bottom-12 right-8 p-3 bg-ayu-bg/80 border border-ayu-func/30 rounded-lg shadow-lg flex items-center gap-3"
                            >
                                <div className="flex flex-col items-end">
                                    <span className="text-[10px] text-ayu-func font-mono">MATCH_FOUND</span>
                                    <span className="text-xs font-bold text-white">SENIOR ARCHITECT</span>
                                </div>
                                <Zap className="w-5 h-5 text-ayu-func" />
                            </motion.div>

                            {/* Grid Overlay on Card */}
                            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:20px_20px] rounded-xl pointer-events-none" />

                            {/* Corner Brackets */}
                            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-ayu-accent/50 rounded-tl-lg" />
                            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-ayu-accent/50 rounded-br-lg" />
                        </motion.div>

                        {/* Background Glow behind Card */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-ayu-accent/5 rounded-full blur-3xl -z-10" />
                    </div>
                </div>
            </section>

            {/* Scroll Indicator */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-50">
                <span className="text-[10px] font-mono tracking-widest">SCROLL_TO_BEGIN</span>
                <div className="w-[1px] h-12 bg-gradient-to-b from-white/0 via-white/50 to-white/0" />
            </div>

        </main>
    );
}

// Subcomponents

function NavItem({ label }: { label: string }) {
    return (
        <span className="cursor-pointer hover:text-ayu-accent transition-colors relative group">
            {label}
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-ayu-accent group-hover:w-full transition-all duration-300" />
        </span>
    );
}

function Stat({ label, value }: { label: string, value: string }) {
    return (
        <div className="flex flex-col">
            <span className="text-[10px] font-mono text-ayu-fg/40 mb-1">{label}</span>
            <span className="text-xl font-bold text-white tracking-tight">{value}</span>
        </div>
    );
}

function BackgroundEffect() {
    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {/* Grid */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />

            {/* Ambient Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-ayu-tag/5 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-ayu-func/5 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "2s" }} />

            {/* Moving Particles (CSS only for perf) */}
            <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-ayu-accent rounded-full animate-[ping_3s_infinite]" />
            <div className="absolute top-2/3 right-1/4 w-1 h-1 bg-ayu-tag rounded-full animate-[ping_4s_infinite]" />
            <div className="absolute bottom-1/4 left-1/4 w-1 h-1 bg-ayu-func rounded-full animate-[ping_5s_infinite]" />
        </div>
    );
}
