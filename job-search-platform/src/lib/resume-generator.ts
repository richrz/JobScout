'use server';

import { prisma } from '@/lib/prisma';
import { getLLMClient } from '@/lib/llm';
import { ResumeGenerator } from '@/lib/llm';
import { Profile } from '@prisma/client';
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

        // Check for Mock Mode or missing Key
        if (process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || !process.env.OPENAI_API_KEY) {
            console.warn('Mock Mode active or API Key missing in generateTailoredResume');
            // We can throw here to trigger the fallback in the caller, 
            // OR return a mock response directly if we want to simulate "success" from the generator's POV.
            // Throwing is better so the caller knows it was a fallback situation if needed, 
            // but let's just return mock content to keep the interface consistent.
            // Actually, the caller (generateAndPreviewResume) handles fallback best because it has context.
            throw new Error('LLM_MOCK_FALLBACK');
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
    exaggerationLevel: ExaggerationLevel = 'strategic'
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

        if (profile) {
            // Fallback to Mock Data
            console.warn('Falling back to mock resume data due to failure.');
            const contactInfo = profile.contactInfo as any || {};
            const mockContent = {
                contactInfo: {
                    name: contactInfo.name || 'Mock Candidate',
                    email: contactInfo.email || 'mock@example.com',
                    phone: contactInfo.phone || '555-0100',
                    location: contactInfo.location || 'San Francisco, CA'
                },
                summary: "Experienced specialized software engineer with a proven track record in high-scale systems. (Generated via Mock Mode fallback due to LLM error).",
                experience: profile.experiences?.map((e: any) => ({
                    id: e.id,
                    title: e.position,
                    company: e.company,
                    location: e.location || 'Remote',
                    startDate: e.startDate ? new Date(e.startDate).toISOString().split('T')[0] : '',
                    endDate: e.endDate ? new Date(e.endDate).toISOString().split('T')[0] : 'Present',
                    description: e.description || 'Worked on key projects and delivered high-quality code.'
                })) || [],
                education: profile.educations?.map((e: any) => ({
                    id: e.id,
                    school: e.school,
                    degree: e.degree,
                    startDate: e.startDate ? new Date(e.startDate).getFullYear().toString() : '',
                    endDate: e.endDate ? new Date(e.endDate).getFullYear().toString() : ''
                })) || [],
                skills: profile.skills || ['TypeScript', 'React', 'Node.js']
            };

            return {
                success: true,
                content: mockContent,
                usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
                error: error instanceof Error ? error.message : 'Unknown error (Fallback used)'
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}
