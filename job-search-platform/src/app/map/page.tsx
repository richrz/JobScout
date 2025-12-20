import { prisma } from '@/lib/prisma';
import { MapControls } from '@/components/map/MapControls';
import { MapSidebar } from '@/components/map/MapSidebar';
import { Metadata } from 'next';
import { Search } from 'lucide-react';

export const metadata: Metadata = {
    title: 'Job Map | Job Search Platform',
    description: 'Visual map of job opportunities with heatmap and filters',
};

export const dynamic = 'force-dynamic';

export default async function MapPage() {
    const jobs = await prisma.job.findMany({
        where: {
            latitude: { not: null },
            longitude: { not: null },
        },
        take: 500,
        orderBy: { postedAt: 'desc' },
    });

    return (
        <div className="h-[calc(100vh-4rem)] flex overflow-hidden">
            {/* Sidebar Filter & List Panel */}
            <MapSidebar jobs={jobs as any} />

            {/* Map Section */}
            <div className="flex-1 relative">
                {/* Floating Search (Desktop) */}
                <div className="absolute top-6 right-6 z-10 w-80 hidden md:block">
                    <div className="flex w-full items-stretch rounded-full h-11 bg-card/90 backdrop-blur-md border border-border shadow-xl group hover:border-primary/50 transition-colors">
                        <div className="text-primary pl-4 flex items-center justify-center">
                            <Search className="w-5 h-5" />
                        </div>
                        <input
                            className="flex w-full min-w-0 flex-1 bg-transparent border-none text-foreground focus:outline-none focus:ring-0 placeholder-muted-foreground px-3 text-sm"
                            placeholder="Search location..."
                        />
                    </div>
                </div>

                {/* Map Component */}
                <MapControls jobs={jobs as any} />
            </div>
        </div>
    );
}
