'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, List, Settings, MapPin, FileText } from 'lucide-react';
import type { Route } from 'next';

const navItems = [
    { href: '/', label: 'Dashboard', icon: Home },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/map', label: 'Map', icon: MapPin },
    { href: '/pipeline', label: 'Pipeline', icon: List },
    { href: '/resume', label: 'Resume', icon: FileText },
    { href: '/settings', label: 'Settings', icon: Settings },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t md:hidden">
            <div className="flex justify-around items-center h-16">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href as Route}
                            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 min-h-[44px] min-w-[44px] rounded-lg transition-colors ${isActive
                                ? 'text-primary bg-primary/10'
                                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                                }`}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-xs font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
