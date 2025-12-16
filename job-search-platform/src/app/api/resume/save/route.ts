import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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

        // Check if application already exists
        let application = await prisma.application.findFirst({
            where: {
                jobId,
                userId: mockUserId,
            },
        });

        if (application) {
            // Update existing application with resume path
            application = await prisma.application.update({
                where: { id: application.id },
                data: {
                    resumePath,
                    updatedAt: new Date(),
                },
            });
        } else {
            // Create new application record
            application = await prisma.application.create({
                data: {
                    userId: mockUserId,
                    jobId,
                    status: 'discovered',
                    resumePath,
                    statusHistory: [
                        {
                            status: 'discovered',
                            timestamp: new Date().toISOString(),
                        },
                    ],
                },
            });
        }

        return NextResponse.json({
            success: true,
            application,
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
