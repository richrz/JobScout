/**
 * Job Service - Database Persistence Layer
 * 
 * This module handles saving scraped jobs to the PostgreSQL database
 * with geocoding integration and upsert logic to prevent duplicates.
 */

import { prisma } from '@/lib/prisma';
import { JobListing } from './job-scrapers';
import { geocodeLocation } from './geocoding';
import { normalizeJobData } from './ingest/normalization';

/**
 * Save jobs to the database with geocoding
 * 
 * @param jobs - Array of scraped job listings
 * @returns Promise that resolves when all jobs are saved
 */
export async function saveJobs(jobs: JobListing[]): Promise<void> {

    // Normalize and geocode concurrently
    const normalizedJobs = await Promise.all(
        jobs.map(job => normalizeJobData(job))
    );

    // Persist to database
    let savedCount = 0;
    for (const jobData of normalizedJobs) {
        try {
            await prisma.job.upsert({
                where: { sourceUrl: jobData.sourceUrl },
                update: {
                    title: jobData.title,
                    company: jobData.company,
                    location: jobData.location,
                    latitude: jobData.latitude,
                    longitude: jobData.longitude,
                    description: jobData.description,
                    salary: jobData.salary,
                    postedAt: jobData.postedAt,
                    // Don't update source/sourceUrl or createdAt
                    // updatedAt is handled automatically by Prisma @updatedAt
                },
                create: jobData,
            });
            savedCount++;
        } catch (error) {
            console.error(`Failed to save job ${jobData.sourceUrl}:`, error);
        }
    }

    console.log(`Successfully normalized and saved ${savedCount}/${jobs.length} jobs to database`);
}
