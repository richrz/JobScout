"use client";

import { motion, useMotionValue, useSpring, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import {
    ArrowRight,
    Sparkles,
    Search,
    Layers,
    Clock,
    Briefcase,
    ChevronDown,
    Filter,
    MapPin,
    Bell,
    Box,
} from "lucide-react";

// Animated counter component
function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    useEffect(() => {
        if (isInView) {
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    setCount(target);
                    clearInterval(timer);
                } else {
                    setCount(Math.floor(current));
                }
            }, duration / steps);
            return () => clearInterval(timer);
        }
    }, [isInView, target]);

    return (
        <span ref={ref}>
            {count.toLocaleString()}{suffix}
        </span>
    );
}

// Stagger animation variants
const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
};

const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } }
};

export default function LandingPage() {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const smoothX = useSpring(mouseX, { stiffness: 50, damping: 20 });
    const smoothY = useSpring(mouseY, { stiffness: 50, damping: 20 });

    function handleMouseMove(e: React.MouseEvent) {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;
        mouseX.set((clientX / innerWidth - 0.5) * 20);
        mouseY.set((clientY / innerHeight - 0.5) * 20);
    }

    return (
        <div className="min-h-screen bg-ayu-bg text-ayu-fg" onMouseMove={handleMouseMove}>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 backdrop-blur-md bg-ayu-bg/80 border-b border-white/5">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Box className="w-6 h-6 text-ayu-accent" />
                        <span className="font-mono font-bold tracking-tight">JOBSCOUT</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm text-ayu-comment">
                        <a href="#features" className="hover:text-ayu-fg transition-colors">Features</a>
                        <a href="#how-it-works" className="hover:text-ayu-fg transition-colors">How It Works</a>
                        <a href="#pricing" className="hover:text-ayu-fg transition-colors">Pricing</a>
                    </div>
                    <button className="px-4 py-2 bg-ayu-accent text-ayu-bg font-bold text-sm rounded-lg hover:bg-ayu-accent/90 transition-colors">
                        Get Started
                    </button>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                {/* Animated Background */}
                <div className="absolute inset-0 z-0">
                    {/* Video placeholder - dark gradient with animated orbs */}
                    <div className="absolute inset-0 bg-gradient-to-b from-ayu-bg via-ayu-bg to-ayu-panel" />
                    
                    {/* Animated orbs */}
                    <motion.div
                        style={{ x: smoothX, y: smoothY }}
                        className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-ayu-accent/5 rounded-full blur-[120px]"
                    />
                    <motion.div
                        style={{ x: smoothY, y: smoothX }}
                        className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-ayu-tag/5 rounded-full blur-[100px]"
                    />
                    
                    {/* Grid overlay */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
                    
                    {/* Noise texture */}
                    <div className="absolute inset-0 opacity-[0.015] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc1Ii8+PC9maWx0ZXI+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI2EpIi8+PC9zdmc+')]" />
                    
                    {/* Vignette */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(11,14,20,0.8)_100%)]" />
                </div>

                {/* Hero Content */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="relative z-10 text-center px-6 max-w-5xl mx-auto"
                >
                    {/* Badge */}
                    <motion.div variants={fadeInUp} className="mb-8">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-ayu-selection bg-ayu-panel/50 backdrop-blur-sm">
                            <Sparkles className="w-4 h-4 text-ayu-accent" />
                            <span className="text-sm font-medium text-ayu-accent">AI Careers Platform</span>
                        </span>
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        variants={fadeInUp}
                        className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tighter leading-[0.9] mb-8"
                    >
                        <span className="block text-ayu-fg">THE MAP</span>
                        <span className="block text-ayu-fg">FOR WHAT&apos;S</span>
                        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-ayu-accent via-ayu-accent to-ayu-tag">
                            NEXT.
                        </span>
                    </motion.h1>

                    {/* Subhead */}
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg md:text-xl text-ayu-comment max-w-2xl mx-auto mb-12 leading-relaxed"
                    >
                        315,000+ AI-powered roles. Updated daily.
                        <br />
                        <span className="text-ayu-fg">No noise. No spam. Just signal.</span>
                    </motion.p>

                    {/* CTAs */}
                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button className="group relative px-8 py-4 bg-ayu-accent text-ayu-bg font-bold rounded-lg overflow-hidden transition-all hover:shadow-[0_0_40px_rgba(255,180,84,0.3)]">
                            <span className="relative z-10 flex items-center gap-2">
                                Start Searching
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        </button>
                        <button className="px-8 py-4 border border-ayu-selection text-ayu-fg font-medium rounded-lg hover:bg-ayu-panel/50 transition-colors">
                            See How It Works
                        </button>
                    </motion.div>

                    {/* Scroll indicator */}
                    <motion.div
                        variants={fadeInUp}
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    >
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        >
                            <ChevronDown className="w-6 h-6 text-ayu-comment" />
                        </motion.div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Trust Bar */}
            <section className="py-12 border-y border-white/5 bg-ayu-panel/30">
                <div className="max-w-7xl mx-auto px-6">
                    <p className="text-center text-sm text-ayu-comment mb-8">
                        Trusted by professionals from leading AI companies
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-12 opacity-40">
                        {["OpenAI", "Anthropic", "Google", "Meta", "Microsoft", "NVIDIA"].map((company) => (
                            <span key={company} className="font-mono text-lg font-bold tracking-tight">
                                {company}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Props */}
            <section id="features" className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.span variants={fadeInUp} className="text-ayu-accent text-sm font-mono uppercase tracking-widest">
                            Why JobScout
                        </motion.span>
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mt-4 tracking-tight">
                            Built for the AI era
                        </motion.h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-2 gap-6"
                    >
                        {[
                            {
                                icon: Filter,
                                title: "SIGNAL OVER NOISE",
                                description: "Every listing verified for AI relevance. No keyword-stuffed spam. No stale posts.",
                                color: "ayu-accent"
                            },
                            {
                                icon: Layers,
                                title: "STACK-LEVEL SEARCH",
                                description: "Filter by PyTorch, LangChain, Claude, GPT—not just 'machine learning.'",
                                color: "ayu-tag"
                            },
                            {
                                icon: Clock,
                                title: "FRESH DAILY",
                                description: "Roles update every 24 hours. See opportunities while they're still open.",
                                color: "ayu-func"
                            },
                            {
                                icon: Briefcase,
                                title: "BEYOND ENGINEERING",
                                description: "AI Sales. AI Consulting. AI Product. The roles that don't show up elsewhere.",
                                color: "ayu-accent"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={feature.title}
                                variants={scaleIn}
                                className="group relative p-8 rounded-2xl bg-ayu-panel/40 backdrop-blur-sm border border-white/5 hover:border-white/10 transition-all hover:bg-ayu-panel/60"
                            >
                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-ayu-accent/30 rounded-tl-lg" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-ayu-accent/30 rounded-br-lg" />
                                
                                <feature.icon className={`w-8 h-8 text-${feature.color} mb-4`} />
                                <h3 className="text-lg font-bold mb-2 tracking-tight">{feature.title}</h3>
                                <p className="text-ayu-comment leading-relaxed">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-24 bg-ayu-panel/30 border-y border-white/5">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12"
                    >
                        {[
                            { value: 315, suffix: "K+", label: "Active AI roles" },
                            { value: 24, suffix: "hr", label: "Average refresh rate" },
                            { value: 47, suffix: "", label: "AI tech stacks indexed" },
                            { value: 156, suffix: "K", label: "Median listed salary", prefix: "$" }
                        ].map((stat) => (
                            <motion.div key={stat.label} variants={fadeInUp} className="text-center">
                                <div className="text-4xl md:text-5xl font-bold text-ayu-fg mb-2">
                                    {stat.prefix}
                                    <AnimatedCounter target={stat.value} suffix={stat.suffix} />
                                </div>
                                <div className="text-sm text-ayu-comment">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works */}
            <section id="how-it-works" className="py-24 md:py-32">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                        className="text-center mb-16"
                    >
                        <motion.span variants={fadeInUp} className="text-ayu-accent text-sm font-mono uppercase tracking-widest">
                            Getting Started
                        </motion.span>
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mt-4 tracking-tight">
                            Three steps to signal
                        </motion.h2>
                    </motion.div>

                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                        variants={staggerContainer}
                        className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    >
                        {[
                            {
                                step: "01",
                                icon: Search,
                                title: "DEFINE YOUR STACK",
                                description: "Select the AI tools you know—or want to learn."
                            },
                            {
                                step: "02",
                                icon: MapPin,
                                title: "SET YOUR SCOPE",
                                description: "Role type, seniority, location, remote preference."
                            },
                            {
                                step: "03",
                                icon: Bell,
                                title: "GET MATCHED",
                                description: "Daily alerts for roles that actually fit."
                            }
                        ].map((item, i) => (
                            <motion.div
                                key={item.step}
                                variants={fadeInUp}
                                className="relative text-center p-8"
                            >
                                {/* Step number */}
                                <div className="text-6xl font-bold text-ayu-panel mb-6 font-mono">
                                    {item.step}
                                </div>
                                
                                {/* Icon */}
                                <div className="w-16 h-16 rounded-2xl bg-ayu-panel/60 border border-white/5 flex items-center justify-center mx-auto mb-6">
                                    <item.icon className="w-8 h-8 text-ayu-accent" />
                                </div>
                                
                                <h3 className="text-lg font-bold mb-2 tracking-tight">{item.title}</h3>
                                <p className="text-ayu-comment">{item.description}</p>
                                
                                {/* Connector line */}
                                {i < 2 && (
                                    <div className="hidden md:block absolute top-1/3 right-0 w-full h-[1px] bg-gradient-to-r from-transparent via-ayu-selection to-transparent translate-x-1/2" />
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 md:py-32 relative overflow-hidden">
                {/* Background glow */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[800px] h-[400px] bg-ayu-accent/10 rounded-full blur-[120px]" />
                </div>
                
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-100px" }}
                        variants={staggerContainer}
                    >
                        <motion.h2 variants={fadeInUp} className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
                            Stop scrolling.
                            <br />
                            <span className="text-ayu-accent">Start finding.</span>
                        </motion.h2>
                        
                        <motion.p variants={fadeInUp} className="text-xl text-ayu-comment mb-10 max-w-2xl mx-auto">
                            The job boards aren&apos;t built for AI careers.
                            <br />
                            This one is.
                        </motion.p>
                        
                        <motion.div variants={fadeInUp}>
                            <button className="group relative px-10 py-5 bg-ayu-accent text-ayu-bg font-bold text-lg rounded-xl overflow-hidden transition-all hover:shadow-[0_0_60px_rgba(255,180,84,0.4)]">
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                                <span className="relative z-10 flex items-center gap-3">
                                    Create Free Account
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </span>
                            </button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 bg-ayu-panel/20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center gap-2">
                            <Box className="w-5 h-5 text-ayu-accent" />
                            <span className="font-mono font-bold text-sm">JOBSCOUT</span>
                        </div>
                        
                        <p className="text-sm text-ayu-comment">
                            The trusted map for AI careers.
                        </p>
                        
                        <div className="flex items-center gap-6 text-sm text-ayu-comment">
                            <a href="#" className="hover:text-ayu-fg transition-colors">Privacy</a>
                            <a href="#" className="hover:text-ayu-fg transition-colors">Terms</a>
                            <a href="#" className="hover:text-ayu-fg transition-colors">Contact</a>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-8 border-t border-white/5 text-center text-xs text-ayu-comment">
                        &copy; {new Date().getFullYear()} JobScout. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
