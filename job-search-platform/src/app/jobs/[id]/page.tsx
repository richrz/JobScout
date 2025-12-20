import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Route } from 'next';
import { JobDetailClient } from '@/components/jobs/JobDetailClient';
import { ChevronRight, MapPin, DollarSign, Calendar, ExternalLink, Bookmark, Heart, CheckCircle } from 'lucide-react';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const job = await prisma.job.findUnique({
        where: { id: id as string }
    });

    if (!job) {
        notFound();
    }

    const serializedJob = {
        ...job,
        postedAt: job.postedAt.toISOString(),
        createdAt: job.createdAt.toISOString(),
    };

    const score = Math.round((job.compositeScore || 0) * 100);

    return (
        <div className="min-h-screen">
            {/* Breadcrumbs */}
            <div className="max-w-6xl mx-auto px-6 lg:px-8 pt-8">
                <div className="flex flex-wrap gap-2 mb-8 items-center text-sm">
                    <Link href="/" className="text-muted-foreground hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <Link href="/jobs" className="text-muted-foreground hover:text-primary transition-colors">Jobs</Link>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    <span className="text-foreground font-medium">{job.title}</span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 relative pb-12">
                    {/* Left Column: Job Details */}
                    <div className="lg:col-span-8 flex flex-col gap-8">
                        {/* Hero Section */}
                        <div className="flex flex-col gap-6">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex flex-col gap-2">
                                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">{job.title}</h1>
                                    <div className="flex items-center gap-2 text-muted-foreground text-base mt-1">
                                        <span className="font-medium text-foreground">{job.company}</span>
                                        <span>•</span>
                                        <span>{job.location || 'Remote'}</span>
                                        <span>•</span>
                                        <span className="text-primary">Posted {new Date(job.postedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <button className="hidden md:flex size-12 items-center justify-center rounded-full bg-card hover:bg-secondary border border-border group transition-all">
                                    <Bookmark className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                </button>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-3">
                                {job.location && (
                                    <div className="flex h-9 items-center gap-2 rounded-full bg-secondary px-4 border border-border">
                                        <MapPin className="w-4 h-4 text-primary" />
                                        <span className="text-foreground text-sm font-medium">{job.location}</span>
                                    </div>
                                )}
                                {job.salary && (
                                    <div className="flex h-9 items-center gap-2 rounded-full bg-secondary px-4 border border-border">
                                        <DollarSign className="w-4 h-4 text-primary" />
                                        <span className="text-foreground text-sm font-medium">{job.salary}</span>
                                    </div>
                                )}
                                <div className="flex h-9 items-center gap-2 rounded-full bg-secondary px-4 border border-border">
                                    <ExternalLink className="w-4 h-4 text-primary" />
                                    <span className="text-foreground text-sm font-medium capitalize">{job.source}</span>
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="h-px w-full bg-border"></div>

                        {/* Job Description */}
                        <div className="flex flex-col gap-8 text-muted-foreground leading-relaxed text-lg">
                            <section>
                                <h3 className="text-foreground text-2xl font-bold mb-4">About the Role</h3>
                                <div className="whitespace-pre-wrap">{job.description}</div>
                            </section>
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-4 relative">
                        <div className="sticky top-24 flex flex-col gap-6">
                            {/* Action Card */}
                            <div className="p-6 rounded-xl bg-card border border-border shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex flex-col">
                                        <span className="text-muted-foreground text-sm">Match Score</span>
                                        <div className="flex items-center gap-2">
                                            {score >= 80 && <div className="size-2 rounded-full bg-primary animate-pulse"></div>}
                                            <span className={`font-bold text-xl ${score >= 80 ? 'text-primary' : score >= 60 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                                                {score}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-muted-foreground text-sm">Posted</span>
                                        <span className="text-foreground font-medium">{new Date(job.postedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                <JobDetailClient job={serializedJob} />
                            </div>

                            {/* Company Widget */}
                            <div className="p-6 rounded-xl bg-card border border-border">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="size-14 rounded-xl overflow-hidden bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                                        {job.company?.charAt(0) || 'C'}
                                    </div>
                                    <div>
                                        <h4 className="text-foreground font-bold text-lg leading-tight">{job.company}</h4>
                                        <span className="text-primary text-sm hover:underline cursor-pointer">View Profile</span>
                                    </div>
                                </div>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                                    Learn more about {job.company} and their open positions.
                                </p>
                                <div className="flex flex-col gap-3">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <MapPin className="w-5 h-5" />
                                        <span>{job.location || 'Multiple Locations'}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <ExternalLink className="w-5 h-5" />
                                        <span className="capitalize">{job.source}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
