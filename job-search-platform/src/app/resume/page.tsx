import { prisma } from '@/lib/prisma';
import ResumeBuilder from './ResumeBuilder';

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

    return <ResumeBuilder jobs={jobs} />;
}
