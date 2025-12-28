import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { items } = body; // Array of { jobId, action }

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ success: true, count: 0 }); // Nothing to do
        }

        console.log(`[BatchAction] Processing ${items.length} items for user ${session.user.email}`);

        // Process in transaction
        await prisma.$transaction(
            items.flatMap((item: any) => {
                const legacyStatus = item.action === 'INTERESTED' ? 'interested' : 'rejected';

                return [
                    // V2 Workspace
                    prisma.workspace.upsert({
                        where: { userId_jobId: { userId: session.user.id, jobId: item.jobId } },
                        update: { status: item.action as ApplicationStatus },
                        create: {
                            userId: session.user.id,
                            jobId: item.jobId,
                            status: item.action as ApplicationStatus
                        }
                    }),
                    // V1 Application (Legacy Sync)
                    prisma.application.create({
                        data: {
                            userId: session.user.id,
                            jobId: item.jobId,
                            status: legacyStatus
                        }
                    })
                ];
            }).flat() // Flatten the array of promises (Wait, flatMap returns T, but map returns T[]. flatMap is map().flat(). Ensure it returns flat array of promises)
            // Actually, flatMap on array returns Flattened array.
            // item => [p1, p2]. flatMap => [p1, p2, p3, p4]. Correct.
        );

        console.log('[BatchAction] Transaction successful');

        // Invalidate Pipeline cache
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/pipeline');

        return NextResponse.json({ success: true, count: items.length });

    } catch (error) {
        console.error('[BatchAction] Error processing batch triage:', error);
        return NextResponse.json({ error: 'Failed to process actions' }, { status: 500 });
    }
}
