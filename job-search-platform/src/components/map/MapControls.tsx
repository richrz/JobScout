'use client';

import { useState, useMemo } from 'react';
import { JobMap } from '@/components/map/JobMap';
import { Job } from '@prisma/client';
import { Flame, MapPin, Filter, X } from 'lucide-react';

interface MapControlsProps {
    jobs: Job[];
}

interface FilterState {
    minScore: number;
    dateRange: 'all' | 'week' | 'month' | '3months';
    searchQuery: string;
}

export function MapControls({ jobs }: MapControlsProps) {
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        minScore: 0,
        dateRange: 'all',
        searchQuery: '',
    });

    // Filter jobs based on current filters
    const filteredJobs = useMemo(() => {
        let result = [...jobs];

        // Filter by minimum score
        if (filters.minScore > 0) {
            result = result.filter(job =>
                (job.compositeScore || 0) >= filters.minScore / 100
            );
        }

        // Filter by date range
        if (filters.dateRange !== 'all') {
            const now = new Date();
            const daysMap = { week: 7, month: 30, '3months': 90 };
            const days = daysMap[filters.dateRange];
            const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

            result = result.filter(job =>
                job.postedAt && new Date(job.postedAt) >= cutoffDate
            );
        }

        // Filter by search query
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            result = result.filter(job =>
                job.title?.toLowerCase().includes(query) ||
                job.company?.toLowerCase().includes(query) ||
                job.location?.toLowerCase().includes(query)
            );
        }

        return result;
    }, [jobs, filters]);

    return (
        <div className="space-y-4">
            {/* Control Bar */}
            <div className="flex flex-wrap gap-2 items-center justify-between p-4 bg-card rounded-lg border">
                <div className="flex gap-2">
                    {/* Heatmap Toggle */}
                    <button
                        onClick={() => setShowHeatmap(!showHeatmap)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${showHeatmap
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                        aria-pressed={showHeatmap}
                        data-testid="heatmap-toggle"
                    >
                        {showHeatmap ? <Flame className="h-4 w-4" /> : <MapPin className="h-4 w-4" />}
                        {showHeatmap ? 'Heatmap' : 'Markers'}
                    </button>

                    {/* Filter Toggle */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${showFilters
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                            }`}
                        aria-pressed={showFilters}
                        data-testid="filter-toggle"
                    >
                        <Filter className="h-4 w-4" />
                        Filters
                    </button>
                </div>

                <span className="text-sm text-muted-foreground">
                    {filteredJobs.length} of {jobs.length} jobs shown
                </span>
            </div>

            {/* Filter Panel */}
            {showFilters && (
                <div className="p-4 bg-card rounded-lg border space-y-4" data-testid="filter-panel">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Filters</h3>
                        <button
                            onClick={() => setFilters({ minScore: 0, dateRange: 'all', searchQuery: '' })}
                            className="text-xs text-muted-foreground hover:text-foreground"
                        >
                            Reset
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Search</label>
                            <input
                                type="text"
                                value={filters.searchQuery}
                                onChange={(e) => setFilters(f => ({ ...f, searchQuery: e.target.value }))}
                                placeholder="Job title, company..."
                                className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                                data-testid="search-input"
                            />
                        </div>

                        {/* Minimum Score */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Min Score: {filters.minScore}%</label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={filters.minScore}
                                onChange={(e) => setFilters(f => ({ ...f, minScore: parseInt(e.target.value) }))}
                                className="w-full"
                                data-testid="score-slider"
                            />
                        </div>

                        {/* Date Range */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Date Range</label>
                            <select
                                value={filters.dateRange}
                                onChange={(e) => setFilters(f => ({ ...f, dateRange: e.target.value as FilterState['dateRange'] }))}
                                className="w-full px-3 py-2 rounded-md border bg-background text-sm"
                                data-testid="date-select"
                            >
                                <option value="all">All Time</option>
                                <option value="week">Last Week</option>
                                <option value="month">Last Month</option>
                                <option value="3months">Last 3 Months</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Map */}
            <JobMap jobs={filteredJobs} showHeatmap={showHeatmap} />
        </div>
    );
}
