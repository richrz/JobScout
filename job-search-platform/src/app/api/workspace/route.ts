/**
 * GET /api/workspace
 * 
 * Retrieves all workspaces for the authenticated user.
 */

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserWorkspaces } from '@/lib/workspace/workspace-service';

export async function GET() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const workspaces = await getUserWorkspaces(session.user.id);

        return NextResponse.json({
            workspaces,
            count: workspaces.length
        });

    } catch (error) {
        console.error('Error fetching workspaces:', error);
        return NextResponse.json(
            { error: 'Failed to fetch workspaces' },
            { status: 500 }
        );
    }
}
