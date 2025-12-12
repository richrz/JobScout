import { saveJobs } from '@/lib/job-service';
import { prisma } from '@/lib/prisma';
import { geocodeLocation } from '@/lib/geocoding';
import { JobListing } from '@/lib/job-scrapers';

// Mock dependencies
jest.mock('@/lib/prisma', () => ({
    prisma: {
        job: {
            upsert: jest.fn(),
        },
    },
}));

jest.mock('@/lib/geocoding');

describe('job-service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('saveJobs', () => {
        it('should save jobs to database with geocoded coordinates', async () => {
            const mockGeocodeLocation = geocodeLocation as jest.MockedFunction<typeof geocodeLocation>;
            mockGeocodeLocation.mockResolvedValue({ lat: 37.7749, lng: -122.4194 });

            const mockJobs: JobListing[] = [
                {
                    title: 'Software Engineer',
                    company: 'Tech Corp',
                    location: 'San Francisco, CA',
                    description: 'Great job opportunity',
                    source: 'indeed',
                    sourceUrl: 'https://indeed.com/job/123',
                    salary: '$150k - $200k',
                    postedAt: new Date('2025-12-01'),
                    scrapedAt: new Date(),
                },
            ];

            await saveJobs(mockJobs);

            expect(geocodeLocation).toHaveBeenCalledWith('San Francisco, CA');
            expect(prisma.job.upsert).toHaveBeenCalledWith({
                where: { sourceUrl: 'https://indeed.com/job/123' },
                update: expect.objectContaining({
                    title: 'Software Engineer',
                    company: 'Tech Corp',
                    location: 'San Francisco, CA',
                    latitude: 37.7749,
                    longitude: -122.4194,
                    description: 'Great job opportunity',
                    salary: '$150k - $200k',
                }),
                create: expect.objectContaining({
                    title: 'Software Engineer',
                    company: 'Tech Corp',
                    location: 'San Francisco, CA',
                    latitude: 37.7749,
                    longitude: -122.4194,
                    description: 'Great job opportunity',
                    salary: '$150k - $200k',
                    source: 'indeed',
                    sourceUrl: 'https://indeed.com/job/123',
                }),
            });
        });

        it('should handle geocoding failures gracefully', async () => {
            const mockGeocodeLocation = geocodeLocation as jest.MockedFunction<typeof geocodeLocation>;
            mockGeocodeLocation.mockRejectedValue(new Error('Geocoding API error'));

            const mockJobs: JobListing[] = [
                {
                    title: 'Remote Developer',
                    company: 'Startup Inc',
                    location: 'Remote',
                    description: 'Work from anywhere',
                    source: 'linkedin',
                    sourceUrl: 'https://linkedin.com/job/456',
                    scrapedAt: new Date(),
                },
            ];

            await saveJobs(mockJobs);

            expect(prisma.job.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    create: expect.objectContaining({
                        latitude: null,
                        longitude: null,
                        location: 'Remote',
                    }),
                })
            );
        });

        it('should process multiple jobs in sequence', async () => {
            const mockGeocodeLocation = geocodeLocation as jest.MockedFunction<typeof geocodeLocation>;
            mockGeocodeLocation
                .mockResolvedValueOnce({ lat: 37.7749, lng: -122.4194 })
                .mockResolvedValueOnce({ lat: 40.7128, lng: -74.0060 });

            const mockJobs: JobListing[] = [
                {
                    title: 'Job 1',
                    company: 'Company 1',
                    location: 'San Francisco, CA',
                    description: 'Description 1',
                    source: 'indeed',
                    sourceUrl: 'https://indeed.com/job/1',
                    scrapedAt: new Date(),
                },
                {
                    title: 'Job 2',
                    company: 'Company 2',
                    location: 'New York, NY',
                    description: 'Description 2',
                    source: 'linkedin',
                    sourceUrl: 'https://linkedin.com/job/2',
                    scrapedAt: new Date(),
                },
            ];

            await saveJobs(mockJobs);

            expect(prisma.job.upsert).toHaveBeenCalledTimes(2);
            expect(geocodeLocation).toHaveBeenCalledTimes(2);
        });

        it('should handle missing optional fields', async () => {
            const mockGeocodeLocation = geocodeLocation as jest.MockedFunction<typeof geocodeLocation>;
            mockGeocodeLocation.mockResolvedValue({ lat: 37.7749, lng: -122.4194 });

            const mockJobs: JobListing[] = [
                {
                    title: 'Basic Job',
                    company: 'Company',
                    location: 'Location',
                    description: 'Description',
                    source: 'company',
                    sourceUrl: 'https://company.com/job/1',
                    scrapedAt: new Date(),
                    // No salary, no postedAt
                },
            ];

            await saveJobs(mockJobs);

            expect(prisma.job.upsert).toHaveBeenCalledWith(
                expect.objectContaining({
                    create: expect.objectContaining({
                        salary: undefined,
                        postedAt: expect.any(Date),
                    }),
                })
            );
        });
    });
});
