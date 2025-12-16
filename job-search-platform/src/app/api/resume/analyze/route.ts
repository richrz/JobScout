import { NextRequest, NextResponse } from 'next/server';
import { analyzeResume } from '@/lib/ats/ats-analyzer';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { resumeText, jobDescription, jobId } = await req.json();

        let jobText = jobDescription;

        // If jobId provided, fetch job description from DB
        if (jobId && !jobText) {
            const job = await prisma.job.findUnique({
                where: { id: jobId }
            });
            if (job) {
                jobText = job.description;
            }
        }

        if (!resumeText || !jobText) {
            return NextResponse.json({ error: 'Missing resume text or job description' }, { status: 400 });
        }

        const result = await analyzeResume(resumeText, jobText);

        return NextResponse.json({ success: true, data: result });

    } catch (error) {
        console.error('ATS Analysis Error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
