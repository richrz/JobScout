/**
 * Job Service - Database Persistence Layer
 *
 * Dual-writes jobs to Postgres (user state) and Cloud Talent Solution (search).
 * CTS ingestion is best-effort — Postgres is always the source of truth.
 */

import { prisma } from '@/lib/prisma';
import { JobListing } from './job-scrapers';
import { normalizeJobData } from './ingest/normalization';
import { upsertJob, isCtsEnabled, type CtsJobInput } from './cts/talent-service';

/**
 * Save jobs to the database with optional CTS sync.
 */
export async function saveJobs(jobs: JobListing[]): Promise<void> {
    // Normalize concurrently
    const normalizedJobs = await Promise.all(
        jobs.map(job => normalizeJobData(job))
    );

    // Persist to Postgres and push to CTS
    let savedCount = 0;
    const ctsEnabled = isCtsEnabled();

    for (const jobData of normalizedJobs) {
        try {
            const saved = await prisma.job.upsert({
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
                },
                create: jobData,
            });
            savedCount++;

            // Push to CTS (best-effort — don't block ingestion if CTS fails)
            if (ctsEnabled && !saved.ctsJobName) {
                pushToCts(saved).catch((err) => {
                    console.warn(`CTS: Failed to push job ${saved.id}:`, err?.message || err);
                });
            }
        } catch (error) {
            console.error(`Failed to save job ${jobData.sourceUrl}:`, error);
        }
    }

    console.log(`Successfully saved ${savedCount}/${jobs.length} jobs to database${ctsEnabled ? ' (+ CTS sync)' : ''}`);
}

/**
 * Push a single Postgres job to CTS and save the CTS resource name back.
 */
async function pushToCts(job: {
    id: string;
    title: string;
    company: string;
    description: string;
    location: string;
    salary: string | null;
    sourceUrl: string;
    postedAt: Date;
    source: string;
}): Promise<void> {
    const input: CtsJobInput = {
        postgresId: job.id,
        title: job.title,
        company: job.company,
        description: job.description,
        location: job.location,
        salary: job.salary,
        sourceUrl: job.sourceUrl,
        postedAt: job.postedAt,
        source: job.source,
    };

    const ctsJobName = await upsertJob(input);

    // Save the CTS resource name back to Postgres
    await prisma.job.update({
        where: { id: job.id },
        data: { ctsJobName },
    });
}
