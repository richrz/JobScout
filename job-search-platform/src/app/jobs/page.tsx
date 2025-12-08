import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Server Component
export default async function JobsPage() {
    const jobs = await prisma.job.findMany({
        orderBy: { postedAt: 'desc' },
        take: 50,
    });

    return (
        <div className="container mx-auto py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Job Listings</h1>
                    <p className="text-muted-foreground">Found {jobs.length} jobs matching your criteria</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                        🔄 Refresh
                    </Button>
                    <Button size="sm">
                        + Add Job Source
                    </Button>
                </div>
            </div>

            {/* Filter Buttons (Static for now, but UI preserved) */}
            <div className="flex gap-2 mb-6">
                {['All', 'Linkedin', 'Indeed', 'Glassdoor'].map((source) => (
                    <Button
                        key={source}
                        variant={source === 'All' ? 'default' : 'outline'}
                        size="sm"
                    >
                        {source}
                    </Button>
                ))}
            </div>

            {/* Job Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {jobs.map((job) => (
                    <div key={job.id} className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <div>
                                <h3 className="font-semibold text-lg line-clamp-1">{job.title}</h3>
                                <p className="text-muted-foreground">{job.company}</p>
                            </div>
                            <span className="px-2 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary">
                                {Math.round((job.compositeScore || 0) * 100)}%
                            </span>
                        </div>
                        <div className="space-y-2 text-sm text-muted-foreground">
                            <p>📍 {job.location || 'Remote'}</p>
                            <p>💰 {job.salary || 'Salary not listed'}</p>
                            <p className="text-xs">Source: {job.source}</p>
                        </div>
                        <div className="mt-4 flex gap-2">
                            <Button size="sm" variant="outline" asChild>
                                <Link href={`/jobs/${job.id}`}>View Details</Link>
                            </Button>
                            <Button size="sm">Apply</Button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {jobs.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-muted-foreground">No jobs found. Try adjusting your search criteria.</p>
                </div>
            )}
        </div>
    );
}
