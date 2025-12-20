'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { User, LogOut, Settings, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function UserMenu() {
    const { data: session, status } = useSession();

    if (status === 'loading') {
        return (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        );
    }

    if (!session) {
        return (
            <Button asChild size="sm" variant="outline" className="gap-2">
                <Link href="/auth/signin">
                    <LogIn className="w-4 h-4" />
                    Sign In
                </Link>
            </Button>
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-purple-500 shadow-lg shadow-primary/20 flex items-center justify-center text-xs font-bold text-black">
                        {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                    </div>
                    <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-foreground">{session.user?.name || 'User'}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">{session.user?.email}</p>
                    </div>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-card border-border">
                <DropdownMenuLabel>
                    <div className="flex flex-col">
                        <span>{session.user?.name || 'User'}</span>
                        <span className="text-xs font-normal text-muted-foreground">{session.user?.email}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                        <User className="mr-2 h-4 w-4" />
                        Profile
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings" className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                    className="text-red-400 focus:text-red-300 cursor-pointer"
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
