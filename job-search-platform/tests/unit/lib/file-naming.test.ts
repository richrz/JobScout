import { generateFileName } from '@/lib/file-naming';
import { Job } from '@prisma/client';

describe('generateFileName', () => {
    const mockJob: Job = {
        id: 'job-1',
        title: 'Senior React Developer',
        company: 'Tech Corp Inc.',
        location: 'Remote',
        latitude: 0,
        longitude: 0,
        description: 'Job description',
        salary: '$100k',
        postedAt: new Date('2024-01-15'),
        source: 'LinkedIn',
        sourceUrl: 'http://example.com',
        cityMatch: null,
        distanceMiles: null,
        compositeScore: 0.9,
        createdAt: new Date(),
    };

    it('replaces date placeholders', () => {
        const result = generateFileName('YYYY-MM-DD', mockJob);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('replaces company name', () => {
        const result = generateFileName('{company}', mockJob);
        expect(result).toBe('Tech-Corp-Inc');
    });

    it('replaces role/title', () => {
        const result = generateFileName('{role}', mockJob);
        expect(result).toBe('Senior-React-Developer');
    });

    it('handles complex templates', () => {
        const result = generateFileName('YYYY-MM-DD - {company} - {role}.pdf', mockJob);
        expect(result).toMatch(/^\d{4}-\d{2}-\d{2} - Tech-Corp-Inc - Senior-React-Developer\.pdf$/);
    });

    it('sanitizes special characters', () => {
        const jobWithSpecialChars = {
            ...mockJob,
            company: 'Tech & Co. / Inc.',
            title: 'Developer (Senior)',
        };
        const result = generateFileName('{company} - {role}', jobWithSpecialChars);
        expect(result).toBe('Tech-Co-Inc - Developer-Senior');
    });
});
