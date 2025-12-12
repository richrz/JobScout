
import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Route } from 'next';
import { JobDetailClient } from '@/components/jobs/JobDetailClient';

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

    return (
        <div className="container mx-auto py-8">
            <div className="mb-6">
                <Link href={"/jobs" as Route}>
                    <Button variant="ghost" size="sm">← Back to Jobs</Button>
                </Link>
            </div>

            <div className="bg-card rounded-lg border shadow-sm p-8">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
                        <p className="text-xl text-muted-foreground">{job.company}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary h-fit">
                        {Math.round((job.compositeScore || 0) * 100)}% Match
                    </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 border-y py-4">
                    <div>
                        <span className="text-sm text-muted-foreground block">Location</span>
                        <span className="font-medium">{job.location || 'Remote'}</span>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground block">Salary</span>
                        <span className="font-medium">{job.salary || 'Not listed'}</span>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground block">Posted</span>
                        <span className="font-medium">{new Date(job.postedAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                        <span className="text-sm text-muted-foreground block">Source</span>
                        <span className="font-medium capitalize">{job.source}</span>
                    </div>
                </div>

                <div className="prose max-w-none dark:prose-invert">
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="whitespace-pre-wrap">{job.description}</p>
                </div>

                {/* Action Buttons */}
                <JobDetailClient job={serializedJob} />
            </div>
        </div>
    );
}
