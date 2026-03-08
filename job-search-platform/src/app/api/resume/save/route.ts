import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { upsertWorkspaceResume } from '@/lib/resume/workspace-resume-service';

export async function POST(request: NextRequest) {
    try {
        const { jobId, resumePath, userId } = await request.json();

        if (!jobId || !resumePath) {
            return NextResponse.json(
                { success: false, error: 'JobId and resumePath are required' },
                { status: 400 }
            );
        }

        // TODO: Get actual userId from session
        const mockUserId = userId || 'mock-user-id';

        const resume = await prisma.$transaction(async (tx) => {
            return upsertWorkspaceResume(tx, {
                userId: mockUserId,
                jobId,
                title: 'Existing Resume',
                content: {
                    source: 'legacy-api',
                    path: resumePath,
                },
                documentState: 'REFERENCE',
                pdfSnapshot: resumePath,
            });
        });

        return NextResponse.json({
            success: true,
            resume,
        });
    } catch (error) {
        console.error('Resume save error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to save resume',
            },
            { status: 500 }
        );
    }
}
