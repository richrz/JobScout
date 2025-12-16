
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Button } from '@/components/ui/button';
import { MobileNav } from './MobileNav';
import {
    LayoutDashboard,
    Briefcase,
    Map as MapIcon,
    List,
    User,
    FileText,
    Settings,
    Menu,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

const NAV_ITEMS = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/map', label: 'Map', icon: MapIcon },
    { href: '/pipeline', label: 'Pipeline', icon: List },
    { href: '/profile', label: 'Profile', icon: User },
    { href: '/resume', label: 'Resume', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Don't show layout on auth pages
    const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/login');
    if (isAuthPage) return <>{children}</>;

    return (
        <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden">
            <BackgroundMesh />

            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden md:flex flex-col border-r border-border bg-card/30 backdrop-blur-md transition-all duration-300 z-40 h-screen sticky top-0",
                isSidebarOpen ? "w-64" : "w-20"
            )}>
                {/* Sidebar Header */}
                <div className="h-16 flex items-center px-4 border-b border-white/5">
                    <Link href="/" className="flex items-center gap-3 overflow-hidden">
                        <div className="relative w-8 h-8 shrink-0">
                            <Image src="/images/logo-light.svg" alt="Logo" fill className="dark:hidden object-contain" />
                            <Image src="/images/logo-dark.svg" alt="Logo" fill className="hidden dark:block object-contain" />
                        </div>
                        {isSidebarOpen && (
                            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 whitespace-nowrap">
                                JobScout
                            </span>
                        )}
                    </Link>
                </div>

                {/* Sidebar Nav */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                                    isActive
                                        ? "bg-primary/10 text-primary font-medium"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )}
                            >
                                <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary" : "group-hover:text-foreground")} />
                                {isSidebarOpen && (
                                    <span className="truncate">{item.label}</span>
                                )}
                                {!isSidebarOpen && (
                                    <div className="absolute left-full ml-2 px-2 py-1 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md">
                                        {item.label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-white/5 flex flex-col gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="self-end"
                        title="Toggle Sidebar"
                    >
                        {isSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300">
                {/* Topbar (Mobile Only / Actions) */}
                <header className="h-16 border-b border-border bg-background/50 backdrop-blur-md sticky top-0 z-30 px-4 flex items-center justify-between md:justify-end">

                    {/* Mobile Menu Trigger & Logo */}
                    <div className="flex items-center gap-4 md:hidden">
                        <MobileNav />
                        <Link href="/" className="font-bold text-lg">JobScout</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                        {/* User Profile Dropdown could go here */}
                    </div>
                </header>

                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
