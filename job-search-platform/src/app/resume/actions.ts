'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Save resume content to an application record
 */
export async function saveResume(jobId: string, content: any, applicationId?: string) {
    try {
        if (!jobId) {
            throw new Error('Job ID is required');
        }

        const user = await prisma.user.findFirst();
        if (!user) {
            throw new Error('User not found');
        }

        // Create or Update Resume record
        // We can try to find existing resume for this job/user
        const existingResume = await prisma.resume.findFirst({
            where: {
                userId: user.id,
                jobId: jobId
            }
        });

        let resume;
        if (existingResume) {
            resume = await prisma.resume.update({
                where: { id: existingResume.id },
                data: {
                    content: content,
                    updatedAt: new Date()
                }
            });
        } else {
            resume = await prisma.resume.create({
                data: {
                    userId: user.id,
                    jobId: jobId,
                    title: 'Tailored Resume',
                    content: content,
                    applicationId: applicationId || undefined,
                    tailoringMode: 'strategic' // Default
                }
            });
        }

        // Also update Application if provided
        if (applicationId) {
            await prisma.application.update({
                where: { id: applicationId },
                data: {
                    resumePath: `/resumes/${resume.id}`, // Virtual path or link to resume view
                    updatedAt: new Date()
                }
            });
        }

        revalidatePath('/dashboard');
        revalidatePath('/resume');

        return { success: true, path: `/resume/${resume.jobId}` }; // Return path to view it
    } catch (error) {
        console.error('Failed to save resume:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
