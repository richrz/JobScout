import '@/lib/load-root-env';
import { NextResponse } from 'next/server';
import {
  extractProfileFromResumeText,
  extractTextFromResumeFile,
} from '@/lib/profile-import-service';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'Resume file is required' },
        { status: 400 },
      );
    }

    const resumeText = await extractTextFromResumeFile(file);

    if (!resumeText) {
      return NextResponse.json(
        { error: 'Could not extract text from the uploaded resume' },
        { status: 400 },
      );
    }

    const importedProfile = await extractProfileFromResumeText(resumeText);

    return NextResponse.json({
      success: true,
      importedProfile,
      review: {
        filename: file.name,
        extractedCharacters: resumeText.length,
        counts: {
          experiences: importedProfile.experiences.length,
          educations: importedProfile.educations.length,
          skills: importedProfile.skills.length,
          projects: importedProfile.projects.length,
          certifications: importedProfile.certifications.length,
        },
      },
    });
  } catch (error) {
    console.error('Failed to import resume into profile:', error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to import resume',
      },
      { status: 500 },
    );
  }
}
