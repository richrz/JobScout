import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { JobCard } from '@/components/jobs/JobCard';
import { JobsFilterSidebar } from '@/components/jobs/JobsFilterSidebar';
import { ChevronLeft, ChevronRight, Briefcase } from 'lucide-react';
import Link from 'next/link';

// Server Component
interface JobsPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

export default async function JobsPage({ searchParams }: JobsPageProps) {
    const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
    const limit = 12; // Matches grid layout
    const offset = (page - 1) * limit;
    const query = typeof searchParams.q === 'string' ? searchParams.q : undefined;

    const where: any = {};
    if (query) {
        where.OR = [
            { title: { contains: query, mode: 'insensitive' } },
            { company: { contains: query, mode: 'insensitive' } },
        ];
    }

    const [jobs, totalCount] = await Promise.all([
        prisma.job.findMany({
            where,
            orderBy: { postedAt: 'desc' },
            take: limit,
            skip: offset,
        }),
        prisma.job.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return (
        <div className="w-full">
            {/* Page Header */}
            <div className="px-6 lg:px-8 py-8">
                <div className="max-w-[1600px] mx-auto">
                    {/* Breadcrumbs */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        <Link href="/" className="text-muted-foreground text-sm font-medium hover:text-primary transition-colors">Home</Link>
                        <span className="text-muted-foreground/50 text-sm">/</span>
                        <span className="text-foreground text-sm font-medium">Jobs</span>
                    </div>

                    {/* Header & Sort */}
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 border-b border-border pb-6">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground">Job Inbox</h1>
                            <p className="text-muted-foreground mt-2 text-base">We found <span className="text-primary font-bold">{jobs.length}</span> jobs matching your profile.</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                            <select className="appearance-none bg-card border-none text-foreground text-sm font-bold rounded-xl py-3 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-secondary transition-colors shadow-sm">
                                <option>Most Relevant</option>
                                <option>Newest First</option>
                                <option>Highest Salary</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Filters Sidebar */}
                        <JobsFilterSidebar />

                        {/* Job Cards Grid */}
                        <div className="lg:col-span-3">
                            {jobs.length === 0 ? (
                                <div className="text-center py-20 bg-card rounded-3xl border-none shadow-xl">
                                    <div className="inline-flex items-center justify-center p-4 rounded-full bg-secondary mb-4">
                                        <Briefcase className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">No matching jobs found</h3>
                                    <p className="text-muted-foreground text-base max-w-md mx-auto mb-6">Try adjusting your filters or search criteria to see more results.</p>
                                    <Button variant="outline" className="text-primary border-primary/20 hover:bg-primary/10">Reset Filters</Button>
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
                                    {totalPages > 1 && (
                                        <div className="mt-12 flex items-center justify-center">
                                            <nav className="flex items-center gap-3">
                                                {/* Pagination Logic */}
                                                {page > 1 && (
                                                    <Link href={`/jobs?page=${page - 1}${query ? `&q=${query}` : ''}`} className="size-12 flex items-center justify-center rounded-2xl bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shadow-sm">
                                                        <ChevronLeft className="w-5 h-5" />
                                                    </Link>
                                                )}

                                                <span className="size-12 flex items-center justify-center rounded-2xl bg-primary text-black font-bold shadow-[0_0_15px_rgba(57,224,121,0.4)]">
                                                    {page}
                                                </span>

                                                {page < totalPages && (
                                                    <Link href={`/jobs?page=${page + 1}${query ? `&q=${query}` : ''}`} className="size-12 flex items-center justify-center rounded-2xl bg-card text-muted-foreground hover:text-foreground hover:bg-secondary transition-all shadow-sm">
                                                        <ChevronRight className="w-5 h-5" />
                                                    </Link>
                                                )}
                                            </nav>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
