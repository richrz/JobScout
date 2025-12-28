/**
 * Workspace Service
 * 
 * Handles creation of workspaces and snapshotting of artifacts
 * when a user applies to a job.
 */

import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export interface CreateWorkspaceInput {
    userId: string;
    jobId: string;
    resumeContent?: string;
    resumeName?: string;
    coverLetterContent?: string;
    status?: ApplicationStatus;
}

export interface WorkspaceWithArtifacts {
    id: string;
    userId: string;
    jobId: string;
    status: ApplicationStatus;
    priority: string;
    createdAt: Date;
    artifacts: {
        id: string;
        type: string;
        name: string;
        createdAt: Date;
    }[];
}

/**
 * Creates a workspace for a job application and snapshots any provided documents.
 * Uses a transaction to ensure atomicity.
 */
export async function createWorkspace(input: CreateWorkspaceInput): Promise<WorkspaceWithArtifacts> {
    const { userId, jobId, resumeContent, resumeName, coverLetterContent } = input;

    // Use a transaction to create workspace and artifacts atomically
    const result = await prisma.$transaction(async (tx) => {
        // 1. Create the workspace
        const workspace = await tx.workspace.create({
            data: {
                userId,
                jobId,
                status: input.status || 'APPLIED',
                priority: 'medium',
            }
        });

        const artifacts: { id: string; type: string; name: string; createdAt: Date }[] = [];

        // 2. Snapshot resume if provided
        if (resumeContent) {
            const resumeArtifact = await tx.artifact.create({
                data: {
                    workspaceId: workspace.id,
                    type: 'RESUME',
                    name: resumeName || `Resume-${new Date().toISOString().split('T')[0]}`,
                    storagePath: `workspaces/${workspace.id}/resume.txt`,
                    content: resumeContent,
                }
            });
            artifacts.push({
                id: resumeArtifact.id,
                type: resumeArtifact.type,
                name: resumeArtifact.name,
                createdAt: resumeArtifact.createdAt
            });
        }

        // 3. Snapshot cover letter if provided
        if (coverLetterContent) {
            const coverLetterArtifact = await tx.artifact.create({
                data: {
                    workspaceId: workspace.id,
                    type: 'COVER_LETTER',
                    name: `Cover Letter - ${new Date().toISOString().split('T')[0]}`,
                    storagePath: `workspaces/${workspace.id}/cover-letter.txt`,
                    content: coverLetterContent,
                }
            });
            artifacts.push({
                id: coverLetterArtifact.id,
                type: coverLetterArtifact.type,
                name: coverLetterArtifact.name,
                createdAt: coverLetterArtifact.createdAt
            });
        }

        return {
            id: workspace.id,
            userId: workspace.userId,
            jobId: workspace.jobId,
            status: workspace.status,
            priority: workspace.priority,
            createdAt: workspace.createdAt,
            artifacts
        };
    });

    console.log(`Created workspace ${result.id} with ${result.artifacts.length} artifacts`);
    return result;
}

/**
 * Retrieves a workspace by ID with its artifacts
 */
export async function getWorkspace(workspaceId: string): Promise<WorkspaceWithArtifacts | null> {
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            artifacts: {
                select: {
                    id: true,
                    type: true,
                    name: true,
                    createdAt: true
                }
            }
        }
    });

    if (!workspace) return null;

    return {
        id: workspace.id,
        userId: workspace.userId,
        jobId: workspace.jobId,
        status: workspace.status,
        priority: workspace.priority,
        createdAt: workspace.createdAt,
        artifacts: workspace.artifacts
    };
}

/**
 * Retrieves all workspaces for a user
 */
export async function getUserWorkspaces(userId: string): Promise<WorkspaceWithArtifacts[]> {
    const workspaces = await prisma.workspace.findMany({
        where: { userId },
        include: {
            artifacts: {
                select: {
                    id: true,
                    type: true,
                    name: true,
                    createdAt: true
                }
            },
            job: {
                select: {
                    title: true,
                    company: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return workspaces.map(w => ({
        id: w.id,
        userId: w.userId,
        jobId: w.jobId,
        status: w.status,
        priority: w.priority,
        createdAt: w.createdAt,
        artifacts: w.artifacts
    }));
}

/**
 * Updates workspace status
 */
export async function updateWorkspaceStatus(
    workspaceId: string,
    status: ApplicationStatus
): Promise<void> {
    await prisma.workspace.update({
        where: { id: workspaceId },
        data: { status }
    });
}
