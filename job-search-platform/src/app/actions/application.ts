'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function updateApplicationStatus(id: string, newStatus: string) {
    try {
        const application = await prisma.application.findUnique({
            where: { id },
            select: { statusHistory: true, userId: true } // Added userId to select
        });

        if (!application) {
            throw new Error('Application not found');
        }

        // Append to status history
        // Note: Prisma JSON types can be tricky, we cast to any[] or specific type if defined
        const currentHistory = (application.statusHistory as any[]) || [];
        const newHistoryEntry = {
            status: newStatus,
            timestamp: new Date().toISOString()
        };

        const updateData: any = {
            status: newStatus,
            statusHistory: [...currentHistory, newHistoryEntry],
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

        await prisma.application.update({
            where: { id },
            data: updateData
        });

        revalidatePath('/pipeline');
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
        await prisma.application.updateMany({
            where: { id: { in: ids } },
            data: {
                status: 'archived',
                updatedAt: new Date()
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
        await prisma.application.deleteMany({
            where: { id: { in: ids } }
        });
        revalidatePath('/pipeline');
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

            // Sync with Workspace
            await prisma.workspace.upsert({
                where: { userId_jobId: { userId, jobId } },
                update: { status: 'APPLIED' },
                create: { userId, jobId, status: 'APPLIED' }
            });

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

        // Create new application
        await prisma.application.create({
            data: {
                userId,
                jobId,
                status: initialStatus,
                appliedAt: initialStatus === 'applied' ? new Date() : null,
                statusHistory: [
                    {
                        status: initialStatus,
                        timestamp: new Date().toISOString()
                    }
                ]
            }
        });

        // Sync with Workspace
        await prisma.workspace.upsert({
            where: { userId_jobId: { userId, jobId } },
            update: { status: initialStatus === 'applied' ? 'APPLIED' : 'INTERESTED' },
            create: { userId, jobId, status: initialStatus === 'applied' ? 'APPLIED' : 'INTERESTED' }
        });

        revalidatePath('/pipeline');
        revalidatePath('/jobs');
        return { success: true };

    } catch (error: any) {
        console.error('Failed to apply to job:', error?.message || error);
        return { success: false, error: error?.message || 'Failed to apply to job' };
    }
}

export async function toggleJobInterest(jobId: string): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
        const userId = session.user.id;

        const existing = await prisma.application.findFirst({
            where: { userId, jobId }
        });

        if (existing) {
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
    } catch (error: any) {
        console.error('Failed to toggle interest:', error);
        return { success: false, error: 'Failed to update interest' };
    }
}

export async function dismissJob(jobId: string): Promise<ActionResponse> {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };
        const userId = session.user.id;

        // Dismiss simply creates a Workspace record with status DISMISSED
        // This ensures it falls out of the Triage feed.
        await prisma.workspace.upsert({
            where: { userId_jobId: { userId, jobId } },
            update: { status: 'DISMISSED' },
            create: { userId, jobId, status: 'DISMISSED' }
        });

        revalidatePath('/jobs');
        revalidatePath('/triage');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to dismiss job:', error);
        return { success: false, error: 'Failed to dismiss job' };
    }
}