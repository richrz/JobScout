import { NextResponse } from 'next/server';
import { getLLMClient } from '@/lib/llm';

export async function POST(request: Request) {
    try {
        const config = await request.json();

        const client = getLLMClient(config);
        const result = await client.testConnection();

        if (result.status === 'success') {
            return NextResponse.json({
                success: true,
                responseTime: result.responseTime
            });
        } else {
            return NextResponse.json({
                success: false,
                error: result.error
            });
        }
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
}
