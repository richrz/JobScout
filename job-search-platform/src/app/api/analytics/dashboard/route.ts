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

        const userId = session.user.id;

        // 1. Jobs Found (Total non-expired jobs)
        // Ideally we filter by relevance or time, but straight count is fine for MVP
        const totalJobs = await prisma.job.count();

        // 2. Application Funnel (from Workspace)
        const funnel = await prisma.workspace.groupBy({
            by: ['status'],
            where: {
                userId: userId
            },
            _count: {
                status: true
            }
        });

        const counts = {
            INTERESTED: 0,
            APPLIED: 0,
            FOLLOW_UP: 0,
            PASSED: 0
        };

        funnel.forEach(group => {
            if (group.status in counts) {
                // @ts-ignore
                counts[group.status] = group._count.status;
            }
        });

        // 3. Recent Activity (Latest 5 interactions)
        // We can query Workspace ordered by updatedAt
        const recentActivity = await prisma.workspace.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 5,
            include: {
                job: {
                    select: {
                        title: true,
                        company: true
                    }
                }
            }
        });

        // 4. Chronos Data (for fun/context)
        const chronosJobs = await prisma.job.count({
            where: { source: 'chronos-sim' }
        });

        return NextResponse.json({
            metrics: {
                totalJobs,
                chronosJobs,
                applied: counts.APPLIED,
                interested: counts.INTERESTED,
                interviews: counts.FOLLOW_UP, // Proxying FollowUp as Interview for now
            },
            activity: recentActivity.map(item => ({
                id: item.id,
                type: item.status, // e.g. INTERESTED
                title: `${item.status === 'APPLIED' ? 'Applied to' : 'Saved'} ${item.job.title}`,
                subtitle: item.job.company,
                timestamp: item.updatedAt
            }))
        });

    } catch (error) {
        console.error('Analytics Fetch Error:', error);
        return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
    }
}
