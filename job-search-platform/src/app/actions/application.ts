'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

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

            const dailyLimit = (config?.dailyCaps as any)?.maxApplications || 50;

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

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

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
