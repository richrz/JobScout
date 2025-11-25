import Fuse from 'fuse.js';
import { ScorableJob } from './scoring';

/**
 * Find duplicate job listings based on fuzzy matching of title and company.
 * Returns an array of jobs that are considered duplicates of any earlier job.
 * The FIRST occurrence is preserved; only subsequent matches are marked as duplicates.
 *
 * @param jobs - Array of ScorableJob objects.
 * @param threshold - Fuse.js similarity threshold (0.0 exact, 1.0 match all). Default 0.3.
 * @returns Array of jobs that are duplicates (excludes the first occurrence of each group)
 */
export function findDuplicates(jobs: ScorableJob[], threshold: number = 0.3): ScorableJob[] {
    const options = {
        keys: ['title', 'company'],
        includeScore: true,
        threshold,
    };

    const seenJobs: ScorableJob[] = [];
    const duplicateIds = new Set<string>();

    // Process jobs in order - first occurrence is kept, later ones are marked as duplicates
    for (const job of jobs) {
        const fuse = new Fuse(seenJobs, options);
        const results = fuse.search(job.title);

        // Check if this job matches any previously seen job
        const isDuplicate = results.some(res =>
            res.score !== undefined && res.score <= threshold
        );

        if (isDuplicate) {
            duplicateIds.add(job.id);
        } else {
            seenJobs.push(job);
        }
    }

    return jobs.filter(j => duplicateIds.has(j.id));
}

/**
 * Remove duplicate job listings, keeping only the first occurrence.
 * 
 * @param jobs - Array of ScorableJob objects.
 * @param threshold - Fuse.js similarity threshold (0.0 exact, 1.0 match all). Default 0.3.
 * @returns Array of unique jobs with duplicates removed
 */
export function deduplicateJobs(jobs: ScorableJob[], threshold: number = 0.3): ScorableJob[] {
    const duplicateIds = new Set(findDuplicates(jobs, threshold).map(j => j.id));
    return jobs.filter(j => !duplicateIds.has(j.id));
}
