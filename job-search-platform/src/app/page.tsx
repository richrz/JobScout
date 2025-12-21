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

// Stitch Design Colors
const colors = {
    primary: "#39E079",
    bgDark: "#122017",
    surfaceDark: "#1c2e24",
    surfaceHover: "#263c30",
    textSecondary: "rgba(255,255,255,0.5)",
    border: "rgba(255,255,255,0.05)",
};

export default function DashboardV2() {
    return (
        <div className="min-h-screen w-full p-6 lg:p-8" style={{ backgroundColor: colors.bgDark }}>
            <div className="max-w-[1200px] mx-auto flex flex-col gap-6">

                {/* Header */}
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <h2 className="text-white text-3xl font-bold tracking-tight">Good Morning, Richard</h2>
                        <p className="text-white/50 text-sm mt-1">You have 3 new interview requests pending.</p>
                    </div>
                    <div className="flex-1 max-w-md">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <Search className="w-5 h-5 text-white/40 group-focus-within:text-[#39E079] transition-colors" />
                            </div>
                            <Input
                                className="w-full bg-[#1c2e24] border-none rounded-full py-6 pl-12 pr-4 text-white placeholder-white/30 focus:ring-2 focus:ring-[#39E079]/50 transition-all shadow-lg shadow-black/20"
                                placeholder="Search jobs, companies, or keywords..."
                            />
                        </div>
                    </div>
                </header>

                {/* Metrics Row */}
                <DashboardMetrics />

                {/* Content Grid: Main + Side */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-6">

                    {/* Left Column: Recommended Jobs & Activity */}
                    <div className="lg:col-span-2 flex flex-col gap-6">

                        {/* Recommended Jobs */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between px-1">
                                <h3 className="text-white text-lg font-bold">Your Job Inbox</h3>
                                <div className="flex items-center gap-4">
                                    <Link href={"/triage" as Route} className="flex items-center gap-2 text-[#39E079] text-sm font-bold hover:underline bg-[#39E079]/10 px-3 py-1.5 rounded-full transition-colors hover:bg-[#39E079]/20">
                                        <Layers className="w-4 h-4" />
                                        Start Swiping
                                    </Link>
                                    <Link href={"/jobs" as Route} className="text-white/40 text-sm font-medium hover:text-white transition-colors">View All</Link>
                                </div>
                            </div>
                            <div className="rounded-xl border p-1" style={{ backgroundColor: colors.surfaceDark, borderColor: colors.border }}>

                                {/* Job Item 1 */}
                                <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-b border-white/5">
                                    <div className="h-12 w-12 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0 text-white font-bold text-lg">S</div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-semibold truncate group-hover:text-[#39E079] transition-colors">Senior Product Designer</h4>
                                        <div className="flex items-center gap-2 text-white/50 text-sm mt-0.5">
                                            <span>Spotify</span>
                                            <span className="w-1 h-1 bg-white/30 rounded-full" />
                                            <span>Remote</span>
                                            <span className="w-1 h-1 bg-white/30 rounded-full" />
                                            <span className="text-emerald-400 font-medium">$140k - $180k</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <span className="hidden sm:block text-xs text-white/40 bg-white/5 px-2 py-1 rounded">2h ago</span>
                                        <Button className="bg-[#39E079] hover:bg-[#2bcf6d] text-[#122017] font-bold px-5 py-2 rounded-full text-sm w-full sm:w-auto">Apply</Button>
                                    </div>
                                </div>

                                {/* Job Item 2 */}
                                <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-white/5 rounded-lg transition-colors cursor-pointer border-b border-white/5">
                                    <div className="h-12 w-12 rounded-full bg-[#FF5A5F] flex items-center justify-center shrink-0 text-white font-bold text-lg">A</div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-semibold truncate group-hover:text-[#39E079] transition-colors">UX Researcher</h4>
                                        <div className="flex items-center gap-2 text-white/50 text-sm mt-0.5">
                                            <span>Airbnb</span>
                                            <span className="w-1 h-1 bg-white/30 rounded-full" />
                                            <span>San Francisco, CA</span>
                                            <span className="w-1 h-1 bg-white/30 rounded-full" />
                                            <span className="text-emerald-400 font-medium">$130k - $160k</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <span className="hidden sm:block text-xs text-white/40 bg-white/5 px-2 py-1 rounded">5h ago</span>
                                        <Button variant="outline" className="bg-[#263c30] hover:bg-white/20 text-white font-medium px-5 py-2 rounded-full text-sm border-white/10 w-full sm:w-auto">Save</Button>
                                    </div>
                                </div>

                                {/* Job Item 3 */}
                                <div className="group flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 hover:bg-white/5 rounded-lg transition-colors cursor-pointer">
                                    <div className="h-12 w-12 rounded-full bg-black flex items-center justify-center shrink-0 text-white font-bold text-lg border border-white/20">N</div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-white font-semibold truncate group-hover:text-[#39E079] transition-colors">Frontend Engineer</h4>
                                        <div className="flex items-center gap-2 text-white/50 text-sm mt-0.5">
                                            <span>Notion</span>
                                            <span className="w-1 h-1 bg-white/30 rounded-full" />
                                            <span>New York, NY</span>
                                            <span className="w-1 h-1 bg-white/30 rounded-full" />
                                            <span className="text-emerald-400 font-medium">$150k - $190k</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                                        <span className="hidden sm:block text-xs text-white/40 bg-white/5 px-2 py-1 rounded">1d ago</span>
                                        <Button variant="outline" className="bg-[#263c30] hover:bg-white/20 text-white font-medium px-5 py-2 rounded-full text-sm border-white/10 w-full sm:w-auto">Save</Button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Activity Stream */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-white text-lg font-bold px-1">Activity Stream</h3>
                            <div className="rounded-xl border p-6" style={{ backgroundColor: colors.surfaceDark, borderColor: colors.border }}>
                                <div className="relative pl-6 border-l border-white/10 space-y-8">

                                    {/* Timeline Item 1 */}
                                    <div className="relative">
                                        <div className="absolute -left-[31px] bg-[#1c2e24] p-1">
                                            <div className="bg-blue-500/20 text-blue-400 rounded-full p-1 h-8 w-8 flex items-center justify-center border border-blue-500/30">
                                                <Eye className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white text-sm"><span className="font-bold">Google</span> viewed your resume</p>
                                            <span className="text-white/40 text-xs">2 hours ago</span>
                                        </div>
                                    </div>

                                    {/* Timeline Item 2 */}
                                    <div className="relative">
                                        <div className="absolute -left-[31px] bg-[#1c2e24] p-1">
                                            <div className="bg-[#39E079]/20 text-[#39E079] rounded-full p-1 h-8 w-8 flex items-center justify-center border border-[#39E079]/30">
                                                <Bell className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white text-sm">New match: <span className="font-bold">Lead Designer at Linear</span></p>
                                            <span className="text-white/40 text-xs">4 hours ago</span>
                                        </div>
                                    </div>

                                    {/* Timeline Item 3 */}
                                    <div className="relative">
                                        <div className="absolute -left-[31px] bg-[#1c2e24] p-1">
                                            <div className="bg-purple-500/20 text-purple-400 rounded-full p-1 h-8 w-8 flex items-center justify-center border border-purple-500/30">
                                                <CheckCircle className="w-4 h-4" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white text-sm">Application sent to <span className="font-bold">Figma</span></p>
                                            <span className="text-white/40 text-xs">Yesterday</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Quick Actions & Widgets */}
                    <div className="flex flex-col gap-6">

                        {/* Quick Actions */}
                        <div className="rounded-xl border p-6" style={{ backgroundColor: colors.surfaceDark, borderColor: colors.border }}>
                            <h3 className="text-white text-base font-bold mb-4">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <button className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors group border border-transparent hover:border-[#39E079]/20">
                                    <Upload className="w-5 h-5 text-[#39E079] group-hover:scale-110 transition-transform" />
                                    <span className="text-white text-xs font-medium text-center">Update Resume</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors group border border-transparent hover:border-[#39E079]/20">
                                    <DollarSign className="w-5 h-5 text-[#39E079] group-hover:scale-110 transition-transform" />
                                    <span className="text-white text-xs font-medium text-center">Find Salaries</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors group border border-transparent hover:border-[#39E079]/20">
                                    <Video className="w-5 h-5 text-[#39E079] group-hover:scale-110 transition-transform" />
                                    <span className="text-white text-xs font-medium text-center">Practice Interview</span>
                                </button>
                                <button className="flex flex-col items-center justify-center gap-2 bg-white/5 hover:bg-white/10 p-4 rounded-xl transition-colors group border border-transparent hover:border-[#39E079]/20">
                                    <Target className="w-5 h-5 text-[#39E079] group-hover:scale-110 transition-transform" />
                                    <span className="text-white text-xs font-medium text-center">Track App</span>
                                </button>
                            </div>
                        </div>

                        {/* Upcoming Interview */}
                        <div
                            className="rounded-xl border p-6 relative overflow-hidden"
                            style={{
                                backgroundColor: colors.surfaceDark,
                                borderColor: colors.border,
                                background: `linear-gradient(to bottom, ${colors.surfaceDark}, #16251e)`
                            }}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-5">
                                <Calendar className="w-20 h-20 text-white" />
                            </div>
                            <h3 className="text-white text-base font-bold mb-1 relative z-10">Upcoming Interview</h3>
                            <p className="text-white/40 text-xs mb-4 relative z-10">Don&apos;t be late!</p>

                            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 relative z-10">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="bg-[#6772E5] rounded-md p-1 h-8 w-8 flex items-center justify-center text-white font-bold text-sm">S</div>
                                    <span className="text-xs bg-[#39E079]/20 px-2 py-0.5 rounded text-[#39E079] font-bold">Tomorrow</span>
                                </div>
                                <h4 className="text-white font-bold text-sm">Product Designer Role</h4>
                                <p className="text-white/60 text-xs mt-1">with Sarah Connors (Head of Design)</p>
                                <div className="mt-3 flex items-center gap-2 text-white/40 text-xs">
                                    <Calendar className="w-4 h-4" />
                                    <span>10:00 AM - 11:00 AM</span>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white text-xs font-bold py-2.5 rounded-full border-white/10 relative z-10"
                            >
                                View Preparation Kit
                            </Button>
                        </div>

                        {/* Motivational Quote */}
                        <div
                            className="rounded-xl border p-6 flex flex-col items-center text-center"
                            style={{ backgroundColor: colors.surfaceDark, borderColor: colors.border }}
                        >
                            <Quote className="w-6 h-6 text-[#39E079] mb-2" />
                            <p className="text-white text-sm italic mb-2">&quot;Opportunities don&apos;t happen, you create them.&quot;</p>
                            <p className="text-white/30 text-xs uppercase tracking-widest">- Chris Grosser</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
