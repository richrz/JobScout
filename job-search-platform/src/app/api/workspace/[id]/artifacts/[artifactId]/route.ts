/**
 * GET /api/workspace/[id]/artifacts/[artifactId]
 * 
 * Retrieves a specific artifact's content (immutable snapshot).
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface RouteParams {
    params: Promise<{ id: string; artifactId: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        const { artifactId } = await params;
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch artifact with workspace for ownership check
        const artifact = await prisma.artifact.findUnique({
            where: { id: artifactId },
            include: {
                workspace: {
                    select: { userId: true }
                }
            }
        });

        if (!artifact) {
            return NextResponse.json({ error: 'Artifact not found' }, { status: 404 });
        }

        // Verify ownership
        if (artifact.workspace.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Note: Artifacts are immutable - no update endpoint exists by design
        return NextResponse.json({
            id: artifact.id,
            type: artifact.type,
            name: artifact.name,
            content: artifact.content,
            storagePath: artifact.storagePath,
            createdAt: artifact.createdAt,
            isImmutable: true // Always true for artifacts
        });

    } catch (error) {
        console.error('Error fetching artifact:', error);
        return NextResponse.json({ error: 'Failed to fetch artifact' }, { status: 500 });
    }
}

// NOTE: No POST, PATCH, or DELETE endpoints for artifacts.
// Artifacts are immutable snapshots created only during workspace creation.
