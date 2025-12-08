'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { MobileNav } from './MobileNav';
import { ThemeToggle } from '@/components/theme-toggle';

export function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Don't show layout on auth pages
    const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/login');

    if (isAuthPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-background">
            {/* Desktop Header */}
            <header className="hidden md:flex sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-14 items-center justify-between">
                    <div className="flex items-center gap-6">
                        <h1 className="text-xl font-bold">Job Search Platform</h1>
                        <nav className="flex gap-6">
                            <a href="/" className="text-sm font-medium transition-colors hover:text-primary">
                                Dashboard
                            </a>
                            <a href="/jobs" className="text-sm font-medium transition-colors hover:text-primary">
                                Jobs
                            </a>
                            <a href="/map" className="text-sm font-medium transition-colors hover:text-primary">
                                Map
                            </a>
                            <a href="/pipeline" className="text-sm font-medium transition-colors hover:text-primary">
                                Pipeline
                            </a>
                            <a href="/profile" className="text-sm font-medium transition-colors hover:text-primary">
                                Profile
                            </a>
                            <a href="/settings" className="text-sm font-medium transition-colors hover:text-primary">
                                Settings
                            </a>
                        </nav>
                    </div>
                    <ThemeToggle />
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-6 pb-20 md:pb-6">
                {children}
            </main>

            {/* Mobile Navigation */}
            <MobileNav />
        </div>
    );
}
