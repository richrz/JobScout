/**
 * POST /api/workspace/apply
 * 
 * Creates a new workspace when a user applies to a job.
 * Snapshots the resume and cover letter as immutable artifacts.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { createWorkspace } from '@/lib/workspace/workspace-service';
import { prisma } from '@/lib/prisma';
import { syncOpportunityState } from '@/lib/opportunities/state-sync';

export async function POST(request: NextRequest) {
    try {
        // 1. Auth check
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const userId = session.user.id;
        const body = await request.json();
        const { jobId, resumeContent, resumeName, coverLetterContent } = body;

        // 2. Validate required fields
        if (!jobId) {
            return NextResponse.json(
                { error: 'jobId is required' },
                { status: 400 }
            );
        }

        // 3. Verify job exists
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            select: { id: true, title: true, company: true }
        });

        if (!job) {
            return NextResponse.json(
                { error: 'Job not found' },
                { status: 404 }
            );
        }

        const result = await prisma.$transaction(async (tx) => {
            const syncResult = await syncOpportunityState(tx, {
                userId,
                jobId,
                legacyStatus: 'applied',
            });

            const workspace = await createWorkspace({
                userId,
                jobId,
                resumeContent,
                resumeName,
                coverLetterContent,
                status: 'APPLIED',
                applicationId: syncResult.applicationId,
            }, tx);

            return {
                workspace,
                applicationId: syncResult.applicationId,
            };
        });

        return NextResponse.json({
            success: true,
            message: `Application created for ${job.title} at ${job.company}`,
            workspace: {
                id: result.workspace.id,
                status: result.workspace.status,
                artifactCount: result.workspace.artifacts.length,
                resumeCount: result.workspace.resumes.length,
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating workspace:', error);
        return NextResponse.json(
            { error: 'Failed to create application' },
            { status: 500 }
        );
    }
}
