import { describe, expect, it } from '@jest/globals';
import {
  buildResumeDocxBuffer,
  createResumeExportFileName,
  type ResumeExportData,
} from '@/lib/resume-export';

describe('resume export helpers', () => {
  const mockResume: ResumeExportData = {
    contactInfo: {
      name: 'Richard Ruiz',
      email: 'richard@example.com',
      phone: '949-743-4975',
      location: 'Colorado Springs, CO',
    },
    summary: 'Seasoned solutions architect focused on trustworthy resume workflows.',
    experience: [
      {
        id: 'exp-1',
        title: 'Principal Architect',
        company: 'Deskwise',
        location: 'Remote',
        startDate: '2021-01-01',
        endDate: '',
        description: 'Built AI-assisted job search and resume systems.',
      },
    ],
    education: [
      {
        id: 'edu-1',
        degree: 'BS Computer Science',
        school: 'State University',
        location: 'Colorado',
        startDate: '2010-01-01',
        endDate: '2014-01-01',
      },
    ],
    skills: ['TypeScript', 'React', 'Resume Strategy'],
  };

  it('creates a stable export filename from resume and job context', () => {
    expect(
      createResumeExportFileName(mockResume, 'docx', {
        company: 'Cyberhaven',
        title: 'Solutions Architect',
      }),
    ).toBe('richard-ruiz-cyberhaven-solutions-architect.docx');
  });

  it('builds a valid docx buffer from structured resume truth', async () => {
    const buffer = await buildResumeDocxBuffer(mockResume);

    expect(Buffer.isBuffer(buffer)).toBe(true);
    expect(buffer.subarray(0, 2).toString()).toBe('PK');
    expect(buffer.byteLength).toBeGreaterThan(500);
  });
});
