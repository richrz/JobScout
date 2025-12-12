/**
 * Job Service - Database Persistence Layer
 * 
 * This module handles saving scraped jobs to the PostgreSQL database
 * with geocoding integration and upsert logic to prevent duplicates.
 */

import { prisma } from '@/lib/prisma';
import { JobListing } from './job-scrapers';
import { geocodeLocation } from './geocoding';

/**
 * Save jobs to the database with geocoding
 * 
 * @param jobs - Array of scraped job listings
 * @returns Promise that resolves when all jobs are saved
 */
export async function saveJobs(jobs: JobListing[]): Promise<void> {
    for (const job of jobs) {
        // Attempt to geocode the location
        let coords: { lat: number; lng: number } | null = null;
        try {
            coords = await geocodeLocation(job.location);
        } catch (error) {
            console.warn(`Failed to geocode location "${job.location}":`, error);
            // Continue with null coordinates
        }

        // Upsert job (update if sourceUrl exists, insert if new)
        await prisma.job.upsert({
            where: { sourceUrl: job.sourceUrl },
            update: {
                title: job.title,
                company: job.company,
                location: job.location,
                latitude: coords?.lat ?? null,
                longitude: coords?.lng ?? null,
                description: job.description,
                salary: job.salary,
                postedAt: job.postedAt || new Date(),
            },
            create: {
                title: job.title,
                company: job.company,
                location: job.location,
                latitude: coords?.lat ?? null,
                longitude: coords?.lng ?? null,
                description: job.description,
                salary: job.salary,
                postedAt: job.postedAt || new Date(),
                source: job.source,
                sourceUrl: job.sourceUrl,
            },
        });
    }

    console.log(`Successfully saved ${jobs.length} jobs to database`);
}
