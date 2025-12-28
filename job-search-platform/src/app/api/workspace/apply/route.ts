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

        // 4. Check if workspace already exists
        const existingWorkspace = await prisma.workspace.findUnique({
            where: {
                userId_jobId: {
                    userId,
                    jobId
                }
            }
        });

        if (existingWorkspace) {
            return NextResponse.json(
                {
                    error: 'You have already applied to this job',
                    workspaceId: existingWorkspace.id
                },
                { status: 409 }
            );
        }

        // 5. Create workspace with artifacts
        const workspace = await createWorkspace({
            userId,
            jobId,
            resumeContent,
            resumeName,
            coverLetterContent
        });

        return NextResponse.json({
            success: true,
            message: `Application created for ${job.title} at ${job.company}`,
            workspace: {
                id: workspace.id,
                status: workspace.status,
                artifactCount: workspace.artifacts.length
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
