/**
 * POST /api/triage/action
 * 
 * Handles triage actions (Interested/Dismissed) for a job.
 * Creates a Workspace with the corresponding status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createWorkspace } from '@/lib/workspace/workspace-service';
import { ApplicationStatus } from '@prisma/client';

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

        // Create workspace with the specified status
        const workspace = await createWorkspace({
            userId: session.user.id,
            jobId,
            status: action as ApplicationStatus
        });

        return NextResponse.json({ workspace }, { status: 201 });

    } catch (error: any) {
        console.error('Error processing triage action:', error);

        // Handle unique constraint violation (already triaged/applied)
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Job already triaged or applied' }, { status: 409 });
        }

        return NextResponse.json({ error: 'Failed to process action' }, { status: 500 });
    }
}
