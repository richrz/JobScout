"use client";

import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
    Cell
} from "recharts";
import { TrendingUp, Activity, DollarSign } from "lucide-react";

const velocityData = [
    { day: "Mon", newJobs: 45, applied: 12 },
    { day: "Tue", newJobs: 52, applied: 15 },
    { day: "Wed", newJobs: 38, applied: 8 },
    { day: "Thu", newJobs: 65, applied: 22 },
    { day: "Fri", newJobs: 48, applied: 18 },
    { day: "Sat", newJobs: 25, applied: 5 },
    { day: "Sun", newJobs: 30, applied: 0 },
];

const salaryData = [
    { range: "$80k", count: 12 },
    { range: "$100k", count: 25 },
    { range: "$120k", count: 45 },
    { range: "$140k", count: 30 },
    { range: "$160k", count: 15 },
    { range: "$180k+", count: 8 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-card border border-border p-3 rounded-xl shadow-xl">
                <p className="text-foreground font-bold mb-1">{label}</p>
                {payload.map((p: any, index: number) => (
                    <p key={index} className="text-sm flex items-center gap-2" style={{ color: p.color }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                        {p.name}: <span className="font-bold">{p.value}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

export function PowerCharts() {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Application Velocity */}
            <div className="bg-card rounded-2xl p-6 shadow-xl border border-border/50">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            Market Velocity
                        </h3>
                        <p className="text-muted-foreground text-sm">New jobs vs. your applications</p>
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={velocityData}>
                            <defs>
                                <linearGradient id="colorNewJobs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorApplied" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#39E079" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#39E079" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                            <XAxis
                                dataKey="day"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                dy={10}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3f3f46', strokeWidth: 1, strokeDasharray: '3 3' }} />
                            <Area
                                type="monotone"
                                dataKey="newJobs"
                                name="New Jobs"
                                stroke="#818cf8"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorNewJobs)"
                            />
                            <Area
                                type="monotone"
                                dataKey="applied"
                                name="You Applied"
                                stroke="#39E079"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorApplied)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Salary Landscape */}
            <div className="bg-card rounded-2xl p-6 shadow-xl border border-border/50">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-emerald-400" />
                            Salary Landscape
                        </h3>
                        <p className="text-muted-foreground text-sm">Distribution of matched roles</p>
                    </div>
                </div>
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={salaryData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                            <XAxis
                                dataKey="range"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#a1a1aa', fontSize: 12 }}
                                dy={10}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#27272a', opacity: 0.4 }} />
                            <Bar dataKey="count" name="Jobs" radius={[6, 6, 0, 0]}>
                                {salaryData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.range === '$120k' ? '#39E079' : '#3f3f46'} // Highlight the sweet spot
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
