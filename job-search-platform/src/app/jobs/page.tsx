
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/jobs/JobCard';
import { ShellCard } from '@/components/layout/ShellCard';
import { Page } from '@/components/layout/Page';
import { Section } from '@/components/layout/Section';
import { Filter, RefreshCw, Plus } from 'lucide-react';

// Server Component
export default async function JobsPage() {
    const jobs = await prisma.job.findMany({
        orderBy: { postedAt: 'desc' },
        take: 50,
    });

    return (
        <Page>
            {/* Header Area */}
            <Section
                title="Job Listings"
                description={`Discovered ${jobs.length} opportunities tailored for you.`}
                action={
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </Button>
                        <Button className="gap-2 shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4" /> Add Source
                        </Button>
                    </div>
                }
            >
                {/* Filters Bar */}
                <ShellCard className="p-2 flex-row gap-2 overflow-x-auto items-center no-scrollbar min-h-0" variant="default">
                    <Button variant="ghost" size="sm" className="text-muted-foreground shrink-0">
                        <Filter className="w-4 h-4 mr-2" /> Filters:
                    </Button>
                    {['All', 'LinkedIn', 'Indeed', 'Glassdoor', 'Remote', 'High Pay'].map((filter) => (
                        <Button
                            key={filter}
                            variant={filter === 'All' ? 'secondary' : 'ghost'}
                            size="sm"
                            className="rounded-lg shrink-0"
                        >
                            {filter}
                        </Button>
                    ))}
                </ShellCard>

                {/* Job Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>

                {/* Empty state */}
                {jobs.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-muted-foreground text-lg">No jobs found matching your criteria.</p>
                        <Button variant="link" className="mt-2">Reset Filters</Button>
                    </div>
                )}
            </Section>
        </Page>
    );
}
