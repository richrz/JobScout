import { NextResponse } from 'next/server';
import { triggerManualAggregation } from '@/lib/scheduler';

export async function POST(request: Request) {
    try {
        // In a production environment, add authentication check here
        // e.g., verify admin session or API key

        console.log('Received manual aggregation trigger via API');

        // Trigger the aggregation
        // We await it to ensure it completes successfully before responding,
        // but in a serverless environment with short timeouts, this might need to be backgrounded.
        await triggerManualAggregation('api-manual-trigger');

        return NextResponse.json({ success: true, message: 'Aggregation triggered successfully' });
    } catch (error) {
        console.error('Error triggering aggregation:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to trigger aggregation' },
            { status: 500 }
        );
    }
}
