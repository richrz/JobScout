/**
 * POST /api/pipeline/add
 * 
 * Manually adds a job to the pipeline (for jobs found outside the platform).
 * Creates a stub Job record + Application in 'interested' status.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { syncOpportunityState } from '@/lib/opportunities/state-sync';

export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { url, title, company } = body;

        if (!url && !title) {
            return NextResponse.json({ error: 'Provide at least a URL or job title.' }, { status: 400 });
        }

        // Upsert: if a job with this sourceUrl already exists, use it
        const sourceUrl = url || `manual:${session.user.id}:${Date.now()}`;

        const job = await prisma.job.upsert({
            where: { sourceUrl },
            create: {
                title: title || 'Manual Application',
                company: company || 'Unknown Company',
                location: '',
                description: '',
                source: 'indeed', // generic placeholder
                sourceUrl,
                postedAt: new Date(),
            },
            update: {}
        });

        // Create Application record if one doesn't already exist
        const existing = await prisma.application.findFirst({
            where: { userId: session.user.id, jobId: job.id }
        });

        let applicationId: string;
        if (!existing) {
            await prisma.$transaction(async (tx) => {
                await syncOpportunityState(tx, {
                    userId: session.user.id,
                    jobId: job.id,
                    legacyStatus: 'interested',
                });
            });

            const application = await prisma.application.findFirstOrThrow({
                where: { userId: session.user.id, jobId: job.id }
            });
            applicationId = application.id;
        } else {
            applicationId = existing.id;
        }

        return NextResponse.json({ success: true, jobId: job.id, applicationId });

    } catch (error: unknown) {
        console.error('[pipeline/add] Error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Failed to add application' },
            { status: 500 }
        );
    }
}
