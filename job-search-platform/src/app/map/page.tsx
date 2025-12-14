import { prisma } from '@/lib/prisma';
import { MapControls } from '@/components/map/MapControls';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Job Map | Job Search Platform',
    description: 'Visual map of job opportunities with heatmap and filters',
};

export const dynamic = 'force-dynamic';

export default async function MapPage() {
    // Fetch up to 500 recent jobs with location data
    const jobs = await prisma.job.findMany({
        where: {
            latitude: { not: null },
            longitude: { not: null },
        },
        take: 500,
        orderBy: { postedAt: 'desc' },
    });

    return (
        <div className="container mx-auto py-6 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Geographic Distribution</h1>
            </div>

            <MapControls jobs={jobs as any} />
        </div>
    );
}
