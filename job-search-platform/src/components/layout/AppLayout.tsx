'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

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
        <div className="min-h-screen bg-background">
            {/* Desktop Header */}
            <header className="hidden md:flex sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
                            <span className="text-2xl">💼</span>
                            <span>JobScout</span>
                        </Link>
                        <nav className="flex gap-1">
                            {navItems.map((item) => {
                                const isActive = pathname === item.href;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        className={cn(
                                            "px-4 py-2 text-sm font-medium rounded-full transition-all hover:bg-accent hover:text-accent-foreground",
                                            isActive 
                                                ? "bg-primary/10 text-primary font-semibold" 
                                                : "text-muted-foreground"
                                        )}
                                    >
                                        {item.label}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-8 pb-20 md:pb-8">
                {children}
            </main>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
}
