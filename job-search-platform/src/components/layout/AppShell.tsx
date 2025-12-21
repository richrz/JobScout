
'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { Sidebar } from './Sidebar';
import { UserMenu } from './UserMenu';
import { PillNav } from './PillNav';
import { Sparkles } from 'lucide-react';

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/login');
    if (isAuthPage) return <>{children}</>;

    return (
        <div className="min-h-screen bg-background text-foreground flex relative overflow-hidden font-sans">
            {/* Desktop Sidebar (visible lg+) */}
            <Sidebar />

            {/* Mobile/Tablet Pill Nav (hidden lg+) */}
            <div className="lg:hidden">
                <PillNav />
            </div>

            {/* Main Content Area */}
            <main className="flex-1 w-full min-h-screen relative z-0 lg:pl-64 transition-all duration-300">
                {/* Mobile Header (Brand only visible on small screens to avoid double brand with sidebar) */}
                <header className="lg:hidden h-16 w-full fixed top-0 z-40 px-6 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-white/5">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center shadow-[0_0_10px_rgba(57,224,121,0.2)]">
                            <Sparkles className="w-4 h-4 text-black fill-current" />
                        </div>
                        <span className="font-bold text-lg tracking-tight">Job<span className="text-primary">Scout</span></span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <UserMenu />
                    </div>
                </header>

                {/* Content Container */}
                <div className="pt-20 lg:pt-8 px-4 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto pb-24 lg:pb-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
