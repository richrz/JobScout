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
    LogOut,
    User
} from 'lucide-react';

import Image from 'next/image';

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
                    <div className="relative w-36 h-12 shrink-0 transition-transform duration-300 hover:scale-105">
                        <Image
                            src="/images/logo-full-dark.svg"
                            alt="JobScout Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </Link>
            </div>

            {/* Navigation Groups */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">

                {/* Group: Workspace */}
                <div className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: colors.textMuted }}>
                        Workspace
                    </h3>
                    <NavItem item={{ href: '/', label: 'Dashboard', icon: LayoutDashboard }} isActive={pathname === '/'} />
                    <NavItem item={{ href: '/jobs', label: 'Inbox', icon: Briefcase }} isActive={pathname === '/jobs'} />
                    <NavItem item={{ href: '/triage', label: 'JobSwipe', icon: Layers }} isActive={pathname === '/triage'} />
                    <NavItem item={{ href: '/pipeline', label: 'Pipeline', icon: List }} isActive={pathname === '/pipeline'} />
                </div>

                {/* Group: Career */}
                <div className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: colors.textMuted }}>
                        Career
                    </h3>
                    <NavItem item={{ href: '/career', label: 'Career Data', icon: User }} isActive={pathname === '/career'} />
                    <NavItem item={{ href: '/resume', label: 'Resumes', icon: FileText }} isActive={pathname === '/resume'} />
                </div>

                {/* Group: System */}
                <div className="space-y-1">
                    <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 px-2" style={{ color: colors.textMuted }}>
                        System
                    </h3>
                    <NavItem item={{ href: '/settings', label: 'Settings', icon: Settings }} isActive={pathname === '/settings'} />
                </div>
            </div>

            {/* Footer / Account */}
            <div className="p-4 border-t" style={{ borderColor: colors.border }}>
                <Link href="/profile" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-black border border-white/10 group-hover:border-white/20">
                        R
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: colors.textPrimary }}>Richard</p>
                        <p className="text-xs truncate" style={{ color: colors.textMuted }}>Manage Account</p>
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
