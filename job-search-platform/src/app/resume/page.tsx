import { prisma } from '@/lib/prisma';
import ResumeBuilder from './ResumeBuilder';
import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function ResumePage() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        redirect('/auth/signin');
    }

    const interestedApplications = await prisma.application.findMany({
        where: {
            userId: session.user.id,
            status: 'interested'
        },
        include: { job: true },
        orderBy: { updatedAt: 'desc' }
    });

    const jobs = interestedApplications.map(app => ({
        id: app.job.id,
        title: app.job.title,
        company: app.job.company
    }));

    const user = await prisma.user.findFirst();
    const profile = user ? await prisma.profile.findUnique({
        where: { userId: user.id },
        include: { experiences: true, educations: true }
    }) : null;

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden">
            {/* Header Bar */}
            <header className="flex items-center justify-between px-6 lg:px-8 py-4 border-b border-border bg-background/95 backdrop-blur-sm shrink-0">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 text-sm">
                        <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Home</Link>
                        <span className="text-muted-foreground/50">→</span>
                        <span className="text-primary font-medium">Resume Builder</span>
                    </div>
                    <h1 className="text-xl font-bold text-foreground tracking-tight">Resume Builder</h1>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
                <Suspense fallback={
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        <span className="ml-3 text-muted-foreground">Loading Resume Builder...</span>
                    </div>
                }>
                    <ResumeBuilder jobs={jobs} initialProfile={profile} />
                </Suspense>
            </div>
        </div>
    );
}
