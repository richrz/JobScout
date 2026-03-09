import { describe, expect, it } from '@jest/globals';
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
        email: 'rruiz@deskwise.io',
        phone: '',
        linkedin: '',
        location: '',
        portfolio: '',
        summary: '',
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
        linkedin: 'linkedin.com/in/richardruiz',
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
    expect(merged.contactInfo.linkedin).toBe('linkedin.com/in/richardruiz');
    expect(merged.experiences).toHaveLength(2);
    expect(merged.experiences[0]?.description).toContain('complex renewal strategy');
    expect(merged.experiences[0]?.technologies).toEqual(['Salesforce', 'Outreach']);
    expect(merged.skills).toEqual(['Salesforce', 'React', 'TypeScript']);
  });
});
