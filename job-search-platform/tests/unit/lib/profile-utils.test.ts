import { describe, expect, test } from '@jest/globals';
import { calculateCompleteness, Profile } from '../../../src/lib/profile-utils';

describe('calculateCompleteness', () => {
  const emptyProfile: Profile = {
    contactInfo: {},
    workHistory: [],
    education: [],
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
    const profile = { ...emptyProfile, workHistory: [{ id: '1', company: 'Acme' }] };
    expect(calculateCompleteness(profile)).toBe(40);
  });

  test('returns 100 for full profile', () => {
    const profile: Profile = {
      contactInfo: { email: 'test@test.com' },
      workHistory: [{ id: '1', company: 'Acme' }],
      education: [{ id: '1', school: 'Uni' }],
      skills: ['React', 'Node', 'TS', 'JS', 'CSS'], // 5 skills
      projects: [{ id: '1', title: 'Project' }],
      certifications: [{ id: '1', title: 'Cert' }]
    };
    expect(calculateCompleteness(profile)).toBe(100);
  });
});
