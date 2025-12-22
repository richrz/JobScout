"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import type { Route } from "next";
import { DashboardMetrics } from "@/components/dashboard/DashboardMetrics";
import {
    Search,
    Briefcase,
    Send,
    Calendar,
    Upload,
    DollarSign,
    Video,
    Target,
    Eye,
    Bell,
    CheckCircle,
    Quote,
    Layers,
} from "lucide-react";


export default function DashboardV2() {
    return (
        <div className="w-full">
            <div className="max-w-[1200px] mx-auto flex flex-col gap-8">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <h2 className="text-foreground text-3xl font-bold tracking-tight">Good Morning, Richard</h2>
                        <p className="text-muted-foreground text-sm mt-1">You have 3 new interview requests pending.</p>
                    </div>
                    <div className="flex-1 max-w-md">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            </div>
                            <Input
                                className="w-full bg-card border-none rounded-xl py-6 pl-12 pr-4 text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary/50 transition-all shadow-lg"
                                placeholder="Search jobs, companies, or keywords..."
                            />
                        </div>
                    </div>
                </header>

                {/* Metrics Row */}
                <DashboardMetrics />

                {/* Content Grid: Main + Side */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">

                    {/* Left Column: Recommended Jobs & Activity */}
                    <div className="lg:col-span-2 flex flex-col gap-8">

                        {/* Recommended Jobs */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-foreground text-lg font-bold">Your Job Inbox</h3>
                                <div className="flex items-center gap-4">
                                    <Link href={"/triage" as Route} className="flex items-center gap-2 text-primary text-sm font-bold bg-primary/10 px-4 py-2 rounded-lg transition-all hover:bg-primary/20 hover:scale-105">
                                        <Layers className="w-4 h-4" />
                                        Start Swiping
                                    </Link>
                                    <Link href={"/jobs" as Route} className="text-muted-foreground text-sm font-medium hover:text-foreground transition-colors">View All</Link>
                                </div>
                            </div>
                            <div className="rounded-2xl overflow-hidden bg-card shadow-xl">

                                {/* Job Item 1 */}
                                <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0">
                                    <div className="h-12 w-12 rounded-xl bg-[#1DB954]/10 flex items-center justify-center shrink-0 text-[#1DB954] font-bold text-lg">S</div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-foreground font-semibold truncate group-hover:text-primary transition-colors">Senior Product Designer</h4>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                            <span>Spotify</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span>Remote</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span className="text-emerald-500 font-medium">$140k - $180k</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <span className="hidden sm:block text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">2h ago</span>
                                        <Button className="bg-primary hover:bg-primary/90 text-black font-bold px-6 py-2 rounded-lg text-sm w-full sm:w-auto shadow-[0_0_15px_rgba(127,217,98,0.3)]">Apply</Button>
                                    </div>
                                </div>

                                {/* Job Item 2 */}
                                <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0">
                                    <div className="h-12 w-12 rounded-xl bg-[#FF5A5F]/10 flex items-center justify-center shrink-0 text-[#FF5A5F] font-bold text-lg">A</div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-foreground font-semibold truncate group-hover:text-primary transition-colors">UX Researcher</h4>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                            <span>Airbnb</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span>San Francisco, CA</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span className="text-emerald-500 font-medium">$130k - $160k</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <span className="hidden sm:block text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">5h ago</span>
                                        <Button variant="outline" className="bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground font-medium px-6 py-2 rounded-lg text-sm border-white/10 w-full sm:w-auto">Save</Button>
                                    </div>
                                </div>

                                {/* Job Item 3 */}
                                <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 hover:bg-white/5 transition-colors cursor-pointer border-b border-white/5 last:border-0">
                                    <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0 text-white font-bold text-lg">N</div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-foreground font-semibold truncate group-hover:text-primary transition-colors">Frontend Engineer</h4>
                                        <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                                            <span>Notion</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span>New York, NY</span>
                                            <span className="w-1 h-1 bg-white/20 rounded-full" />
                                            <span className="text-emerald-500 font-medium">$150k - $190k</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <span className="hidden sm:block text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">1d ago</span>
                                        <Button variant="outline" className="bg-transparent hover:bg-white/5 text-muted-foreground hover:text-foreground font-medium px-6 py-2 rounded-lg text-sm border-white/10 w-full sm:w-auto">Save</Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Stream */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-foreground text-lg font-bold px-1">Activity Stream</h3>
                            <div className="rounded-2xl p-6 bg-card shadow-xl">
                                <div className="relative pl-6 border-l border-white/5 space-y-8">

                                    {/* Timeline Item 1 */}
                                    <div className="relative">
                                        <div className="absolute -left-[31px] bg-card p-1">
                                            <div className="bg-blue-500/10 text-blue-400 rounded-full p-1 h-8 w-8 flex items-center justify-center ring-2 ring-card">
                                                <Eye className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-foreground text-sm"><span className="font-bold">Google</span> viewed your resume</p>
                                            <span className="text-muted-foreground text-xs">2 hours ago</span>
                                        </div>
                                    </div>

                                    {/* Timeline Item 2 */}
                                    <div className="relative">
                                        <div className="absolute -left-[31px] bg-card p-1">
                                            <div className="bg-primary/10 text-primary rounded-full p-1 h-8 w-8 flex items-center justify-center ring-2 ring-card">
                                                <Bell className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-foreground text-sm">New match: <span className="font-bold">Lead Designer at Linear</span></p>
                                            <span className="text-muted-foreground text-xs">4 hours ago</span>
                                        </div>
                                    </div>

                                    {/* Timeline Item 3 */}
                                    <div className="relative">
                                        <div className="absolute -left-[31px] bg-card p-1">
                                            <div className="bg-purple-500/10 text-purple-400 rounded-full p-1 h-8 w-8 flex items-center justify-center ring-2 ring-card">
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-foreground text-sm">Application sent to <span className="font-bold">Figma</span></p>
                                            <span className="text-muted-foreground text-xs">Yesterday</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quick Actions & Widgets */}
                    <div className="flex flex-col gap-6">

                        {/* Quick Actions */}
                        <div className="rounded-2xl p-6 bg-card shadow-xl">
                            <h3 className="text-foreground text-base font-bold mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex flex-col items-center justify-center gap-3 bg-secondary/50 hover:bg-secondary p-4 rounded-xl transition-colors group">
                                    <Upload className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                    <span className="text-foreground text-xs font-medium text-center">Update Resume</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-3 bg-secondary/50 hover:bg-secondary p-4 rounded-xl transition-colors group">
                                    <DollarSign className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                    <span className="text-foreground text-xs font-medium text-center">Find Salaries</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-3 bg-secondary/50 hover:bg-secondary p-4 rounded-xl transition-colors group">
                                    <Video className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                    <span className="text-foreground text-xs font-medium text-center">Practice Interview</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-3 bg-secondary/50 hover:bg-secondary p-4 rounded-xl transition-colors group">
                                    <Target className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                    <span className="text-foreground text-xs font-medium text-center">Track App</span>
                                </button>
                            </div>
                        </div>

                        {/* Upcoming Interview */}
                        <div className="rounded-2xl p-6 relative overflow-hidden bg-card shadow-xl group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Calendar className="w-20 h-20 text-foreground" />
                            </div>
                            <h3 className="text-foreground text-base font-bold mb-1 relative z-10">Upcoming Interview</h3>
                            <p className="text-muted-foreground text-xs mb-4 relative z-10">Don&apos;t be late!</p>

                            <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-4 border border-white/5 relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-indigo-500/20 text-indigo-400 rounded-md p-1 h-8 w-8 flex items-center justify-center font-bold text-sm">S</div>
                                    <span className="text-xs bg-primary/10 px-2 py-0.5 rounded text-primary font-bold">Tomorrow</span>
                                </div>
                                <h4 className="text-foreground font-bold text-sm">Product Designer Role</h4>
                                <p className="text-muted-foreground text-xs mt-1">with Sarah Connors (Head of Design)</p>
                                <div className="mt-3 flex items-center gap-2 text-muted-foreground text-xs">
                                    <Calendar className="w-4 h-4" />
                                    <span>10:00 AM - 11:00 AM</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full mt-4 bg-background/50 hover:bg-background text-foreground text-xs font-bold py-2.5 rounded-lg border-white/5 relative z-10"
                            >
                                View Preparation Kit
                            </Button>
                        </div>

                        {/* Motivational Quote */}
                        <div className="rounded-2xl p-6 flex flex-col items-center text-center bg-card shadow-xl">
                            <Quote className="w-6 h-6 text-primary mb-2" />
                            <p className="text-foreground text-sm italic mb-2">&quot;Opportunities don&apos;t happen, you create them.&quot;</p>
                            <p className="text-muted-foreground text-xs uppercase tracking-widest">- Chris Grosser</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
