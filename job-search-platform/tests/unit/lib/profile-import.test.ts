import { describe, expect, it } from '@jest/globals';
import { extractProfileFromResumeText } from '@/lib/profile-import-service';
import {
  mergeImportedProfile,
  sanitizeImportedProfile,
} from '@/lib/profile-import';

describe('profile import helpers', () => {
  it('sanitizes imported data into the supported profile shape', () => {
    const imported = sanitizeImportedProfile({
      contactInfo: {
        name: ' Richard Ruiz ',
        email: ' richard@example.com ',
      },
      experiences: [
        {
          position: 'Senior Engineer',
          company: 'Deskwise',
          startDate: '2022',
          endDate: 'Present',
          description: ' Built core workflows. ',
          technologies: ['React', 'React', 'TypeScript'],
        },
      ],
      skills: ['React', ' TypeScript ', 'React'],
    });

    expect(imported.contactInfo.name).toBe('Richard Ruiz');
    expect(imported.experiences[0]?.startDate).toBe('2022-01-01');
    expect(imported.experiences[0]?.current).toBe(true);
    expect(imported.skills).toEqual(['React', 'TypeScript']);
  });

  it('merges imported facts into existing profile master data without dropping current data', () => {
    const currentProfile = {
      contactInfo: {
        name: 'Richard Ruiz',
        firstName: 'Richard',
        lastName: 'Ruiz',
        email: 'rruiz@deskwise.io',
        phone: '9497434975',
        linkedin: '',
        location: '',
        portfolio: '',
        summary: 'Seasoned Strategic Solutions Engineer with extensive',
      },
      workHistory: [],
      experiences: [
        {
          id: 'exp-1',
          position: 'Account Executive',
          company: 'SHI',
          startDate: '2020-01-01',
          endDate: '',
          current: true,
          description: 'Owned enterprise accounts',
          technologies: ['Salesforce'],
        },
      ],
      education: [],
      educations: [],
      skills: ['Salesforce'],
      projects: [],
      certifications: [],
    };

    const importedProfile = sanitizeImportedProfile({
      contactInfo: {
        name: 'Richard Ruiz',
        linkedin: 'linkedin.com/in/richardruiz',
        summary:
          'Seasoned Strategic Solutions Engineer with extensive experience in complex data center sales, IT administration, and enterprise-level technical consulting.',
      },
      experiences: [
        {
          position: 'Account Executive',
          company: 'SHI',
          startDate: '2020',
          description: 'Owned enterprise accounts and complex renewal strategy',
          technologies: ['Salesforce', 'Outreach'],
        },
        {
          position: 'Senior Engineer',
          company: 'Deskwise',
          startDate: '2023-02',
          description: 'Built AI-assisted hiring workflows',
          technologies: ['React', 'TypeScript'],
        },
      ],
      skills: ['React', 'TypeScript'],
    });

    const merged = mergeImportedProfile(currentProfile, importedProfile);

    expect(merged.contactInfo.email).toBe('rruiz@deskwise.io');
    expect(merged.contactInfo.firstName).toBe('Richard');
    expect(merged.contactInfo.lastName).toBe('Ruiz');
    expect(merged.contactInfo.phone).toBe('(949) 743-4975');
    expect(merged.contactInfo.linkedin).toBe('linkedin.com/in/richardruiz');
    expect(merged.contactInfo.summary).toContain('enterprise-level technical consulting');
    expect(merged.experiences).toHaveLength(2);
    expect(merged.experiences[0]?.description).toContain('complex renewal strategy');
    expect(merged.experiences[0]?.technologies).toEqual(['Salesforce', 'Outreach']);
    expect(merged.skills).toEqual(['Salesforce', 'React', 'TypeScript']);
  });

  it('parses dense docx-style experience blocks into reviewable roles', async () => {
    const imported = await extractProfileFromResumeText(`
Richard Ruiz

Professional Summary
Seasoned Pre-Sales Engineer and Solutions Architect with over 15 years of experience.

Professional Experience

VP of Sales & Systems EngineeringAdroit Worldwide Media (AWM Inc.) - Aliso Viejo, CA2020 - Present- Supported enterprise sales teams with pre-sales opportunities from qualification through production hand-off.

Principal Sales ArchitectEase Inc. - Aliso Viejo, CA2017 - 2020- Led pre-sales technical activities, offering expertise in data protection and security solutions.

Managing Solutions Architect & Principal Presales EngineerEase Inc. - Aliso Viejo, CAGordian Health IT2015 - 2017- Led a team of solutions architects in designing and delivering complex IT infrastructure solutions.

Principal Windows and Azure Cloud Sales ArchitectMicrosoft Corporation - Redmond, WA2006 - 2015- Led technical sales teams, driving product sales and providing world-class support.

Key Skills
- Cloud Computing

Education
Bachelor’s Degree in Physics
San Diego State University
`);

    expect(imported.experiences).toHaveLength(4);
    expect(imported.experiences[0]?.position).toBe('VP of Sales & Systems Engineering');
    expect(imported.experiences[0]?.company).toContain('Adroit Worldwide Media');
    expect(imported.experiences[1]?.company).toBe('Ease Inc.');
    expect(imported.experiences[2]?.company).toContain('Gordian Health IT');
    expect(imported.experiences[3]?.company).toBe('Microsoft Corporation');
    expect(imported.educations[0]).toMatchObject({
      degree: 'Bachelor’s Degree',
      field: 'Physics',
      school: 'San Diego State University',
    });
  });

  it('extracts obvious contact details from imported resume text', async () => {
    const imported = await extractProfileFromResumeText(`
Richard Ruiz

richardruiz@live.com 949-743-4975 linkedin.com/in/richardruiz

Professional Summary
Seasoned Solutions Architect.

Professional Experience
Principal ArchitectExample Corp - Irvine, CA2021 - Present
`);

    expect(imported.contactInfo.email).toBe('richardruiz@live.com');
    expect(imported.contactInfo.phone).toBe('(949) 743-4975');
    expect(imported.contactInfo.linkedin).toBe('linkedin.com/in/richardruiz');
  });
});
