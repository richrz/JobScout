'use client';

import { useState } from 'react';
import { Slider } from '@/components/ui/slider';

export function JobsFilterSidebar() {
    const [salaryRange, setSalaryRange] = useState([80, 180]); // $80k - $180k
    const [jobTypes, setJobTypes] = useState(['Full-time']);
    const [locations, setLocations] = useState(['Remote']);
    const [experience, setExperience] = useState(['Senior Level']);

    const formatSalary = (value: number) => {
        if (value >= 300) return '$300k+';
        return `$${value}k`;
    };

    const toggleJobType = (type: string) => {
        setJobTypes(prev =>
            prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
        );
    };

    const toggleExperience = (exp: string) => {
        setExperience(prev =>
            prev.includes(exp) ? prev.filter(e => e !== exp) : [...prev, exp]
        );
    };

    const setActiveLocation = (loc: string) => {
        setLocations([loc]);
    };

    const clearAll = () => {
        setSalaryRange([80, 180]);
        setJobTypes(['Full-time']);
        setLocations(['Remote']);
        setExperience(['Senior Level']);
    };

    return (
        <aside className="lg:col-span-1 space-y-6">
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
                <h3 className="font-bold text-lg">Filters</h3>
                <button
                    onClick={clearAll}
                    className="text-sm text-primary font-medium hover:underline"
                >
                    Clear all
                </button>
            </div>

            {/* Job Type */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Job Type</h4>
                <div className="space-y-2">
                    {['Full-time', 'Contract', 'Part-time'].map(type => (
                        <label key={type} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={jobTypes.includes(type)}
                                onChange={() => toggleJobType(type)}
                                className="peer appearance-none size-5 rounded border border-border bg-card checked:bg-primary checked:border-primary transition-all"
                            />
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Location */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Location</h4>
                <div className="flex flex-wrap gap-2">
                    {['Remote', 'On-site', 'Hybrid'].map(loc => (
                        <button
                            key={loc}
                            onClick={() => setActiveLocation(loc)}
                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${locations.includes(loc)
                                    ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
                                    : 'bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary'
                                }`}
                        >
                            {loc}
                        </button>
                    ))}
                </div>
            </div>

            {/* Salary Range */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Salary Range</h4>
                    <span className="text-sm text-foreground font-medium">
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
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>$40k</span>
                    <span>$300k+</span>
                </div>
            </div>

            {/* Experience Level */}
            <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Experience</h4>
                <div className="space-y-2">
                    {['Entry Level', 'Mid Level', 'Senior Level'].map(exp => (
                        <label key={exp} className="flex items-center gap-3 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={experience.includes(exp)}
                                onChange={() => toggleExperience(exp)}
                                className="peer appearance-none size-5 rounded border border-border bg-card checked:bg-primary checked:border-primary transition-all"
                            />
                            <span className="text-muted-foreground group-hover:text-foreground transition-colors">{exp}</span>
                        </label>
                    ))}
                </div>
            </div>
        </aside>
    );
}
