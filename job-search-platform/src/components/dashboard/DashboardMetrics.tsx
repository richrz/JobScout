'use client';

import React, { useEffect, useState } from 'react';
import { Briefcase, Send, Calendar, CheckCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export function DashboardMetrics() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/analytics/dashboard');
                const json = await res.json();
                setData(json.metrics);
            } catch (err) {
                console.error("Failed to load metrics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 rounded-2xl bg-card border border-white/5" />
            ))}
        </div>;
    }

    if (!data) return null;

    return (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Metric 1: Jobs Found */}
            <MetricCard
                icon={Briefcase}
                label="Jobs Found"
                value={data.totalJobs}
                subtext={`${data.chronosJobs} from Simulation`}
                trend="+15%"
            />

            {/* Metric 2: Applications Sent */}
            <MetricCard
                icon={Send}
                label="Applications Sent"
                value={data.applied}
                subtext="This week"
                trend="+2%"
            />

            {/* Metric 3: Interviews */}
            <MetricCard
                icon={Calendar}
                label="Interviews"
                value={data.interviews}
                subtext="Pending"
                trend="+0 new"
            />

            {/* Metric 4: Profile Match (Mock for now, but dynamic value from saved jobs) */}
            <div className="p-6 rounded-2xl bg-card shadow-xl flex flex-col justify-between">
                <div className="flex justify-between items-center mb-3">
                    <p className="text-muted-foreground text-sm font-medium">Pipeline Conversion</p>
                    <span className="text-foreground font-bold text-sm">
                        {data.applied > 0 ? Math.round((data.interviews / data.applied) * 100) : 0}%
                    </span>
                </div>
                <div className="h-3 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-1000"
                        style={{ width: `${data.applied > 0 ? Math.min((data.interviews / data.applied) * 100, 100) : 0}%` }}
                    />
                </div>
                <p className="text-muted-foreground text-xs mt-3">Interview Rate</p>
            </div>
        </section>
    );
}

function MetricCard({ icon: Icon, label, value, subtext, trend }: any) {
    return (
        <div className="p-6 rounded-2xl bg-card shadow-xl hover:shadow-2xl hover:bg-card/90 transition-all group relative overflow-hidden">
            <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Icon className="w-16 h-16 text-primary" />
            </div>
            <p className="text-muted-foreground text-sm font-medium mb-2">{label}</p>
            <div className="flex items-end gap-3">
                <h3 className="text-4xl font-bold text-foreground">
                    {value}
                </h3>
            </div>
            <p className="text-muted-foreground/60 text-xs mt-1">{subtext}</p>
        </div>
    );
}
