import { describe, it, expect, beforeEach } from '@jest/globals';
import {
    calculateJobScore,
    rankJobs,
    type ScoringWeights,
    type ScorableJob
} from '../../../src/lib/scoring';

describe('Job Scoring Algorithm - TDD RED PHASE', () => {
    let mockJob: ScorableJob;
    let defaultWeights: ScoringWeights;

    beforeEach(() => {
        mockJob = {
            id: '1',
            title: 'Senior Software Engineer',
            description: 'We are looking for a React and Node.js expert with TypeScript experience.',
            salary: { min: 120000, max: 160000, currency: 'USD' },
            postedAt: new Date(), // Now
            distance: 10, // 10km away
            skills: ['React', 'Node.js', 'TypeScript', 'AWS']
        };

        defaultWeights = {
            keywords: 0.4,
            recency: 0.2,
            salary: 0.2,
            distance: 0.2
        };
    });

    describe('Keyword Scoring', () => {
        it('should calculate score based on keyword matches in title and description', () => {
            const keywords = ['React', 'TypeScript'];
            // Should match both keywords
            const score = calculateJobScore(mockJob, { keywords }, { ...defaultWeights, keywords: 1, recency: 0, salary: 0, distance: 0 });

            expect(score).toBeGreaterThan(0);
        });

        it('should give higher score for title matches than description matches', () => {
            const titleJob = { ...mockJob, title: 'React Developer', description: 'Generic coding' };
            const descJob = { ...mockJob, title: 'Generic Developer', description: 'Work with React' };

            const keywords = ['React'];
            const weights = { ...defaultWeights, keywords: 1, recency: 0, salary: 0, distance: 0 };

            const titleScore = calculateJobScore(titleJob, { keywords }, weights);
            const descScore = calculateJobScore(descJob, { keywords }, weights);

            expect(titleScore).toBeGreaterThan(descScore);
        });

        it('should handle partial matches', () => {
            const job = { ...mockJob, title: 'Software Engineer', description: 'Java experience' };
            const keywords = ['Javascript']; // No match
            const weights = { ...defaultWeights, keywords: 1, recency: 0, salary: 0, distance: 0 };

            const score = calculateJobScore(job, { keywords }, weights);
            expect(score).toBe(0);
        });
    });

    describe('Recency Scoring', () => {
        it('should give higher score to more recent jobs', () => {
            const today = new Date();
            const yesterday = new Date(today);
            yesterday.setDate(yesterday.getDate() - 1);

            const lastWeek = new Date(today);
            lastWeek.setDate(lastWeek.getDate() - 7);

            const recentJob = { ...mockJob, postedAt: yesterday };
            const oldJob = { ...mockJob, postedAt: lastWeek };

            const weights = { ...defaultWeights, keywords: 0, recency: 1, salary: 0, distance: 0 };

            const recentScore = calculateJobScore(recentJob, {}, weights);
            const oldScore = calculateJobScore(oldJob, {}, weights);

            expect(recentScore).toBeGreaterThan(oldScore);
        });
    });

    describe('Salary Scoring', () => {
        it('should score based on target salary overlap', () => {
            const highPayingJob = { ...mockJob, salary: { min: 150000, max: 200000, currency: 'USD' } };
            const lowPayingJob = { ...mockJob, salary: { min: 80000, max: 100000, currency: 'USD' } };

            const targetSalary = 140000;
            const weights = { ...defaultWeights, keywords: 0, recency: 0, salary: 1, distance: 0 };

            const highScore = calculateJobScore(highPayingJob, { targetSalary }, weights);
            const lowScore = calculateJobScore(lowPayingJob, { targetSalary }, weights);

            expect(highScore).toBeGreaterThan(lowScore);
        });

        it('should handle jobs without salary info gracefully', () => {
            const noSalaryJob = { ...mockJob, salary: undefined };
            const weights = { ...defaultWeights, keywords: 0, recency: 0, salary: 1, distance: 0 };

            const score = calculateJobScore(noSalaryJob, { targetSalary: 100000 }, weights);
            // Should probably return a neutral score or 0 depending on strategy, let's expect 0 for now
            expect(score).toBe(0);
        });
    });

    describe('Distance Scoring', () => {
        it('should give higher score to closer jobs', () => {
            const closeJob = { ...mockJob, distance: 5 }; // 5km
            const farJob = { ...mockJob, distance: 50 }; // 50km

            const weights = { ...defaultWeights, keywords: 0, recency: 0, salary: 0, distance: 1 };

            const closeScore = calculateJobScore(closeJob, {}, weights);
            const farScore = calculateJobScore(farJob, {}, weights);

            expect(closeScore).toBeGreaterThan(farScore);
        });
    });

    describe('Composite Ranking', () => {
        it('should rank jobs correctly based on total weighted score', () => {
            const jobs: ScorableJob[] = [
                { ...mockJob, id: '1', title: 'Perfect Match', distance: 5, postedAt: new Date() }, // High score
                { ...mockJob, id: '2', title: 'Bad Match', distance: 100, postedAt: new Date(Date.now() - 86400000 * 30) } // Low score
            ];

            const keywords = ['Match'];
            const ranked = rankJobs(jobs, { keywords }, defaultWeights);

            expect(ranked[0].id).toBe('1');
            expect(ranked[1].id).toBe('2');
            expect(ranked[0].score).toBeGreaterThan(ranked[1].score!);
        });
    });
});
