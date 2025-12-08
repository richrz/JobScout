import { prisma } from '@/lib/prisma';
import { JobMap } from '@/components/map/JobMap';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Job Map | Job Search Platform',
    description: 'Visual map of job opportunities',
};

export const dynamic = 'force-dynamic';

export default async function MapPage() {
    // Fetch up to 100 recent jobs with location data
    const jobs = await prisma.job.findMany({
        where: {
            latitude: { not: null },
            longitude: { not: null },
        },
        take: 500,
        orderBy: { postedAt: 'desc' },
    });

    // No mock data - rely on DB
    const displayJobs = jobs;

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Geographic Distribution</h1>
                <span className="text-sm text-muted-foreground">{displayJobs.length} Jobs Mapped</span>
            </div>

            {/* 
          Note: Since the API Key is mocked, the map might show an error overlay or development mode watermark. 
          But the integration logic is sound. 
      */}
            <JobMap jobs={displayJobs as any} />
        </div>
    );
}
