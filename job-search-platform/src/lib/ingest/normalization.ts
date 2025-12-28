
import { JobListing } from '@/lib/job-scrapers';
import { geocodeLocation } from '@/lib/geocoding';
import { Prisma } from '@prisma/client';

export type NormalizedJob = Prisma.JobCreateInput;

/**
 * Normalizes raw job data into a format suitable for database persistence.
 * Includes geocoding and default value assignment.
 */
export async function normalizeJobData(rawJob: JobListing): Promise<NormalizedJob> {

    // 1. Geocoding
    let latitude: number | null = null;
    let longitude: number | null = null;

    try {
        if (rawJob.location) {
            const coords = await geocodeLocation(rawJob.location);
            if (coords) {
                latitude = coords.lat;
                longitude = coords.lng;
            }
        }
    } catch (error) {
        console.warn(`Geocoding failed for ${rawJob.location}:`, error);
        // Continue without coords
    }

    // 2. Schema Mapping
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
