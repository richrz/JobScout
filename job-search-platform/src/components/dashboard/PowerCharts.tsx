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
    Cell,
    PieChart,
    Pie,
} from "recharts";
import { TrendingUp, Activity, DollarSign, PieChart as PieChartIcon } from "lucide-react";

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

// Pipeline Health: distribution of application statuses
const pipelineHealthData = [
    { name: "Active", value: 12, color: "#35e375" },      // Electric Green
    { name: "Follow-up", value: 5, color: "#f59e0b" },    // Amber
    { name: "Dormant", value: 8, color: "#6b7280" },      // Gray
    { name: "Archived", value: 15, color: "#3f3f46" },    // Zinc
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
                                    <stop offset="5%" stopColor="#35e375" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#35e375" stopOpacity={0} />
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
                                stroke="#35e375"
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
                                        fill={entry.range === '$120k' ? '#35e375' : '#3f3f46'} // Highlight the sweet spot
                                    />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 3: Pipeline Health */}
            <div className="bg-card rounded-2xl p-6 shadow-xl border border-border/50 lg:col-span-2">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                            <PieChartIcon className="w-5 h-5 text-violet-400" />
                            Pipeline Health
                        </h3>
                        <p className="text-muted-foreground text-sm">Your application status breakdown</p>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-foreground">{pipelineHealthData.reduce((a, b) => a + b.value, 0)}</p>
                        <p className="text-xs text-muted-foreground">Total Applications</p>
                    </div>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="h-[200px] w-[200px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pipelineHealthData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {pipelineHealthData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-card border border-border p-3 rounded-xl shadow-xl">
                                                    <p className="text-foreground font-bold flex items-center gap-2">
                                                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: data.color }} />
                                                        {data.name}: <span className="text-primary">{data.value}</span>
                                                    </p>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap md:flex-col gap-4">
                        {pipelineHealthData.map((entry, index) => (
                            <div key={index} className="flex items-center gap-3">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: entry.color }}
                                />
                                <div>
                                    <p className="text-foreground text-sm font-medium">{entry.name}</p>
                                    <p className="text-muted-foreground text-xs">{entry.value} applications</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
