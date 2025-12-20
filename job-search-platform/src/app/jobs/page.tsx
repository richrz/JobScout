import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/jobs/JobCard';
import { JobsFilterSidebar } from '@/components/jobs/JobsFilterSidebar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Server Component
export default async function JobsPage() {
    const jobs = await prisma.job.findMany({
        orderBy: { postedAt: 'desc' },
        take: 50,
    });

    return (
        <div className="min-h-screen w-full">
            {/* Page Header */}
            <div className="px-6 lg:px-8 py-8">
                <div className="max-w-7xl mx-auto">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 mb-6">
                        <Link href="/" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">Home</Link>
                        <span className="text-muted-foreground/50 text-sm">/</span>
                        <span className="text-foreground text-sm font-medium">Jobs</span>
                    </div>

                    {/* Header & Sort */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-foreground">{jobs.length} Jobs Found</h1>
                            <p className="text-muted-foreground mt-1 text-sm">Based on your preferences and saved searches</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                            <select className="appearance-none bg-card border border-border text-foreground text-sm font-medium rounded-xl py-2.5 pl-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent cursor-pointer hover:border-primary transition-colors">
                                <option>Most Relevant</option>
                                <option>Newest First</option>
                                <option>Highest Salary</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar - Now a Client Component */}
                        <JobsFilterSidebar />

                        {/* Job Cards Grid - Using existing JobCard component */}
                        <div className="lg:col-span-3">
                            {jobs.length === 0 ? (
                                <div className="text-center py-20 bg-card rounded-2xl border border-border">
                                    <p className="text-muted-foreground text-lg">No jobs found matching your criteria.</p>
                                    <Button variant="link" className="mt-2 text-primary">Reset Filters</Button>
                                </div>
                            ) : (
                                <>
                                    {/* Job Cards Grid */}
                                    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                                        {jobs.map((job) => (
                                            <JobCard key={job.id} job={job} />
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    <div className="mt-10 flex items-center justify-center">
                                        <nav className="flex items-center gap-2">
                                            <button className="size-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-secondary">
                                                <ChevronLeft className="w-5 h-5" />
                                            </button>
                                            <button className="size-10 flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">1</button>
                                            <button className="size-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-secondary">2</button>
                                            <button className="size-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-secondary">3</button>
                                            <span className="px-2 text-muted-foreground">...</span>
                                            <button className="size-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-secondary">12</button>
                                            <button className="size-10 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:bg-secondary">
                                                <ChevronRight className="w-5 h-5" />
                                            </button>
                                        </nav>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
