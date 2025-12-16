'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * Save resume content to an application record
 */
export async function saveResume(applicationId: string, content: any) {
    try {
        if (!applicationId) {
            throw new Error('Application ID is required');
        }

        // Check if application exists
        const application = await prisma.application.findUnique({
            where: { id: applicationId },
        });

        if (!application) {
            throw new Error('Application not found');
        }

        // In a real app, we might save to a file/S3 and store the path
        // For now, we'll store the JSON content directly if we add a field, 
        // OR we'll serialize it to a file and store the path.
        // Task description says "Save to Application record" and "save to Application.resumePath".

        // Since we don't have S3 set up, let's simulate saving to a file
        // OR, we can assume 'resumePath' might temporarily hold the JSON string? 
        // No, 'resumePath' is string.

        // Let's create a ResumePersistence service concept, but for simplicity:
        // We will store it in a 'resumes' directory and save path.

        const fs = require('fs/promises');
        const path = require('path');
        const resumeDir = path.join(process.cwd(), 'public', 'resumes');

        await fs.mkdir(resumeDir, { recursive: true });

        const fileName = `resume-${applicationId}-${Date.now()}.json`;
        const filePath = path.join(resumeDir, fileName);

        await fs.writeFile(filePath, JSON.stringify(content, null, 2));

        // Update application record
        await prisma.application.update({
            where: { id: applicationId },
            data: {
                resumePath: `/resumes/${fileName}`,
                status: 'applied', // Optional: update status? Keep as is generally.
                updatedAt: new Date(),
            },
        });

        try {
            revalidatePath('/dashboard');
            revalidatePath(`/applications/${applicationId}`);
        } catch (e) {
            console.warn('Revalidate path failed (expected in standalone script):', e);
        }

        return { success: true, path: `/resumes/${fileName}` };
    } catch (error) {
        console.error('Failed to save resume:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
