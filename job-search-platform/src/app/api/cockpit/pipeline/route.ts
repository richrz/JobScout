/**
 * GET /api/cockpit/pipeline
 *
 * Returns all workspaces for the current user, grouped by status,
 * with associated Job details and note count.
 * This powers the cockpit pipeline strip.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        let userId = session?.user?.id;
        
        // For local development wireframing, fallback to the first user if there is no session
        if (!userId && process.env.NODE_ENV === 'development') {
            const fallbackUser = await prisma.user.findFirst();
            if (fallbackUser) userId = fallbackUser.id;
        }

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const workspaces = await prisma.workspace.findMany({
            where: { userId },
            include: {
                job: {
                    select: {
                        id: true,
                        title: true,
                        company: true,
                        location: true,
                        salary: true,
                        compositeScore: true,
                        sourceUrl: true,
                    }
                },
                _count: {
                    select: {
                        notes: true,
                        artifacts: true,
                        resumes: true,
                    }
                },
            },
            orderBy: { updatedAt: 'desc' },
        });

        // Group by status
        const pipeline: Record<string, any[]> = {
            NEW: [],
            INTERESTED: [],
            APPLIED: [],
            FOLLOW_UP: [],
            DORMANT: [],
            ARCHIVED: [],
            PASSED: []
        };
        
        for (const ws of workspaces) {
            const stage = ws.status;
            if (!pipeline[stage]) pipeline[stage] = [];
            pipeline[stage].push(ws);
        }

        // Fetch "NEW" jobs separately (jobs without a workspace for this user)
        const unworkspacedJobs = await prisma.job.findMany({
            where: {
                workspaces: {
                    none: { userId }
                }
            },
            select: {
                id: true,
                title: true,
                company: true,
                location: true,
                salary: true,
                compositeScore: true,
                sourceUrl: true,
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map unworkspaced jobs to look like minimal workspaces so the UI can render them
        for (const job of unworkspacedJobs) {
            pipeline['NEW'].push({
                id: `new-${job.id}`,
                status: 'NEW',
                job,
                updatedAt: new Date().toISOString(),
                _count: { notes: 0, artifacts: 0, resumes: 0 }
            });
        }

        return NextResponse.json({
            pipeline,
            total: workspaces.length + unworkspacedJobs.length,
        });

    } catch (error) {
        console.error('Error fetching cockpit pipeline:', error);
        return NextResponse.json(
            { error: 'Failed to fetch pipeline' },
            { status: 500 }
        );
    }
}
