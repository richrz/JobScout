import { NextRequest, NextResponse } from 'next/server';
import { chronos } from '@/lib/simulation/chronos-manager';

export async function GET() {
    return NextResponse.json(chronos.getStatus());
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, jobsPerHour, junkRatio } = body;

        if (action === 'START') {
            chronos.start();
        } else if (action === 'STOP') {
            chronos.stop();
        } else if (action === 'UPDATE') {
            chronos.updateConfig(Number(jobsPerHour), Number(junkRatio));
        }

        return NextResponse.json(chronos.getStatus());
    } catch (error) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}
