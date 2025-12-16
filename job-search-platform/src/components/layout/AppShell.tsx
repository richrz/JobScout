
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
    X,
    Sparkles
} from 'lucide-react';
import Image from 'next/image';

const NAV_GROUPS = [
    {
        label: 'Platform',
        items: [
            { href: '/', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/jobs', label: 'Job Search', icon: Briefcase },
            { href: '/map', label: 'Map View', icon: MapIcon },
        ]
    },
    {
        label: 'Management',
        items: [
            { href: '/pipeline', label: 'Pipeline', icon: List },
            { href: '/resume', label: 'Resumes', icon: FileText },
        ]
    },
    {
        label: 'User',
        items: [
            { href: '/profile', label: 'Profile', icon: User },
            { href: '/settings', label: 'Settings', icon: Settings },
        ]
    }
];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // Don't show layout on auth pages
    const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/login');
    if (isAuthPage) return <>{children}</>;

    return (
        <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden font-sans">
            <BackgroundMesh />

            {/* Desktop Sidebar */}
            <aside className={cn(
                "hidden md:flex flex-col border-r border-border bg-card/40 backdrop-blur-xl transition-all duration-300 z-40 h-screen sticky top-0",
                isSidebarOpen ? "w-72" : "w-[88px]"
            )}>
                {/* Sidebar Header */}
                <div className="h-16 flex items-center px-6 border-b border-border/50">
                    <Link href="/" className="flex items-center gap-3 overflow-hidden group">
                        <div className="relative w-8 h-8 shrink-0 transition-transform group-hover:scale-110 duration-300">
                            <Image src="/images/logo-light.svg" alt="Logo" fill className="dark:hidden object-contain" />
                            <Image src="/images/logo-dark.svg" alt="Logo" fill className="hidden dark:block object-contain" />
                        </div>
                        {isSidebarOpen && (
                            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 whitespace-nowrap animate-in fade-in duration-300">
                                JobScout
                            </span>
                        )}
                    </Link>
                </div>

                {/* Sidebar Nav */}
                <nav className="flex-1 py-6 px-4 space-y-8 overflow-y-auto no-scrollbar">
                    {NAV_GROUPS.map((group, groupIndex) => (
                        <div key={group.label} className={cn("space-y-2", !isSidebarOpen && "text-center")}>
                            {isSidebarOpen && (
                                <h3 className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider px-2 mb-2">
                                    {group.label}
                                </h3>
                            )}
                            {!isSidebarOpen && groupIndex > 0 && <div className="h-px w-8 mx-auto bg-border/50 my-4" />}

                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
                                            isActive
                                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                                : "text-muted-foreground hover:bg-muted hover:text-foreground hover:translate-x-1",
                                            !isSidebarOpen && "justify-center px-0 hover:translate-x-0"
                                        )}
                                        title={!isSidebarOpen ? item.label : undefined}
                                    >
                                        <Icon className={cn("w-5 h-5 shrink-0 transition-colors", isActive ? "text-primary-foreground" : "group-hover:text-foreground")} />
                                        {isSidebarOpen && (
                                            <span className="text-body-sm font-medium">{item.label}</span>
                                        )}
                                        {!isSidebarOpen && (
                                            <div className="absolute left-full ml-3 px-3 py-1.5 bg-popover text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-md border border-border/50 transform translate-x-1 group-hover:translate-x-0 transition-all">
                                                {item.label}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* Sidebar Footer */}
                <div className="p-4 border-t border-border/50 flex flex-col gap-2 bg-gradient-to-t from-background/50 to-transparent">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={cn("text-muted-foreground hover:text-foreground transition-colors", isSidebarOpen ? "self-end" : "self-center")}
                        title="Toggle Sidebar"
                    >
                        {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-screen transition-all duration-300 relative z-0">
                {/* Topbar (Mobile Only / Actions) */}
                <header className="h-16 border-b border-border/50 bg-background/50 backdrop-blur-md sticky top-0 z-30 px-6 flex items-center justify-between md:justify-end">

                    {/* Mobile Menu Trigger & Logo */}
                    <div className="flex items-center gap-4 md:hidden">
                        <MobileNav />
                        <Link href="/" className="font-bold text-lg flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary fill-current" />
                            JobScout
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center px-3 py-1.5 rounded-full bg-muted/50 border border-border/50 text-xs font-medium text-muted-foreground gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            System Operational
                        </div>
                        <ThemeToggle />
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 shadow-lg shadow-primary/20 ml-2" />
                    </div>
                </header>

                <main className="flex-1 relative">
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none h-96 opacity-50" />
                    {children}
                </main>
            </div>
        </div>
    );
}
