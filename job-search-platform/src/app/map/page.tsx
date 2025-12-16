
import { prisma } from '@/lib/prisma';
import { MapControls } from '@/components/map/MapControls';
import { Metadata } from 'next';
import { Page } from '@/components/layout/Page';
import { Section } from '@/components/layout/Section';

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
        <Page width="wide" className="h-[calc(100vh-4rem)] flex flex-col p-4 w-full max-w-none">
            {/* Map page often needs full width/height. width="full" overrides max-w to none. */}
            {/* Original was container mx-auto py-6 space-y-6. So it WAS constrained. */}
            {/* But usually Maps are better full screen. I'll use width="full". */}
            <Section title="Geographic Distribution" className="flex-none px-4" />
            <div className="flex-1 min-h-0 px-4 pb-4">
                <MapControls jobs={jobs as any} />
            </div>
        </Page>
    );
}
