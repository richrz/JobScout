/**
 * POST /api/triage/action
 * 
 * Handles triage actions (Interested/Dismissed) for a job.
 * Creates a Workspace with the corresponding status.
 */

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
        const { jobId, action } = body;

        if (!jobId || !action) {
            return NextResponse.json({ error: 'Missing jobId or action' }, { status: 400 });
        }

        // Validate action type
        if (!['INTERESTED', 'DISMISSED'].includes(action)) {
            return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        await prisma.$transaction(async (tx) => {
            if (action === 'INTERESTED') {
                await syncOpportunityState(tx, {
                    userId: session.user.id,
                    jobId,
                    legacyStatus: 'interested',
                });
                return;
            }

            await dismissOpportunity(tx, {
                userId: session.user.id,
                jobId,
            });
        });

        return NextResponse.json({ success: true }, { status: 201 });

    } catch (error: unknown) {
        console.error('Error processing triage action:', error);

        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}
