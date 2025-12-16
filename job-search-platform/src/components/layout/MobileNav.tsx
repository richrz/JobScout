'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, Map, List, FileText, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { Route } from 'next';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/map', label: 'Map', icon: Map },
    { href: '/pipeline', label: 'Pipe', icon: List },
    { href: '/resume', label: 'CV', icon: FileText },
    { href: '/settings', label: 'Set', icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
            <div className="glass rounded-2xl p-2 flex justify-between items-center shadow-2xl backdrop-blur-xl bg-slate-900/80 border-slate-700/50">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href as Route}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[3.5rem]",
                                isActive ? "text-white" : "text-slate-400 hover:text-slate-200"
                            )}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="mobile-nav-pill"
                                    className="absolute inset-0 bg-primary/20 rounded-xl border border-primary/20 shadow-[0_0_15px_rgba(139,92,246,0.3)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon className={cn("h-5 w-5 z-10", isActive && "stroke-[2.5px]")} />
                            <span className="text-[10px] font-medium z-10">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}