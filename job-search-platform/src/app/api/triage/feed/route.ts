/**
 * GET /api/triage/feed
 * 
 * Fetches jobs for the triage feed.
 * Criteria: Jobs that do NOT have a Workspace record for the current user.
 * Limit: Default 10 jobs.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get('limit') || '10');

        // Fetch user's existing interactions (workspace jobIds)
        // Optimization: We could use a NOT IN query directly, or fetch IDs first.
        // For performance at scale, a LEFT JOIN ... WHERE NULL or NOT EXISTS is better.
        // Prisma support for where: { NOT: { workspaces: { some: { userId: ... } } } }

        const jobs = await prisma.job.findMany({
            where: {
                workspaces: {
                    none: {
                        userId: session.user.id
                    }
                }
            },
            orderBy: {
                postedAt: 'desc' // Newest jobs first
            },
            take: limit,
            select: {
                id: true,
                title: true,
                company: true,
                location: true,
                salary: true,
                description: true,
                postedAt: true,
                source: true
            }
        });

        return NextResponse.json({ jobs });

    } catch (error) {
        console.error('Error fetching triage feed:', error);
        return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 });
    }
}
