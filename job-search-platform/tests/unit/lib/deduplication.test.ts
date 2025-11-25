import { findDuplicates } from '../../../src/lib/deduplication';
import { ScorableJob } from '../../../src/lib/scoring';

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
        // Expect at least the second job to be flagged as duplicate of the first
        expect(duplicates.length).toBeGreaterThan(0);
        const duplicateIds = duplicates.map(d => d.id);
        expect(duplicateIds).toContain('2');
    });
});
