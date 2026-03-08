'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { upsertWorkspaceResume } from '@/lib/resume/workspace-resume-service';

/**
 * Save resume content to an application record
 */
export async function saveResume(jobId: string, content: unknown, applicationId?: string) {
    try {
        if (!jobId) {
            throw new Error('Job ID is required');
        }

        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            throw new Error('Unauthorized');
        }

        const workspace = await prisma.workspace.findUnique({
            where: {
                userId_jobId: {
                    userId: session.user.id,
                    jobId,
                },
            },
            select: { id: true },
        });

        const resume = await prisma.$transaction(async (tx) => {
            return upsertWorkspaceResume(tx, {
                userId: session.user.id,
                jobId,
                title: 'Working Draft',
                content,
                documentState: 'WORKING_DRAFT',
                applicationId: applicationId || undefined,
                workspaceId: workspace?.id,
            });
        });

        revalidatePath('/dashboard');
        revalidatePath('/resume');
        revalidatePath('/pipeline');
        if (resume.workspaceId) {
            revalidatePath(`/workspace/${resume.workspaceId}`);
        }

        return {
            success: true,
            path: `/resume?jobId=${resume.jobId}`,
            workspaceId: resume.workspaceId || null,
        };
    } catch (error) {
        console.error('Failed to save resume:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
