/**
 * GET/PATCH /api/workspace/[id]
 * 
 * Operations on a specific workspace.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getWorkspace, updateWorkspaceStatus } from '@/lib/workspace/workspace-service';
import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const workspace = await getWorkspace(id);

        if (!workspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        // Verify ownership
        if (workspace.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Also fetch job details
        const job = await prisma.job.findUnique({
            where: { id: workspace.jobId },
            select: { title: true, company: true, location: true }
        });

        return NextResponse.json({
            workspace,
            job
        });

    } catch (error) {
        console.error('Error fetching workspace:', error);
        return NextResponse.json({ error: 'Failed to fetch workspace' }, { status: 500 });
    }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const workspace = await getWorkspace(id);

        if (!workspace) {
            return NextResponse.json({ error: 'Workspace not found' }, { status: 404 });
        }

        if (workspace.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { status } = body;

        // Validate status
        const validStatuses: ApplicationStatus[] = ['INTERESTED', 'APPLIED', 'FOLLOW_UP', 'DORMANT', 'ARCHIVED', 'PASSED'];
        if (status && !validStatuses.includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        if (status) {
            await updateWorkspaceStatus(id, status);
        }

        return NextResponse.json({
            success: true,
            message: 'Workspace updated'
        });

    } catch (error) {
        console.error('Error updating workspace:', error);
        return NextResponse.json({ error: 'Failed to update workspace' }, { status: 500 });
    }
}
