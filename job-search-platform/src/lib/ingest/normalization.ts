
import { JobListing } from '@/lib/job-scrapers';
import { Prisma } from '@prisma/client';

export type NormalizedJob = Prisma.JobCreateInput;

/**
 * Normalizes raw job data into a format suitable for database persistence.
 * Geocoding is currently disabled (map feature paused). Re-enable when needed.
 */
export async function normalizeJobData(rawJob: JobListing): Promise<NormalizedJob> {

    // Geocoding disabled — map feature is paused. No Redis/Google Maps dependency needed.
    // To re-enable: import { geocodeLocation } from '@/lib/geocoding' and call it here.
    const latitude: number | null = null;
    const longitude: number | null = null;

    // Schema Mapping
    return {
        title: rawJob.title,
        company: rawJob.company,
        location: rawJob.location,
        description: rawJob.description,
        salary: rawJob.salary || null,
        source: rawJob.source,
        sourceUrl: rawJob.sourceUrl,
        postedAt: rawJob.postedAt || new Date(),
        latitude,
        longitude,
        // Default values for new fields if any
        cityMatch: null, // Could be derived from geocoding context if available
        distanceMiles: null,
        compositeScore: null,
    };
}
