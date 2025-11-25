import { findDuplicates, deduplicateJobs } from '../../../src/lib/deduplication';
import { ScorableJob } from '../../../src/lib/scoring';

describe('Deduplication', () => {
    describe('findDuplicates', () => {
        it('should identify duplicate job titles', () => {
            const jobs: ScorableJob[] = [
                {
                    id: '1',
                    title: 'Senior Software Engineer',
                    description: 'Develop awesome apps',
                    postedAt: new Date(),
                },
                {
                    id: '2',
                    title: 'Senior Software Engineer',
                    description: 'Work on cool projects',
                    postedAt: new Date(),
                },
                {
                    id: '3',
                    title: 'Junior Developer',
                    description: 'Entry level role',
                    postedAt: new Date(),
                },
            ];

            const duplicates = findDuplicates(jobs, 0.3);

            // Only job 2 should be marked as duplicate (job 1 is the first occurrence)
            expect(duplicates.length).toBe(1);
            expect(duplicates[0].id).toBe('2');
        });

        it('should NOT mark the first occurrence as a duplicate', () => {
            const jobs: ScorableJob[] = [
                { id: '1', title: 'Backend Developer', description: 'Build APIs', postedAt: new Date() },
                { id: '2', title: 'Backend Developer', description: 'Create services', postedAt: new Date() },
                { id: '3', title: 'Backend Developer', description: 'Design systems', postedAt: new Date() },
            ];

            const duplicates = findDuplicates(jobs, 0.3);

            // Jobs 2 and 3 should be duplicates, but NOT job 1 (first occurrence)
            expect(duplicates.length).toBe(2);
            const duplicateIds = duplicates.map(d => d.id);
            expect(duplicateIds).not.toContain('1');
            expect(duplicateIds).toContain('2');
            expect(duplicateIds).toContain('3');
        });

        it('should return empty array when no duplicates exist', () => {
            const jobs: ScorableJob[] = [
                { id: '1', title: 'Frontend Developer', description: 'Build UIs', postedAt: new Date() },
                { id: '2', title: 'Backend Engineer', description: 'Build APIs', postedAt: new Date() },
                { id: '3', title: 'DevOps Specialist', description: 'Manage infra', postedAt: new Date() },
            ];

            const duplicates = findDuplicates(jobs, 0.3);
            expect(duplicates.length).toBe(0);
        });
    });

    describe('deduplicateJobs', () => {
        it('should remove duplicates and preserve first occurrence', () => {
            const jobs: ScorableJob[] = [
                { id: '1', title: 'Data Scientist', description: 'Analyze data', postedAt: new Date() },
                { id: '2', title: 'Data Scientist', description: 'Build models', postedAt: new Date() },
                { id: '3', title: 'ML Engineer', description: 'Deploy models', postedAt: new Date() },
            ];

            const unique = deduplicateJobs(jobs, 0.3);

            // Should have 2 jobs: job 1 (first Data Scientist) and job 3 (ML Engineer)
            expect(unique.length).toBe(2);
            const uniqueIds = unique.map(j => j.id);
            expect(uniqueIds).toContain('1'); // First occurrence preserved
            expect(uniqueIds).not.toContain('2'); // Duplicate removed
            expect(uniqueIds).toContain('3'); // Unique job preserved
        });

        it('should handle empty input', () => {
            const jobs: ScorableJob[] = [];
            const unique = deduplicateJobs(jobs, 0.3);
            expect(unique.length).toBe(0);
        });

        it('should return all jobs when no duplicates exist', () => {
            const jobs: ScorableJob[] = [
                { id: '1', title: 'Product Manager', description: 'Lead product', postedAt: new Date() },
                { id: '2', title: 'UX Designer', description: 'Design interfaces', postedAt: new Date() },
            ];

            const unique = deduplicateJobs(jobs, 0.3);
            expect(unique.length).toBe(2);
            expect(unique).toEqual(jobs);
        });
    });
});
