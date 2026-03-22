import { classifyAts, isCleanJsonSource, detectAtsSystem } from '@/lib/ingest/ats-classifier';

describe('classifyAts', () => {
    describe('Greenhouse', () => {
        it('classifies boards.greenhouse.io as cleanJson', () => {
            const result = classifyAts('https://boards.greenhouse.io/garmin/jobs/7883944002');
            expect(result.system).toBe('greenhouse');
            expect(result.cleanJson).toBe(true);
            expect(result.skipLlm).toBe(true);
        });
    });

    describe('Lever', () => {
        it('classifies jobs.lever.co as cleanJson', () => {
            const result = classifyAts('https://jobs.lever.co/stripe/abc123');
            expect(result.system).toBe('lever');
            expect(result.cleanJson).toBe(true);
        });
    });

    describe('NeoGov', () => {
        it('classifies governmentjobs.com as cleanJson', () => {
            const result = classifyAts('https://www.governmentjobs.com/careers/kansascity');
            expect(result.system).toBe('neogov');
            expect(result.cleanJson).toBe(true);
        });
    });

    describe('USAJOBS', () => {
        it('classifies usajobs.gov as cleanJson', () => {
            const result = classifyAts('https://www.usajobs.gov/job/123456789');
            expect(result.system).toBe('usajobs');
            expect(result.cleanJson).toBe(true);
        });
    });

    describe('Workday', () => {
        it('classifies myworkdayjobs.com as NOT cleanJson', () => {
            const result = classifyAts('https://garmin.wd5.myworkday.com/garmin/job/Olathe-KS/Software-Engineer_R-29101');
            expect(result.system).toBe('workday');
            expect(result.cleanJson).toBe(false);
            expect(result.skipLlm).toBe(false);
        });
    });

    describe('iCIMS', () => {
        it('classifies icims.com URLs as NOT cleanJson', () => {
            const result = classifyAts('https://careers-somecompany.icims.com/jobs/1234/job');
            expect(result.system).toBe('icims');
            expect(result.cleanJson).toBe(false);
        });
    });

    describe('Unknown sources', () => {
        it('returns unknown for unrecognized URLs', () => {
            const result = classifyAts('https://careers.randomcompany.com/jobs/engineer');
            expect(result.system).toBe('unknown');
            expect(result.cleanJson).toBe(false);
            expect(result.skipLlm).toBe(false);
        });

        it('handles empty URL safely', () => {
            const result = classifyAts('');
            expect(result.system).toBe('unknown');
            expect(result.cleanJson).toBe(false);
        });
    });
});

describe('isCleanJsonSource', () => {
    it('returns true for Greenhouse', () => {
        expect(isCleanJsonSource('https://boards.greenhouse.io/stripe/jobs/123')).toBe(true);
    });

    it('returns false for Workday', () => {
        expect(isCleanJsonSource('https://company.myworkdayjobs.com/jobs/123')).toBe(false);
    });

    it('returns false for unknown URLs', () => {
        expect(isCleanJsonSource('https://example.com/careers')).toBe(false);
    });
});

describe('detectAtsSystem', () => {
    it('returns the ATS system name', () => {
        expect(detectAtsSystem('https://jobs.lever.co/company/123')).toBe('lever');
        expect(detectAtsSystem('https://www.usajobs.gov/job/123')).toBe('usajobs');
        expect(detectAtsSystem('https://randomsite.com/jobs')).toBe('unknown');
    });
});
