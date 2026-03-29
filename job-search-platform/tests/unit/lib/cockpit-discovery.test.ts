import {
  buildDiscoveryMatcher,
  isKansasCityDiscoveryJob,
  scoreDiscoveryJob,
} from '@/lib/cockpit-discovery';

describe('cockpit-discovery', () => {
  it('builds a matcher from profile experience and skills', () => {
    const matcher = buildDiscoveryMatcher({
      skills: ['AI', 'SaaS', 'Cloud', 'Security'],
      summary: 'Software sales engineer focused on AI platform deals.',
      experiences: [
        {
          position: 'Senior Solutions Engineer',
          description: 'Supported enterprise AI software sales.',
          company: 'Acme',
        },
      ],
    });

    expect(matcher.roleTerms).toContain('solutions engineer');
    expect(matcher.domainTerms).toContain('ai');
    expect(matcher.locationTerms).toContain('kansas city');
  });

  it('detects Kansas City metro discovery jobs', () => {
    expect(isKansasCityDiscoveryJob('Overland Park, Kansas')).toBe(true);
    expect(isKansasCityDiscoveryJob('Kansas City, Missouri')).toBe(true);
    expect(isKansasCityDiscoveryJob('Austin, Texas')).toBe(false);
  });

  it('scores aligned sales engineering jobs above unrelated jobs', () => {
    const matcher = buildDiscoveryMatcher({
      skills: ['AI', 'SaaS', 'Cloud'],
      summary: 'Solutions engineer for AI SaaS platforms.',
      experiences: [
        {
          position: 'Solutions Engineer',
          description: 'Pre-sales architecture for software platform deals.',
          company: 'Northwind',
        },
      ],
    });

    const aligned = scoreDiscoveryJob(
      {
        title: 'Senior AI Solutions Engineer',
        company: 'CloudCo',
        location: 'Kansas City, Missouri',
        description: 'Lead pre-sales discovery and technical SaaS demos for AI platform buyers.',
        skillsTags: ['AI', 'Cloud', 'SaaS'],
        compositeScore: 0.92,
        postedAt: '2026-03-29T00:00:00.000Z',
      },
      matcher,
    );

    const unrelated = scoreDiscoveryJob(
      {
        title: 'Nurse Manager',
        company: 'HealthCo',
        location: 'Kansas City, Missouri',
        description: 'Clinical operations leadership for inpatient nursing teams.',
        skillsTags: ['Care Delivery'],
        compositeScore: 0.2,
        postedAt: '2026-03-29T00:00:00.000Z',
      },
      matcher,
    );

    expect(aligned).toBeGreaterThan(unrelated);
  });
});
