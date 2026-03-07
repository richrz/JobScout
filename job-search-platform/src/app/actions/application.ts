'use server';

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { dismissOpportunity, syncOpportunityState, type LegacyApplicationStatus } from '@/lib/opportunities/state-sync';

function getJsonHistoryArray(value: Prisma.JsonValue | null | undefined): Prisma.InputJsonValue[] {
    return Array.isArray(value) ? [...value] as Prisma.InputJsonValue[] : [];
}

export async function updateApplicationStatus(id: string, newStatus: string) {
    try {
        const application = await prisma.application.findUnique({
            where: { id },
            select: { statusHistory: true, userId: true, jobId: true, appliedAt: true, status: true }
        });

        if (!application) {
            throw new Error('Application not found');
        }

        // Append to status history
        // Note: Prisma JSON types can be tricky, we cast to any[] or specific type if defined
        const currentHistory = getJsonHistoryArray(application.statusHistory);
        const newHistoryEntry = {
            status: newStatus,
            timestamp: new Date().toISOString()
        };

        const updateData: Prisma.ApplicationUpdateInput = {
            status: newStatus,
            statusHistory: [...currentHistory, newHistoryEntry] as Prisma.InputJsonValue[],
            updatedAt: new Date()
        };

        // Daily Cap Enforcement
        if (newStatus === 'applied') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const config = await prisma.config.findUnique({
                where: { userId: application.userId }
            });

            const dailyCaps = config?.dailyCaps as { maxApplications?: number } | null;
            const dailyLimit = dailyCaps?.maxApplications || 50;

            const appliedCount = await prisma.application.count({
                where: {
                    userId: application.userId,
                    appliedAt: {
                        gte: today
                    }
                }
            });

            if (appliedCount >= dailyLimit) {
                return { success: false, error: `Daily application limit of ${dailyLimit} reached.` };
            }

            updateData.appliedAt = new Date();
        }

        await prisma.$transaction(async (tx) => {
            await tx.application.update({
                where: { id },
                data: updateData
            });

            await syncOpportunityState(tx, {
                userId: application.userId,
                jobId: application.jobId,
                legacyStatus: newStatus as LegacyApplicationStatus,
            });
        });

        revalidatePath('/pipeline');
        revalidatePath('/jobs');
        return { success: true };
    } catch (error) {
        console.error('Failed to update application status:', error);
        return { success: false, error: 'Failed to update status' };
    }
}

export async function updateApplicationNotes(id: string, notes: string) {
    try {
        await prisma.application.update({
            where: { id },
            data: {
                notes,
                updatedAt: new Date()
            }
        });
        revalidatePath('/pipeline');
        return { success: true };
    } catch (error) {
        console.error('Failed to update notes:', error);
        return { success: false, error: 'Failed to update notes' };
    }
}

export async function uploadResume(id: string, formData: FormData) {
    try {
        const file = formData.get('file') as File;
        if (!file) {
            throw new Error('No file provided');
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), 'public', 'uploads');
        await mkdir(uploadDir, { recursive: true });

        // Generate unique filename
        const filename = `${id}-${Date.now()}-${file.name}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Update database
        const publicPath = `/uploads/${filename}`;
        await prisma.application.update({
            where: { id },
            data: {
                resumePath: publicPath,
                updatedAt: new Date()
            }
        });

        revalidatePath('/pipeline');
        return { success: true, path: publicPath };
    } catch (error) {
        console.error('Failed to upload resume:', error);
        return { success: false, error: 'Failed to upload resume' };
    }
}

export async function bulkArchiveApplications(ids: string[]) {
    try {
        const applications = await prisma.application.findMany({
            where: { id: { in: ids } },
            select: { userId: true, jobId: true }
        });

        await prisma.$transaction(async (tx) => {
            for (const application of applications) {
                await syncOpportunityState(tx, {
                    userId: application.userId,
                    jobId: application.jobId,
                    legacyStatus: 'archived',
                });
            }
        });

        revalidatePath('/pipeline');
        return { success: true };
    } catch (error) {
        console.error('Failed to bulk archive:', error);
        return { success: false, error: 'Failed to bulk archive' };
    }
}

export async function bulkDeleteApplications(ids: string[]) {
    try {
        const applications = await prisma.application.findMany({
            where: { id: { in: ids } },
            select: { userId: true, jobId: true }
        });

        await prisma.$transaction(async (tx) => {
            await tx.application.deleteMany({
                where: { id: { in: ids } }
            });

            for (const application of applications) {
                await tx.workspace.deleteMany({
                    where: {
                        userId: application.userId,
                        jobId: application.jobId,
                    }
                });
            }
        });

        revalidatePath('/pipeline');
        revalidatePath('/jobs');
        return { success: true };
    } catch (error) {
        console.error('Failed to bulk delete:', error);
        return { success: false, error: 'Failed to bulk delete' };
    }
}

type ActionResponse = {
    success: boolean;
    error?: string;
    message?: string;
};

export async function applyToJob(jobId: string, initialStatus: string = 'interested'): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' };
        }

        const userId = session.user.id;

        // Ensure user exists in database (for dev mode bypass)
        let user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user && session.user.email) {
            // Create user if doesn't exist (dev mode)
            user = await prisma.user.create({
                data: {
                    id: userId,
                    email: session.user.email,
                    name: session.user.name || 'User',
                }
            });
        }

        if (!user) {
            return { success: false, error: 'User not found in database' };
        }

        // Check if already applied
        const existingApplication = await prisma.application.findFirst({
            where: {
                userId,
                jobId
            }
        });

        if (existingApplication) {
            // If already exists, update status to 'applied' if not already
            if (existingApplication.status === 'applied') {
                return { success: true, message: 'Already applied' };
            }

            const updateResult = await updateApplicationStatus(existingApplication.id, 'applied');

            return {
                success: updateResult.success,
                error: updateResult.error,
                message: updateResult.success ? 'Application updated' : undefined
            };
        }

        // Check daily limit
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const config = await prisma.config.findUnique({
            where: { userId }
        });

        const dailyCaps = config?.dailyCaps as { maxApplications?: number } | null;
        const dailyLimit = dailyCaps?.maxApplications || 50;

        const appliedCount = await prisma.application.count({
            where: {
                userId,
                appliedAt: {
                    gte: today
                }
            }
        });

        if (appliedCount >= dailyLimit) {
            return { success: false, error: `Daily application limit of ${dailyLimit} reached.` };
        }

        await prisma.$transaction(async (tx) => {
            await syncOpportunityState(tx, {
                userId,
                jobId,
                legacyStatus: initialStatus as LegacyApplicationStatus,
            });
        });

        revalidatePath('/pipeline');
        revalidatePath('/jobs');
        return { success: true };

    } catch (error: unknown) {
        console.error('Failed to apply to job:', error instanceof Error ? error.message : error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to apply to job'
        };
    }
}

export async function toggleJobInterest(jobId: string): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
        const userId = session.user.id;

        const existing = await prisma.application.findFirst({
            where: { userId, jobId },
            select: { id: true, status: true }
        });

        if (existing) {
            if (['applied', 'screening', 'interview', 'offer'].includes(existing.status)) {
                return {
                    success: false,
                    error: 'This opportunity is already in your pipeline. Update it from the pipeline instead.'
                };
            }

            // Un-star: Remove both Application and Workspace
            await prisma.$transaction([
                prisma.application.delete({ where: { id: existing.id } }),
                prisma.workspace.deleteMany({ where: { userId, jobId } })
            ]);
            revalidatePath('/pipeline');
            revalidatePath('/jobs');
            return { success: true, message: 'Removed from interested' };
        } else {
            // Star: Add both
            return await applyToJob(jobId, 'interested');
        }
    } catch (error: unknown) {
        console.error('Failed to toggle interest:', error);
        return { success: false, error: 'Failed to update interest' };
    }
}

export async function dismissJob(jobId: string): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
        const userId = session.user.id;

        const existing = await prisma.application.findFirst({
            where: { userId, jobId },
            select: { status: true }
        });

        if (existing && ['applied', 'screening', 'interview', 'offer'].includes(existing.status)) {
            return {
                success: false,
                error: 'This opportunity is already active in your pipeline. Move it from the pipeline instead of dismissing it from Inbox.'
            };
        }

        await prisma.$transaction(async (tx) => {
            await dismissOpportunity(tx, { userId, jobId });
        });

        revalidatePath('/jobs');
        revalidatePath('/triage');
        revalidatePath('/pipeline');
        return { success: true };
    } catch (error: unknown) {
        console.error('Failed to dismiss job:', error);
        return { success: false, error: 'Failed to dismiss job' };
    }
}
