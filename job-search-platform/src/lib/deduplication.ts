import Fuse from 'fuse.js';
import { ScorableJob } from './scoring';

/**
 * Find duplicate job listings based on fuzzy matching of title and company.
 * Returns an array of jobs that are considered duplicates of any earlier job.
 *
 * @param jobs - Array of ScorableJob objects.
 * @param threshold - Fuse.js similarity threshold (0.0 exact, 1.0 match all). Default 0.3.
 */
export function findDuplicates(jobs: ScorableJob[], threshold: number = 0.3): ScorableJob[] {
    const options = {
        keys: ['title', 'company'],
        includeScore: true,
        threshold,
    } as const;

    const fuse = new Fuse(jobs, options);
    const duplicateIds = new Set<string>();

    // For each job, search for similar ones; if a match with lower score is found, mark as duplicate.
    jobs.forEach(job => {
        const results = fuse.search(job.title);
        results.forEach(res => {
            if (res.item.id !== job.id && res.score !== undefined && res.score <= threshold) {
                duplicateIds.add(res.item.id);
            }
        });
    });

    return jobs.filter(j => duplicateIds.has(j.id));
}
