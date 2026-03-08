import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getPassedRestorePlan } from '@/lib/opportunities/passed-bin';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { workspaceIds, action } = body as {
            workspaceIds?: string[];
            action?: 'RESTORE' | 'ARCHIVE';
        };

        if (!Array.isArray(workspaceIds) || workspaceIds.length === 0 || !action) {
            return NextResponse.json({ error: 'Missing workspaceIds or action' }, { status: 400 });
        }

        if (!['RESTORE', 'ARCHIVE'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            const workspaces = await tx.workspace.findMany({
                where: {
                    id: { in: workspaceIds },
                    userId: session.user.id,
                    status: 'PASSED',
                },
                select: {
                    id: true,
                    userId: true,
                    jobId: true,
                    applicationId: true,
                    application: {
                        select: {
                            id: true,
                            status: true,
                        }
                    }
                }
            });

            if (action === 'ARCHIVE') {
                for (const workspace of workspaces) {
                    await tx.workspace.update({
                        where: { id: workspace.id },
                        data: {
                            status: 'ARCHIVED',
                            updatedAt: new Date(),
                        }
                    });
                }
                return;
            }

            for (const workspace of workspaces) {
                const linkedApplication = workspace.application || await tx.application.findFirst({
                    where: {
                        userId: workspace.userId,
                        jobId: workspace.jobId,
                    },
                    select: {
                        id: true,
                        status: true,
                    }
                });

                const restorePlan = getPassedRestorePlan(linkedApplication?.status ?? null);

                if (restorePlan.destination === 'WORKSPACE' && restorePlan.workspaceStatus) {
                    await tx.workspace.update({
                        where: { id: workspace.id },
                        data: {
                            status: restorePlan.workspaceStatus,
                            applicationId: linkedApplication?.id ?? undefined,
                            updatedAt: new Date(),
                        }
                    });
                    continue;
                }

                if (linkedApplication && ['discovered', 'archived', 'rejected', 'passed'].includes(linkedApplication.status)) {
                    await tx.application.delete({
                        where: { id: linkedApplication.id }
                    });
                }

                await tx.workspace.delete({
                    where: { id: workspace.id }
                });
            }
        });

        revalidatePath('/passed');
        revalidatePath('/jobs');
        revalidatePath('/pipeline');

        return NextResponse.json({ success: true, count: workspaceIds.length });
    } catch (error) {
        console.error('Failed to process passed-bin action:', error);
        return NextResponse.json({ error: 'Failed to process passed-bin action' }, { status: 500 });
    }
}
