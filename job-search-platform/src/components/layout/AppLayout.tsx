'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { BackgroundMesh } from '@/components/ui/background-mesh';
import { motion } from 'framer-motion';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Don't show layout on auth pages
    const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/login');

    if (isAuthPage) {
        return <>{children}</>;
    }

    const navItems = [
        { href: '/', label: 'Dashboard' },
        { href: '/jobs', label: 'Jobs' },
        { href: '/map', label: 'Map' },
        { href: '/pipeline', label: 'Pipeline' },
        { href: '/profile', label: 'Profile' },
        { href: '/resume', label: 'Resume' },
        { href: '/settings', label: 'Settings' },
    ];

    return (
        <div className="min-h-screen relative">
            <BackgroundMesh />

            {/* Desktop Header - Full Width Sticky Glass */}
            <header className="hidden md:flex fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl transition-all duration-300">
                <div className="container mx-auto max-w-7xl h-20 flex items-center justify-between px-6">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 shrink-0 animate-[spin_0.6s_ease-out] group-hover:animate-[spin_0.5s_ease-in-out]">
                            <Image
                                src="/images/logo-light.svg"
                                alt="JobScout Logo"
                                fill
                                className="object-contain dark:hidden"
                                priority
                            />
                            <Image
                                src="/images/logo-dark.svg"
                                alt="JobScout Logo"
                                fill
                                className="object-contain hidden dark:block"
                                priority
                            />
                        </div>
                        <span className="text-2xl tracking-tight">
                            <span className="font-extrabold text-primary">Job</span><span className="font-semibold text-foreground">Scout</span>
                        </span>
                    </Link>

                    {/* Navigation */}
                    <nav className="flex items-center gap-1 bg-white/5 p-1.5 rounded-full border border-white/5">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "relative px-5 py-2 text-sm font-medium rounded-full transition-all duration-300",
                                        isActive
                                            ? "text-primary dark:text-white"
                                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                                    )}
                                >
                                    {isActive && (
                                        <motion.div
                                            layoutId="nav-bg"
                                            className="absolute inset-0 bg-white shadow-sm dark:bg-primary/20 rounded-full border border-black/5 dark:border-primary/20"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                    <span className="relative z-10">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container pt-28 pb-20 md:pb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {children}
            </main>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
}
