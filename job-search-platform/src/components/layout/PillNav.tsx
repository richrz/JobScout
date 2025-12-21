'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Briefcase,
    FileText,
    Settings,
    List,
    Layers
} from 'lucide-react';

// Ayu Dark (Neutralized)
const colors = {
    bg: '#0a0a0a',
    surface: '#171717',
    border: '#262626',
    textPrimary: '#ededed',
    textMuted: '#a1a1aa',
    accent: '#7fd962',
    accentDim: 'rgba(127, 217, 98, 0.1)',
};

const NAV_ITEMS = [
    { href: '/', label: 'Home', icon: LayoutDashboard },
    { href: '/jobs', label: 'Inbox', icon: Briefcase },
    { href: '/triage', label: 'Swipe', icon: Layers },
    { href: '/pipeline', label: 'Pipeline', icon: List },
    { href: '/resume', label: 'Resumes', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function PillNav() {
    const pathname = usePathname();

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
            <motion.nav
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="flex items-center gap-1 px-2 py-2 rounded-2xl"
                style={{
                    backgroundColor: colors.surface,
                    boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
                }}
            >
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all duration-200 min-w-[56px]"
                            )}
                            style={{
                                backgroundColor: isActive ? colors.accentDim : 'transparent',
                                color: isActive ? colors.accent : colors.textMuted
                            }}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 rounded-xl"
                                    style={{
                                        backgroundColor: colors.accentDim
                                    }}
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            <Icon
                                className="w-5 h-5 z-10 mb-1"
                                style={{
                                    color: isActive ? colors.accent : colors.textMuted,
                                    filter: isActive ? `drop-shadow(0 0 6px ${colors.accent})` : 'none'
                                }}
                            />
                            <span
                                className="text-[10px] font-medium z-10"
                                style={{ color: isActive ? colors.accent : colors.textMuted }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </motion.nav>
        </div>
    );
}
