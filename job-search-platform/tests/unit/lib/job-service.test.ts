import { saveJobs } from '@/lib/job-service';
import { prisma } from '@/lib/prisma';
import { JobListing } from '@/lib/job-scrapers';

// Mock Prisma with the three-path approach (findUnique → update/create)
jest.mock('@/lib/prisma', () => ({
    prisma: {
        job: {
            findUnique: jest.fn().mockResolvedValue(null), // default: no existing record
            create: jest.fn().mockResolvedValue({ id: 'job-1', ctsJobName: null }),
            update: jest.fn().mockResolvedValue({ id: 'job-1', ctsJobName: null }),
        },
    },
}));

jest.mock('@/lib/cts/talent-service', () => ({
    isCtsEnabled: jest.fn().mockReturnValue(false),
    upsertJob: jest.fn(),
}));

const mockFindUnique = prisma.job.findUnique as jest.Mock;
const mockCreate = prisma.job.create as jest.Mock;
const mockUpdate = prisma.job.update as jest.Mock;

const baseJob: JobListing = {
    title: 'Software Engineer',
    company: 'Tech Corp',
    location: 'Kansas City, MO',
    description: 'Great job opportunity',
    source: 'indeed',
    sourceUrl: 'https://indeed.com/job/123',
    salary: '$150k - $200k',
    postedAt: new Date('2026-03-01'),
    scrapedAt: new Date(),
};

describe('job-service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockFindUnique.mockResolvedValue(null); // default: no existing record
        mockCreate.mockResolvedValue({ id: 'job-1', ctsJobName: null });
        mockUpdate.mockResolvedValue({ id: 'job-1', ctsJobName: null });
    });

    describe('saveJobs — path 3: new job insert', () => {
        it('creates a new record when sourceUrl and fingerprint are both new', async () => {
            await saveJobs([baseJob]);
            // findUnique called twice: once for sourceUrl, once for fingerprint
            expect(mockFindUnique).toHaveBeenCalled();
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        title: 'Software Engineer',
                        company: 'Tech Corp',
                        source: 'indeed',
                        sourceUrl: 'https://indeed.com/job/123',
                        normalizationVersion: '1.0',
                    }),
                })
            );
        });

        it('populates P0 fields on new records', async () => {
            await saveJobs([baseJob]);
            expect(mockCreate).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        sourceType: 'api',
                        workMode: expect.any(String),
                        seniority: expect.any(String),
                        skillsTags: expect.any(Array),
                        recordConfidence: expect.any(Number),
                        lastExtractedAt: expect.any(Date),
                    }),
                })
            );
        });
    });

    describe('saveJobs — path 1: sourceUrl refresh', () => {
        it('updates existing record when sourceUrl already exists', async () => {
            const existing = { id: 'existing-1', fingerprint: null, ctsJobName: null };
            // First findUnique (by sourceUrl) returns the existing row
            mockFindUnique.mockResolvedValueOnce(existing);

            await saveJobs([baseJob]);

            expect(mockCreate).not.toHaveBeenCalled();
            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'existing-1' },
                    data: expect.objectContaining({
                        title: 'Software Engineer',
                        normalizationVersion: '1.0',
                    }),
                })
            );
        });
    });

    describe('saveJobs — path 2: cross-source dedup', () => {
        it('updates canonical record when fingerprint matches but sourceUrl is new', async () => {
            const existingByFingerprint = { id: 'canonical-1', fingerprint: 'abc123', ctsJobName: null };
            // sourceUrl lookup: null (new URL), fingerprint lookup: found
            mockFindUnique
                .mockResolvedValueOnce(null)           // sourceUrl not found
                .mockResolvedValueOnce(existingByFingerprint); // fingerprint found

            await saveJobs([baseJob]);

            expect(mockCreate).not.toHaveBeenCalled();
            expect(mockUpdate).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: { id: 'canonical-1' },
                })
            );
        });
    });

    describe('saveJobs — multiple jobs', () => {
        it('processes multiple jobs independently', async () => {
            const jobs: JobListing[] = [
                { ...baseJob, sourceUrl: 'https://indeed.com/job/1', title: 'Job 1' },
                { ...baseJob, sourceUrl: 'https://indeed.com/job/2', title: 'Job 2', company: 'Other Corp' },
            ];

            await saveJobs(jobs);

            // Each job does at least one findUnique
            expect(mockFindUnique).toHaveBeenCalledTimes(4); // 2 per job (sourceUrl + fingerprint)
            expect(mockCreate).toHaveBeenCalledTimes(2);
        });
    });

    describe('saveJobs — error handling', () => {
        it('continues processing remaining jobs when one fails', async () => {
            mockCreate
                .mockRejectedValueOnce(new Error('DB error'))
                .mockResolvedValueOnce({ id: 'job-2', ctsJobName: null });

            const jobs: JobListing[] = [
                { ...baseJob, sourceUrl: 'https://indeed.com/job/fail' },
                { ...baseJob, sourceUrl: 'https://indeed.com/job/success', company: 'Other Corp' },
            ];

            // Should not throw
            await expect(saveJobs(jobs)).resolves.not.toThrow();
        });
    });
});
