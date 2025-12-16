
import { prisma } from '@/lib/prisma';
import ResumeBuilder from './ResumeBuilder';
import { Suspense } from 'react';
import { Page } from '@/components/layout/Page';

export const dynamic = 'force-dynamic';

export default async function ResumePage() {
    const jobs = await prisma.job.findMany({
        select: {
            id: true,
            title: true,
            company: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const user = await prisma.user.findFirst();
    const profile = user ? await prisma.profile.findUnique({
        where: { userId: user.id },
        include: { experiences: true, educations: true }
    }) : null;

    return (
        <Page width="full" className="h-[calc(100vh-4rem)] p-0 sm:p-0 lg:p-0 py-0 space-y-0">
            <Suspense fallback={<div className="p-8">Loading Resume Builder...</div>}>
                <ResumeBuilder jobs={jobs} initialProfile={profile} />
            </Suspense>
        </Page>
    );
}
