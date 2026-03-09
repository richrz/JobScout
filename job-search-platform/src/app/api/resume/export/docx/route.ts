import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import {
  buildResumeDocxBuffer,
  createResumeExportFileName,
} from '@/lib/resume-export';
import type { ResumeDocumentData } from '@/lib/resume-document';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

interface ExportRequestBody {
  resumeData?: ResumeDocumentData;
  fileName?: string;
  job?: {
    company?: string;
    title?: string;
  } | null;
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ExportRequestBody;
    const resumeData = body.resumeData;

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 },
      );
    }

    const fileName = normalizeDocxFileName(
      body.fileName ||
        createResumeExportFileName(resumeData, 'docx', body.job || undefined),
    );
    const buffer = await buildResumeDocxBuffer(resumeData);

    return new NextResponse(buffer as BodyInit, {
      headers: {
        'Content-Type':
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    console.error('DOCX resume export failed:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Failed to export DOCX',
      },
      { status: 500 },
    );
  }
}

function normalizeDocxFileName(fileName: string) {
  const trimmed = fileName.trim() || 'resume.docx';
  return trimmed.toLowerCase().endsWith('.docx') ? trimmed : `${trimmed}.docx`;
}
