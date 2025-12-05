import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        // Get the first user's config (single-user system for now)
        const config = await prisma.config.findFirst({
            orderBy: { updatedAt: 'desc' },
        });

        if (!config) {
            return NextResponse.json({
                search: { cities: [], keywords: [], categories: [], excludeKeywords: [], recencyDays: 30 },
                llm: { provider: 'openai', model: 'gpt-4o-mini', apiKey: '', temperature: 0.7, maxTokens: 2000 },
                automation: { dailyApplicationLimit: 20, autoApply: false, requireManualReview: true },
                version: 1,
                lastUpdated: new Date(),
            });
        }

        return NextResponse.json({
            search: config.searchParams,
            llm: config.llmConfig,
            automation: config.dailyCaps,
            version: config.version || 1,
            lastUpdated: config.updatedAt,
        });
    } catch (error) {
        console.error('Failed to fetch config:', error);
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Get or create user config
        let config = await prisma.config.findFirst();

        if (!config) {
            config = await prisma.config.create({
                data: {
                    userId: 'default-user',
                    searchParams: body.search,
                    llmConfig: body.llm,
                    dailyCaps: body.automation,
                    version: 1,
                },
            });
        } else {
            // Save current config to history before updating
            await prisma.configHistory.create({
                data: {
                    configId: config.id,
                    userId: config.userId,
                    searchParams: config.searchParams ?? {},
                    llmConfig: config.llmConfig ?? {},
                    dailyCaps: config.dailyCaps ?? {},
                    fileNaming: config.fileNaming,
                    version: config.version,
                },
            });

            // Update config with new values
            config = await prisma.config.update({
                where: { id: config.id },
                data: {
                    searchParams: body.search,
                    llmConfig: body.llm,
                    dailyCaps: body.automation,
                    version: { increment: 1 },
                },
            });
        }

        return NextResponse.json({
            search: config.searchParams,
            llm: config.llmConfig,
            automation: config.dailyCaps,
            version: config.version || 1,
            lastUpdated: config.updatedAt,
        });
    } catch (error) {
        console.error('Failed to save config:', error);
        return NextResponse.json({ error: 'Failed to save config' }, { status: 500 });
    }
}
