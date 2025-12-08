'use server';

import { prisma } from '@/lib/prisma';
import { getLLMClient } from '@/lib/llm';
import { ResumeGenerator } from '@/lib/llm';
import { Profile } from '@prisma/client';

export interface ResumeGenerationRequest {
    jobDescription: string;
    profile: any; // Profile data
    exaggerationLevel: 'conservative' | 'balanced' | 'strategic';
}

/**
 * Generate a tailored resume for a specific job
 */
export async function generateTailoredResume(request: ResumeGenerationRequest) {
    try {
        // Get user's LLM configuration from database
        // For now, use default OpenAI configuration
        const llmConfig = {
            provider: 'openai' as const,
            model: 'gpt-4o-mini',
            temperature: 0.7,
            maxTokens: 2000,
            apiKey: process.env.OPENAI_API_KEY,
        };

        const llmClient = getLLMClient(llmConfig);
        const generator = new ResumeGenerator(llmClient);

        const response = await generator.generateTailoredResume({
            jobDescription: request.jobDescription,
            profile: request.profile,
            exaggerationLevel: request.exaggerationLevel,
        });

        return {
            content: response.content,
            usage: response.usage,
        };
    } catch (error) {
        console.error('Failed to generate resume:', error);
        throw new Error(`Resume generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Generate and preview resume - server action for Next.js
 */
export async function generateAndPreviewResume(
    jobId: string,
    exaggerationLevel: 'conservative' | 'balanced' | 'strategic' = 'balanced'
) {
    try {
        // Fetch job details
        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new Error('Job not found');
        }

        // Get user profile (assuming single user for now)
        const profile = await prisma.profile.findFirst();

        if (!profile) {
            throw new Error('Profile not found');
        }

        // Generate tailored resume
        const result = await generateTailoredResume({
            jobDescription: job.description,
            profile,
            exaggerationLevel,
        });

        return {
            success: true,
            content: result.content,
            usage: result.usage,
        };
    } catch (error) {
        console.error('Failed to generate and preview resume:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
