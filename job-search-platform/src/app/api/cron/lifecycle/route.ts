/**
 * GET /api/cron/lifecycle
 * 
 * Cron endpoint for running lifecycle automation.
 * Should be called daily (e.g., by Vercel Cron, external scheduler, or node-cron).
 * 
 * Vercel Cron configuration (add to vercel.json):
 * {
 *   "crons": [
 *     {
 *       "path": "/api/cron/lifecycle",
 *       "schedule": "0 6 * * *"
 *     }
 *   ]
 * }
 */

import { NextRequest, NextResponse } from 'next/server';
import { runLifecycleAutomation, getLifecycleStats } from '@/lib/workspace/lifecycle-service';

// Secret for cron authorization (prevent public access)
const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: NextRequest) {
    try {
        // Authorization check for production
        if (CRON_SECRET) {
            const authHeader = request.headers.get('authorization');
            if (authHeader !== `Bearer ${CRON_SECRET}`) {
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
            }
        }

        console.log('Running lifecycle automation cron job...');

        // Get stats before
        const statsBefore = await getLifecycleStats();

        // Run automation
        const result = await runLifecycleAutomation();

        // Get stats after
        const statsAfter = await getLifecycleStats();

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            result,
            stats: {
                before: statsBefore,
                after: statsAfter
            }
        });

    } catch (error) {
        console.error('Lifecycle cron job failed:', error);
        return NextResponse.json(
            { error: 'Lifecycle automation failed' },
            { status: 500 }
        );
    }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
    return GET(request);
}
