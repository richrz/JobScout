import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Route } from 'next';
import { JobDetailClient } from '@/components/jobs/JobDetailClient';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Building2, MapPin, Banknote, CalendarDays, ExternalLink } from 'lucide-react';

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const job = await prisma.job.findUnique({
        where: { id: id as string }
    });

    if (!job) {
        notFound();
    }

    // Serialize the job for client component
    const serializedJob = {
        ...job,
        postedAt: job.postedAt.toISOString(),
        createdAt: job.createdAt.toISOString(),
    };

    const score = Math.round((job.compositeScore || 0) * 100);
    const scoreColor = score >= 80 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
        : score >= 60 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
        : "bg-rose-500/10 text-rose-500 border-rose-500/20";

    return (
        <div className="container mx-auto py-8 max-w-5xl space-y-6">
            <div className="flex items-center gap-4 mb-4">
                <Link href={"/jobs" as Route}>
                    <Button variant="ghost" size="sm" className="gap-2">
                        <ArrowLeft className="w-4 h-4" /> Back to Jobs
                    </Button>
                </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2 space-y-6">
                    <GlassCard className="p-8" variant="default">
                        <div className="flex justify-between items-start gap-4">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight mb-2">{job.title}</h1>
                                <div className="flex items-center gap-3 text-lg text-muted-foreground">
                                    <Building2 className="w-5 h-5" />
                                    <span className="font-medium">{job.company}</span>
                                </div>
                            </div>
                            <div className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${scoreColor}`}>
                                <span className="text-2xl font-bold">{score}%</span>
                                <span className="text-[10px] uppercase font-bold tracking-wider">Match</span>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3 mt-6">
                            <Badge variant="secondary" className="px-3 py-1.5 text-sm font-normal gap-2">
                                <MapPin className="w-4 h-4" /> {job.location || 'Remote'}
                            </Badge>
                            <Badge variant="secondary" className="px-3 py-1.5 text-sm font-normal gap-2">
                                <Banknote className="w-4 h-4" /> {job.salary || 'Salary not listed'}
                            </Badge>
                            <Badge variant="secondary" className="px-3 py-1.5 text-sm font-normal gap-2">
                                <CalendarDays className="w-4 h-4" /> Posted {new Date(job.postedAt).toLocaleDateString()}
                            </Badge>
                            <Badge variant="outline" className="px-3 py-1.5 text-sm font-normal gap-2 capitalize">
                                <ExternalLink className="w-4 h-4" /> {job.source}
                            </Badge>
                        </div>
                    </GlassCard>

                    <GlassCard className="p-8">
                        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                            Job Description
                        </h2>
                        <div className="prose max-w-none dark:prose-invert prose-slate prose-p:text-slate-600 dark:prose-p:text-slate-400">
                            <p className="whitespace-pre-wrap leading-relaxed">{job.description}</p>
                        </div>
                    </GlassCard>
                </div>

                <div className="md:col-span-1 space-y-6">
                    <GlassCard className="p-6 sticky top-24">
                        <h3 className="font-semibold mb-4">Actions</h3>
                        <JobDetailClient job={serializedJob} />
                    </GlassCard>
                </div>
            </div>
        </div>
    );
}
