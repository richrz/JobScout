import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLLMClient, ResumeGenerator } from '@/lib/llm';

export async function POST(request: Request) {
    try {
        const { jobId, exaggerationLevel = 'balanced' } = await request.json();

        if (!jobId) {
            return NextResponse.json(
                { success: false, error: 'Job ID is required' },
                { status: 400 }
            );
        }

        // Fetch job details
        const job = await prisma.job.findUnique({
            where: { id: jobId },
        });

        if (!job) {
            return NextResponse.json(
                { success: false, error: 'Job not found' },
                { status: 404 }
            );
        }

        // Get user profile
        const profile = await prisma.profile.findFirst();

        if (!profile) {
            return NextResponse.json(
                { success: false, error: 'Please set up your profile first in the Profile section' },
                { status: 400 }
            );
        }

        // Get LLM configuration from user config
        const savedConfig = await prisma.config.findFirst();
        const llmSettings = savedConfig?.llmConfig as {
            provider?: string;
            model?: string;
            apiKey?: string;
            apiEndpoint?: string;
            temperature?: number;
            maxTokens?: number
        } | null;

        const llmConfig = {
            provider: llmSettings?.provider || 'openai',
            model: llmSettings?.model || 'gpt-4o-mini',
            temperature: llmSettings?.temperature || 0.7,
            maxTokens: llmSettings?.maxTokens || 2000,
            apiKey: llmSettings?.apiKey || (llmSettings?.provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY),
            apiEndpoint: llmSettings?.apiEndpoint || (llmSettings?.provider === 'anthropic' ? process.env.ANTHROPIC_BASE_URL : undefined),
        };

        // Validate we have an API key
        if (!llmConfig.apiKey) {
            return NextResponse.json(
                { success: false, error: 'Please configure your LLM API key in Settings' },
                { status: 400 }
            );
        }

        // Create LLM client and generator
        const llmClient = getLLMClient(llmConfig as any);
        const generator = new ResumeGenerator(llmClient);

        // Generate tailored resume
        const response = await generator.generateTailoredResume({
            jobDescription: job.description,
            userProfile: profile,
            exaggerationLevel,
        });

        return NextResponse.json({
            success: true,
            content: response.content,
            usage: response.usage,
        });

    } catch (error) {
        console.error('Resume generation error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to generate resume'
            },
            { status: 500 }
        );
    }
}
