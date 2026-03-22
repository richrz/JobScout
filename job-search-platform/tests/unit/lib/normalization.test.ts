import {
    buildFingerprint,
    classifyWorkMode,
    classifySeniority,
    extractSkillTags,
    computeConfidence,
} from '@/lib/ingest/normalization';

describe('buildFingerprint', () => {
    it('returns a 64-char hex SHA256', () => {
        const fp = buildFingerprint('Garmin', 'Software Engineer', 'Olathe, KS');
        expect(fp).toMatch(/^[a-f0-9]{64}$/);
    });

    it('is stable — same input always produces same hash', () => {
        const fp1 = buildFingerprint('Garmin', 'Software Engineer', 'Olathe, KS');
        const fp2 = buildFingerprint('Garmin', 'Software Engineer', 'Olathe, KS');
        expect(fp1).toBe(fp2);
    });

    it('is case-insensitive', () => {
        const fp1 = buildFingerprint('GARMIN', 'SOFTWARE ENGINEER', 'OLATHE, KS');
        const fp2 = buildFingerprint('garmin', 'software engineer', 'olathe, ks');
        expect(fp1).toBe(fp2);
    });

    it('strips punctuation variation', () => {
        const fp1 = buildFingerprint('Garmin, Inc.', 'Software Engineer', 'Olathe KS');
        const fp2 = buildFingerprint('Garmin Inc', 'Software Engineer', 'Olathe KS');
        expect(fp1).toBe(fp2);
    });

    it('distinguishes different companies', () => {
        const fp1 = buildFingerprint('Garmin', 'Software Engineer', 'Olathe, KS');
        const fp2 = buildFingerprint('Cerner', 'Software Engineer', 'Olathe, KS');
        expect(fp1).not.toBe(fp2);
    });
});

describe('classifyWorkMode', () => {
    it('detects remote', () => {
        expect(classifyWorkMode('Remote Software Engineer', 'Remote', '')).toBe('remote');
        expect(classifyWorkMode('Engineer', 'Kansas City, MO', 'This is a fully remote position')).toBe('remote');
    });

    it('detects hybrid', () => {
        expect(classifyWorkMode('Engineer', 'Kansas City, MO', 'Hybrid schedule — 3 days in office')).toBe('hybrid');
    });

    it('detects onsite', () => {
        expect(classifyWorkMode('Engineer', 'Olathe, KS', 'Must work on-site daily')).toBe('onsite');
    });

    it('returns unknown when no signal', () => {
        expect(classifyWorkMode('Engineer', 'Kansas City, MO', 'Great opportunity for a skilled developer')).toBe('unknown');
    });

    it('prefers remote over hybrid when both signals present', () => {
        expect(classifyWorkMode('Remote Engineer', 'Kansas City', 'hybrid schedule available')).toBe('remote');
    });
});

describe('classifySeniority', () => {
    it('detects senior', () => {
        expect(classifySeniority('Senior Software Engineer')).toBe('senior');
        expect(classifySeniority('Sr. Developer')).toBe('senior');
        expect(classifySeniority('Lead Engineer')).toBe('senior');
    });

    it('detects staff_plus', () => {
        expect(classifySeniority('Staff Engineer')).toBe('staff_plus');
        expect(classifySeniority('Principal Software Engineer')).toBe('staff_plus');
        expect(classifySeniority('VP of Engineering')).toBe('staff_plus');
    });

    it('detects entry level', () => {
        expect(classifySeniority('Junior Developer')).toBe('entry');
        expect(classifySeniority('Associate Software Engineer')).toBe('entry');
    });

    it('returns unknown for mid-level without clear signal', () => {
        expect(classifySeniority('Software Engineer')).toBe('unknown');
    });
});

describe('extractSkillTags', () => {
    it('extracts known skills from text', () => {
        const tags = extractSkillTags('We need Python and React experience. AWS is a plus.');
        expect(tags).toContain('Python');
        expect(tags).toContain('React');
        expect(tags).toContain('AWS');
    });

    it('handles C++ and C# without regex errors', () => {
        expect(() => extractSkillTags('Requires C++ or C# experience')).not.toThrow();
        const tags = extractSkillTags('Requires C++ or C# experience');
        expect(tags).toContain('C++');
        expect(tags).toContain('C#');
    });

    it('is case-insensitive', () => {
        const tags = extractSkillTags('experience with python and REACT');
        expect(tags).toContain('Python');
        expect(tags).toContain('React');
    });

    it('returns empty array when no skills found', () => {
        expect(extractSkillTags('Great culture and competitive salary')).toEqual([]);
    });

    it('does not match partial words', () => {
        // "Golang" should not match "Go" as a separate word boundary issue
        const tags = extractSkillTags('Using Golang for backend services');
        // "Go" should not match inside "Golang" due to word boundary
        expect(tags).not.toContain('Go');
    });
});

describe('computeConfidence', () => {
    it('returns 1.0 for a fully populated record', () => {
        expect(computeConfidence({
            salary: '$120k',
            postedAt: new Date(),
            description: 'A'.repeat(200),
            location: 'Kansas City, MO',
        })).toBe(1.0);
    });

    it('deducts for missing salary', () => {
        const score = computeConfidence({
            salary: null,
            postedAt: new Date(),
            description: 'A'.repeat(200),
            location: 'Kansas City, MO',
        });
        expect(score).toBeLessThan(1.0);
    });

    it('deducts for missing postedAt', () => {
        const score = computeConfidence({
            salary: '$120k',
            postedAt: null,
            description: 'A'.repeat(200),
            location: 'Kansas City, MO',
        });
        expect(score).toBeLessThan(1.0);
    });

    it('deducts for short description', () => {
        const score = computeConfidence({
            salary: '$120k',
            postedAt: new Date(),
            description: 'Short',
            location: 'Kansas City, MO',
        });
        expect(score).toBeLessThan(1.0);
    });

    it('never returns below 0', () => {
        const score = computeConfidence({
            salary: null,
            postedAt: null,
            description: '',
            location: 'unknown',
        });
        expect(score).toBeGreaterThanOrEqual(0);
    });
});
