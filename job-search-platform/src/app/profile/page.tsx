'use client';

import { ProfileBuilder } from '@/components/profile/ProfileBuilder';
import Link from 'next/link';

export default function ProfilePage() {
    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            {/* Header Bar */}
            <header className="flex items-center justify-between px-6 lg:px-8 py-4 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                        <span className="text-muted-foreground/50">→</span>
                        <span className="text-primary font-medium">Edit Profile</span>
                    </div>
                    <h1 className="text-xl font-bold text-foreground tracking-tight">Master Profile</h1>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <ProfileBuilder />
            </div>
        </div>
    );
}
