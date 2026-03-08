/**
 * Workspace Service
 * 
 * Handles creation of workspaces and snapshotting of artifacts
 * when a user applies to a job.
 */

import { prisma } from '@/lib/prisma';
import { ApplicationStatus, Prisma } from '@prisma/client';
import { upsertWorkspaceResume } from '@/lib/resume/workspace-resume-service';

export interface CreateWorkspaceInput {
    userId: string;
    jobId: string;
    resumeContent?: string;
    resumeName?: string;
    coverLetterContent?: string;
    status?: ApplicationStatus;
    applicationId?: string | null;
}

export interface WorkspaceWithArtifacts {
    id: string;
    userId: string;
    jobId: string;
    applicationId?: string | null;
    status: ApplicationStatus;
    priority: string;
    createdAt: Date;
    artifacts: {
        id: string;
        type: string;
        name: string;
        createdAt: Date;
    }[];
    resumes: {
        id: string;
        title: string;
        documentState: string;
        pdfSnapshot: string | null;
        createdAt: Date;
    }[];
}

type WorkspaceDbClient = Prisma.TransactionClient | typeof prisma;

/**
 * Creates a workspace for a job application and snapshots any provided documents.
 * Uses a transaction to ensure atomicity.
 */
export async function createWorkspace(
    input: CreateWorkspaceInput,
    db: WorkspaceDbClient = prisma
): Promise<WorkspaceWithArtifacts> {
    const { userId, jobId, resumeContent, resumeName, coverLetterContent, applicationId } = input;

    const workspace = await db.workspace.upsert({
        where: {
            userId_jobId: {
                userId,
                jobId,
            },
        },
        update: {
            status: input.status || 'APPLIED',
            applicationId: applicationId || undefined,
            updatedAt: new Date(),
        },
        create: {
            userId,
            jobId,
            status: input.status || 'APPLIED',
            priority: 'medium',
            applicationId: applicationId || undefined,
        }
    });

    const artifacts: { id: string; type: string; name: string; createdAt: Date }[] = [];
    const resumes: WorkspaceWithArtifacts['resumes'] = [];

    if (resumeContent) {
        const submittedSnapshot = await upsertWorkspaceResume(db, {
            userId,
            jobId,
            workspaceId: workspace.id,
            applicationId,
            title: resumeName || `Submitted Resume - ${new Date().toISOString().split('T')[0]}`,
            content: {
                text: resumeContent,
                source: 'workspace-apply',
            },
            documentState: 'SUBMITTED_SNAPSHOT',
        });
        resumes.push({
            id: submittedSnapshot.id,
            title: submittedSnapshot.title,
            documentState: submittedSnapshot.documentState,
            pdfSnapshot: submittedSnapshot.pdfSnapshot,
            createdAt: submittedSnapshot.createdAt,
        });
    }

    if (coverLetterContent) {
        const coverLetterArtifact = await db.artifact.create({
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

    const result = {
        id: workspace.id,
        userId: workspace.userId,
        jobId: workspace.jobId,
        applicationId: workspace.applicationId,
        status: workspace.status,
        priority: workspace.priority,
        createdAt: workspace.createdAt,
        artifacts,
        resumes,
    };

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
            },
            resumes: {
                select: {
                    id: true,
                    title: true,
                    documentState: true,
                    pdfSnapshot: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                }
            }
        }
    });

    if (!workspace) return null;

    return {
        id: workspace.id,
        userId: workspace.userId,
        jobId: workspace.jobId,
        applicationId: workspace.applicationId,
        status: workspace.status,
        priority: workspace.priority,
        createdAt: workspace.createdAt,
        artifacts: workspace.artifacts,
        resumes: workspace.resumes,
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
            resumes: {
                select: {
                    id: true,
                    title: true,
                    documentState: true,
                    pdfSnapshot: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
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
        applicationId: w.applicationId,
        status: w.status,
        priority: w.priority,
        createdAt: w.createdAt,
        artifacts: w.artifacts,
        resumes: w.resumes,
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
