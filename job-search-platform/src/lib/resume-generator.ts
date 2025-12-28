'use server';

import { prisma } from '@/lib/prisma';
import { getLLMClient } from '@/lib/llm';
import { ResumeGenerator } from '@/lib/llm';
import { Profile } from '@prisma/client';
import { isMockMode } from './env';
import { ExaggerationLevel } from '@/types/llm';

export interface ResumeGenerationRequest {
    jobDescription: string;
    profile: any; // Profile data
    exaggerationLevel: ExaggerationLevel;
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
            model: 'gpt-5.2',
            temperature: 0.7,
            maxTokens: 2000,
            apiKey: process.env.OPENAI_API_KEY,
        };

        // Check for Mock Mode explicitly
        if (isMockMode()) {
            console.warn('Mock Mode active in generateTailoredResume');
            throw new Error('LLM_MOCK_FALLBACK');
        }

        // Verify API Key existence when not in Mock Mode
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('Configuration Error: OPENAI_API_KEY is not set. Ensure secrets are configured or enable NEXT_PUBLIC_MOCK_MODE.');
        }

        const llmClient = getLLMClient(llmConfig);
        const generator = new ResumeGenerator(llmClient);

        const response = await generator.generateTailoredResume({
            jobDescription: request.jobDescription,
            userProfile: request.profile,
            exaggerationLevel: request.exaggerationLevel,
        });

        let content = response.content;

        // Strip markdown code blocks if present
        if (content.includes('```json')) {
            content = content.replace(/```json\n?|\n?```/g, '');
        } else if (content.includes('```')) {
            content = content.replace(/```\n?|\n?```/g, '');
        }

        let parsedContent;
        try {
            parsedContent = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse LLM response as JSON:', content);
            // Fallback to minimal valid structure if parsing fails
            const contactInfo = request.profile.contactInfo as any || {};
            parsedContent = {
                contactInfo: {
                    name: contactInfo.name || 'Candidate',
                    email: contactInfo.email || ''
                },
                summary: content, // Put raw content in summary if parsing fails
                experience: [],
                education: [],
                skills: []
            };
        }

        return {
            content: parsedContent,
            usage: response.usage,
        };
    } catch (error) {
        console.error('Failed to generate resume:', error);
        throw error; // Re-throw to be handled by caller
    }
}

/**
 * Generate and preview resume - server action for Next.js
 */
export async function generateAndPreviewResume(
    jobId: string,
    exaggerationLevel: ExaggerationLevel = 'professional'
) {
    let profile: any = null;
    try {
        // Fetch job details
        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            throw new Error('Job not found');
        }

        // Get user profile (assuming single user for now)
        profile = await prisma.profile.findFirst({
            include: { experiences: true, educations: true }
        });

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
