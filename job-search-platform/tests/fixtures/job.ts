/**
 * Shared test fixtures for Job-related types.
 *
 * Always include ALL fields from the Prisma Job model so fixtures don't
 * become stale when new nullable columns are added. New columns default to
 * null here — override only what the test actually cares about.
 */

type JobOverrides = {
    id?: string; title?: string; company?: string; location?: string;
    latitude?: number | null; longitude?: number | null; description?: string;
    salary?: string | null; postedAt?: Date; source?: string; sourceUrl?: string;
    ctsJobName?: string | null; cityMatch?: string | null; distanceMiles?: number | null;
    compositeScore?: number | null; createdAt?: Date;
    sourceType?: string | null; canonicalUrl?: string | null; fingerprint?: string | null;
    lastExtractedAt?: Date | null; recordConfidence?: number | null; normalizationVersion?: string | null;
    salaryMin?: number | null; salaryMax?: number | null; salaryCurrency?: string | null;
    workMode?: string | null; seniority?: string | null; skillsTags?: string[];
    companyId?: string | null;
};

export function makeJob(overrides: JobOverrides = {}) {
    return {
        id: 'job-1',
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Kansas City, MO',
        latitude: null,
        longitude: null,
        description: 'A great job description.',
        salary: '$100k',
        postedAt: new Date('2026-03-01'),
        source: 'indeed',
        sourceUrl: 'https://example.com/jobs/1',
        ctsJobName: null,
        cityMatch: null,
        distanceMiles: null,
        compositeScore: null,
        createdAt: new Date('2026-03-01'),
        // P0 provenance fields
        sourceType: null,
        canonicalUrl: null,
        fingerprint: null,
        lastExtractedAt: null,
        recordConfidence: null,
        normalizationVersion: null,
        // P0 structured fields
        salaryMin: null,
        salaryMax: null,
        salaryCurrency: 'USD',
        workMode: null,
        seniority: null,
        skillsTags: [] as string[],
        // P1 company entity FK
        companyId: null,
        ...overrides,
    };
}
