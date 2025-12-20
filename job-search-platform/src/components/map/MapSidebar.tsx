'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';
import Link from 'next/link';
import { Job } from '@prisma/client';

interface MapSidebarProps {
    jobs: Job[];
}

export function MapSidebar({ jobs }: MapSidebarProps) {
    const [salaryRange, setSalaryRange] = useState([40, 200]); // $40k - $200k
    const [activeFilters, setActiveFilters] = useState(['Full-time']);

    const toggleFilter = (filter: string) => {
        setActiveFilters(prev =>
            prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    const formatSalary = (value: number) => {
        if (value >= 300) return '$300k+';
        return `$${value}k`;
    };

    return (
        <aside className="w-[380px] flex flex-col border-r border-border bg-background z-10 shrink-0 shadow-xl overflow-hidden hidden md:flex">
            {/* Filters Header */}
            <div className="p-5 border-b border-border">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-foreground tracking-tight text-xl font-bold">Filters</h3>
                    <button
                        onClick={() => {
                            setSalaryRange([40, 200]);
                            setActiveFilters(['Full-time']);
                        }}
                        className="text-muted-foreground text-sm hover:text-primary transition-colors"
                    >
                        Reset all
                    </button>
                </div>

                {/* Salary Range Slider */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-muted-foreground text-xs uppercase font-semibold tracking-wider">Salary Range</p>
                        <span className="text-foreground text-sm font-medium">
                            {formatSalary(salaryRange[0])} - {formatSalary(salaryRange[1])}
                        </span>
                    </div>
                    <Slider
                        defaultValue={salaryRange}
                        min={40}
                        max={300}
                        step={10}
                        onValueChange={(value) => setSalaryRange(value)}
                        className="w-full"
                    />
                    <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                        <span>$40k</span>
                        <span>$300k+</span>
                    </div>
                </div>

                {/* Chips for Job Type */}
                <div className="flex flex-wrap gap-2">
                    {['Full-time', 'Contract', 'Remote', 'Senior'].map((filter) => (
                        <button
                            key={filter}
                            onClick={() => toggleFilter(filter)}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${activeFilters.includes(filter)
                                    ? 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30'
                                    : 'bg-secondary text-muted-foreground border border-transparent hover:bg-secondary/80 hover:text-foreground'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </div>

            {/* Job List Results */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <div className="px-1 pb-2 text-sm text-muted-foreground">Showing {jobs.length} jobs on map</div>

                {jobs.slice(0, 10).map((job) => (
                    <Link
                        key={job.id}
                        href={`/jobs/${job.id}`}
                        className="block p-4 bg-card rounded-2xl border border-border hover:border-primary/50 transition-all cursor-pointer group shadow-sm hover:shadow-lg"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                                <div className="bg-primary/10 text-primary p-2 rounded-lg size-10 flex items-center justify-center shrink-0 font-bold">
                                    {job.company?.charAt(0) || 'J'}
                                </div>
                                <div>
                                    <h4 className="text-foreground font-bold text-base group-hover:text-primary transition-colors line-clamp-1">{job.title}</h4>
                                    <p className="text-muted-foreground text-xs font-medium">{job.company}</p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 mt-3 flex-wrap">
                            {job.location && (
                                <span className="bg-secondary text-muted-foreground px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wide">{job.location}</span>
                            )}
                            {job.salary && (
                                <span className="bg-secondary text-muted-foreground px-2 py-1 rounded text-[10px] font-medium uppercase tracking-wide">{job.salary}</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </aside>
    );
}
