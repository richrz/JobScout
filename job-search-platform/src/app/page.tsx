'use client';

import Link from 'next/link';
import AuthStatus from '@/components/auth-status';
import { Button } from '@/components/ui/button';
import { TrendChart } from '@/components/charts/TrendChart';
import { AnimatedStat } from '@/components/ui/animated-stat';
import { motion } from 'framer-motion';
import { Briefcase, FileText, CheckCircle, Star, ArrowRight, Clock, Search, List } from 'lucide-react';
import type { Route } from 'next';
import { Page } from '@/components/layout/Page';
import { Section } from '@/components/layout/Section';
import { ShellCard } from '@/components/layout/ShellCard';

const stats = [
    {
        label: 'Jobs Found',
        value: 127,
        prefix: "",
        suffix: "",
        change: '+12 today',
        color: 'text-[hsl(var(--chart-1))]',
        glow: 'hsla(var(--chart-1), 0.5)',
        icon: Briefcase
    },
    {
        label: 'Applications',
        value: 23,
        prefix: "",
        suffix: "",
        change: '5 pending',
        color: 'text-[hsl(var(--chart-2))]',
        glow: 'hsla(var(--chart-2), 0.5)',
        icon: FileText
    },
    {
        label: 'Interviews',
        value: 4,
        prefix: "",
        suffix: "",
        change: '2 this week',
        color: 'text-[hsl(var(--chart-3))]',
        glow: 'hsla(var(--chart-3), 0.5)',
        icon: Clock
    },
    {
        label: 'Match Score',
        value: 87,
        prefix: "",
        suffix: "%",
        change: 'High Fit',
        color: 'text-[hsl(var(--chart-4))]',
        glow: 'hsla(var(--chart-4), 0.5)',
        icon: Star
    },
];

const recentActivity = [
    { type: 'application', title: 'Applied to Senior Engineer at TechCorp', time: '2h ago', icon: FileText, color: 'text-blue-400' },
    { type: 'match', title: 'New match: Full Stack Dev at StartupXYZ', time: '4h ago', icon: Star, color: 'text-yellow-400' },
    { type: 'interview', title: 'Interview scheduled with CloudStack', time: '1d ago', icon: CheckCircle, color: 'text-green-400' },
    { type: 'update', title: 'Resume updated with new skills', time: '2d ago', icon: FileText, color: 'text-purple-400' },
];

export default function Home() {
    return (
        <Page>
            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between pb-4">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-title-page mb-2 leading-tight">
                        Hello, <span className="text-gradient-primary">Richard</span>
                    </h1>
                    <p className="text-body text-muted-foreground">Your command center is ready.</p>
                </motion.div>
                <AuthStatus />
            </div>

            {/* Stats Grid */}
            <Section>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <ShellCard
                                key={stat.label}
                                glowColor={stat.glow}
                                className="min-h-[180px]"
                            >
                                <div className="flex flex-col justify-between h-full space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className={`p-3 rounded-xl bg-white/5 border border-white/5 ${stat.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/5 text-muted-foreground border border-white/5">
                                            {stat.change}
                                        </span>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-body-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                        <div className={`text-5xl font-bold tracking-tighter ${stat.color} leading-normal pb-1`}>
                                            <AnimatedStat value={stat.value} prefix={stat.prefix} suffix={stat.suffix} delay={index * 0.1} />
                                        </div>
                                    </div>
                                </div>
                            </ShellCard>
                        );
                    })}
                </div>
            </Section>

            {/* Trend Chart */}
            <Section title="Application Trends">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="h-[400px]"
                >
                    <TrendChart />
                </motion.div>
            </Section>

            <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-7">
                {/* Main Feed / Recent Activity */}
                <div className="md:col-span-2 lg:col-span-4">
                    <ShellCard
                        title={
                            <div className="flex items-center gap-3">
                                <Clock className="w-5 h-5 text-primary" />
                                Recent Activity
                            </div>
                        }
                        action={
                            <Button variant="ghost" size="sm" className="text-tiny text-muted-foreground hover:text-primary">View All</Button>
                        }
                        className="min-h-[400px]"
                    >
                        <div className="space-y-2">
                            {recentActivity.map((activity, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 + (i * 0.1) }}
                                    className="group flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5 cursor-pointer"
                                >
                                    <div className={`p-3 rounded-full bg-slate-900/50 border border-white/10 ${activity.color}`}>
                                        <activity.icon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-body-sm font-medium group-hover:text-primary transition-colors">{activity.title}</p>
                                        <p className="text-tiny text-muted-foreground">{activity.time}</p>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                                </motion.div>
                            ))}
                        </div>
                    </ShellCard>
                </div>

                {/* Quick Actions & Promo */}
                <div className="md:col-span-1 lg:col-span-3 space-y-6 flex flex-col">
                    <ShellCard
                        className="flex-1 text-center relative overflow-hidden group justify-center"
                        glowColor="hsla(var(--primary), 0.4)"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative z-10 space-y-6 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg mb-2">
                                <Search className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h3 className="text-title-section text-2xl font-bold">Find Your Next Role</h3>
                                <p className="text-body-sm text-muted-foreground max-w-[220px] mx-auto mt-2 leading-relaxed">
                                    AI-powered matching is active. 12 new roles match your profile.
                                </p>
                            </div>
                            <Link href={"/jobs" as Route}>
                                <Button className="rounded-full px-8 py-6 text-body shadow-lg shadow-primary/25 hover:shadow-primary/50 transition-all">
                                    Browse Jobs
                                </Button>
                            </Link>
                        </div>
                    </ShellCard>

                    <div className="grid grid-cols-2 gap-4">
                        <Link href={"/pipeline" as Route} className="contents">
                            <ShellCard variant="interactive" className="flex flex-col items-center justify-center gap-2 text-center h-[120px]">
                                <List className="w-6 h-6 text-cyan-400" />
                                <span className="text-body-sm font-medium">Pipeline</span>
                            </ShellCard>
                        </Link>
                        <Link href={"/resume" as Route} className="contents">
                            <ShellCard variant="interactive" className="flex flex-col items-center justify-center gap-2 text-center h-[120px]">
                                <FileText className="w-6 h-6 text-emerald-400" />
                                <span className="text-body-sm font-medium">Resume</span>
                            </ShellCard>
                        </Link>
                    </div>
                </div>
            </div>
        </Page>
    );
}