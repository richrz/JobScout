import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { dismissOpportunity, syncOpportunityState } from '@/lib/opportunities/state-sync';

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

        await prisma.$transaction(async (tx) => {
            for (const item of items) {
                if (item.action === 'INTERESTED') {
                    await syncOpportunityState(tx, {
                        userId: session.user.id,
                        jobId: item.jobId,
                        legacyStatus: 'interested',
                    });
                    continue;
                }

                await dismissOpportunity(tx, {
                    userId: session.user.id,
                    jobId: item.jobId,
                });
            }
        });

        console.log('[BatchAction] Transaction successful');

        // Invalidate Pipeline cache
        const { revalidatePath } = await import('next/cache');
        revalidatePath('/pipeline');
        revalidatePath('/jobs');

        return NextResponse.json({ success: true, count: items.length });

    } catch (error) {
        console.error('[BatchAction] Error processing batch triage:', error);
        return NextResponse.json({ error: 'Failed to process actions' }, { status: 500 });
    }
}
