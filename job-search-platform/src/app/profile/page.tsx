'use client';

import { AccountSettings } from '@/components/settings/AccountSettings';
import Link from 'next/link';

export default function ProfilePage() {
    return (
        <div className="min-h-screen bg-background">
            {/* Header Bar */}
            <header className="flex items-center justify-between px-6 lg:px-8 py-6 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                        <span className="text-muted-foreground/50">→</span>
                        <span className="text-primary font-medium">Account</span>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">User Profile</h1>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-4xl mx-auto p-6 lg:p-8">
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Account Settings</h2>
                    <p className="text-muted-foreground text-sm">Manage your personal information, security, and subscription.</p>
                </div>
                <AccountSettings />
            </div>
        </div>
    );
}
