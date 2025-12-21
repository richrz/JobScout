'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    Briefcase,
    Layers,
    List,
    FileText,
    Settings,
    Map as MapIcon,
    Sparkles,
    LogOut,
    User
} from 'lucide-react';

// Ayu Dark Palette (Neutralized)
const colors = {
    bg: '#0a0a0a',      // Page bg
    sidebar: '#171717', // Sidebar bg (Zinc 900)
    border: '#262626',
    textPrimary: '#ededed',
    textMuted: '#a1a1aa',
    accent: '#7fd962',
    accentDim: 'rgba(127, 217, 98, 0.1)',
};

const MAIN_NAV = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jobs', label: 'Inbox', icon: Briefcase },
    { href: '/triage', label: 'JobSwipe', icon: Layers },
    { href: '/pipeline', label: 'Pipeline', icon: List },
];

const TOOLS_NAV = [
    { href: '/resume', label: 'Resumes', icon: FileText },
    // Map isn't implemented? Keeping it hidden if needed, or enabling.
    // { href: '/map', label: 'Map', icon: MapIcon }, 
];

const SYSTEM_NAV = [
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside
            className="fixed top-0 left-0 h-screen w-64 border-r z-50 flex flex-col hidden lg:flex"
            style={{
                backgroundColor: colors.sidebar,
                borderColor: colors.border
            }}
        >
            {/* Brand */}
            <div className="h-16 flex items-center px-6 border-b" style={{ borderColor: colors.border }}>
                <Link href="/" className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg">
                        <Sparkles className="w-4 h-4 text-white fill-current" />
                    </div>
                    <span className="font-bold text-lg tracking-tight" style={{ color: colors.textPrimary }}>
                        Job<span style={{ color: colors.accent }}>Scout</span>
                    </span>
                </Link>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">

                {/* Group: Overview */}
                <div className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: colors.textMuted }}>
                        Overview
                    </h3>
                    {MAIN_NAV.map((item) => (
                        <NavItem key={item.href} item={item} isActive={pathname === item.href} />
                    ))}
                </div>

                {/* Group: Tools */}
                <div className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: colors.textMuted }}>
                        Tools
                    </h3>
                    {TOOLS_NAV.map((item) => (
                        <NavItem key={item.href} item={item} isActive={pathname === item.href} />
                    ))}
                </div>

                {/* Group: System */}
                <div className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: colors.textMuted }}>
                        System
                    </h3>
                    {SYSTEM_NAV.map((item) => (
                        <NavItem key={item.href} item={item} isActive={pathname === item.href} />
                    ))}
                </div>
            </div>

            {/* Footer / User Profile */}
            <div className="p-4 border-t" style={{ borderColor: colors.border }}>
                <Link href="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-black border border-white/10">
                        R
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: colors.textPrimary }}>Richard</p>
                        <p className="text-xs truncate" style={{ color: colors.textMuted }}>Pro Member</p>
                    </div>
                </Link>
            </div>
        </aside>
    );
}

function NavItem({ item, isActive }: { item: any, isActive: boolean }) {
    return (
        <Link
            href={item.href}
            className={cn(
                "relative flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group"
            )}
            style={{
                backgroundColor: isActive ? colors.accentDim : 'transparent',
                color: isActive ? colors.accent : colors.textMuted
            }}
        >
            {isActive && (
                <motion.div
                    layoutId="active-sidebar-item"
                    className="absolute inset-0 rounded-lg"
                    style={{
                        backgroundColor: colors.accentDim,
                        // Optional: Left border indicator
                        borderLeft: `3px solid ${colors.accent}`
                    }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
            )}
            <item.icon
                className={cn("w-5 h-5 z-10", isActive && "fill-current opacity-50")} // Fill active icon slightly
            />
            <span className="text-sm font-medium z-10">{item.label}</span>
        </Link>
    );
}
