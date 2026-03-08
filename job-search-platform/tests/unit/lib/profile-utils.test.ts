import { describe, expect, test } from '@jest/globals';
import { calculateCompleteness, Profile } from '../../../src/lib/profile-utils';

describe('calculateCompleteness', () => {
  const emptyProfile: Profile = {
    contactInfo: {},
    workHistory: [],
    education: [],
    experiences: [],
    educations: [],
    skills: [],
    projects: [],
    certifications: []
  };

  test('returns 0 for empty profile', () => {
    expect(calculateCompleteness(emptyProfile)).toBe(0);
  });

  test('adds 10 for contact info (email)', () => {
    const profile = { ...emptyProfile, contactInfo: { email: 'test@test.com' } };
    expect(calculateCompleteness(profile)).toBe(10);
  });

  test('adds 40 for work history', () => {
    const profile = {
      ...emptyProfile,
      experiences: [{
        id: '1',
        position: 'Engineer',
        company: 'Acme',
        startDate: '2024-01-01',
        current: true,
        description: 'Built things',
        technologies: []
      }]
    };
    expect(calculateCompleteness(profile)).toBe(40);
  });

  test('returns 100 for full profile', () => {
    const profile: Profile = {
      contactInfo: { email: 'test@test.com' },
      workHistory: [],
      education: [],
      experiences: [{
        id: '1',
        position: 'Engineer',
        company: 'Acme',
        startDate: '2024-01-01',
        current: true,
        description: 'Built things',
        technologies: []
      }],
      educations: [{
        id: '1',
        school: 'Uni',
        degree: 'BS',
        field: 'CS',
        startDate: '2020-01-01'
      }],
      skills: ['React', 'Node', 'TS', 'JS', 'CSS'], // 5 skills
      projects: [{ id: '1', name: 'Project', description: 'Built a project' }],
      certifications: [{ id: '1', name: 'Cert', issuer: 'Issuer', date: '2024-01-01' }]
    };
    expect(calculateCompleteness(profile)).toBe(100);
  });
});
