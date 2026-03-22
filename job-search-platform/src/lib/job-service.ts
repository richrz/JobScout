/**
 * Job Service - Database Persistence Layer
 *
 * Dual-writes jobs to Postgres (user state) and Cloud Talent Solution (search).
 * CTS ingestion is best-effort — Postgres is always the source of truth.
 *
 * Upsert strategy:
 *  1. sourceUrl already in DB → refresh that row (content update)
 *  2. sourceUrl new, fingerprint matches existing row → cross-source dedup: update by fingerprint
 *  3. Neither exists → insert new canonical record
 *
 * This avoids the "try/catch on Prisma upsert" pattern which logs misleading
 * prisma:error noise even when the error is handled.
 *
 * The DB-level `job_stale_overwrite_guard` trigger silently rejects any UPDATE
 * where the incoming lastExtractedAt is older than the stored value.
 */

import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { JobListing } from './job-scrapers';
import { normalizeJobData } from './ingest/normalization';
import { upsertJob, isCtsEnabled, type CtsJobInput } from './cts/talent-service';

type NormalizedJob = Prisma.JobCreateInput;

// Fields we refresh on every re-encounter of a job.
function buildUpdatePayload(j: NormalizedJob) {
    return {
        title: j.title,
        company: j.company,
        location: j.location,
        latitude: j.latitude,
        longitude: j.longitude,
        description: j.description,
        salary: j.salary,
        postedAt: j.postedAt,
        lastExtractedAt: j.lastExtractedAt,
        recordConfidence: j.recordConfidence,
        normalizationVersion: j.normalizationVersion,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        salaryCurrency: j.salaryCurrency,
        workMode: j.workMode,
        seniority: j.seniority,
        skillsTags: j.skillsTags,
        // Also stamp fingerprint if the existing row didn't have one (pre-P0 record)
        fingerprint: j.fingerprint,
        sourceType: j.sourceType,
    };
}

/**
 * Save jobs to the database with optional CTS sync.
 */
export async function saveJobs(jobs: JobListing[]): Promise<void> {
    const normalizedJobs = await Promise.all(
        jobs.map(job => normalizeJobData(job))
    );

    let savedCount = 0;
    let dedupedCount = 0;
    let failedCount = 0;
    const ctsEnabled = isCtsEnabled();

    for (const jobData of normalizedJobs) {
        try {
            const saved = await upsertJobRecord(jobData);
            if (saved === 'deduped') {
                dedupedCount++;
            } else {
                savedCount++;
                if (ctsEnabled && !saved.ctsJobName) {
                    pushToCts(saved).catch((err) => {
                        console.warn(`CTS: Failed to push job ${saved.id}:`, err?.message || err);
                    });
                }
            }
        } catch (error) {
            failedCount++;
            console.error(`Failed to save job ${jobData.sourceUrl}:`, error);
        }
    }

    console.log(
        `Saved ${savedCount} new/updated | ${dedupedCount} cross-source deduped | ` +
        `${failedCount} failed (of ${jobs.length} total)${ctsEnabled ? ' + CTS' : ''}`
    );
}

/**
 * Three-path upsert without relying on Prisma upsert constraint fallthrough.
 * Returns the saved record or 'deduped' if already covered by another source.
 */
async function upsertJobRecord(jobData: NormalizedJob): Promise<'deduped' | Prisma.JobGetPayload<{}>> {
    const update = buildUpdatePayload(jobData);

    // ── Path 1: sourceUrl already exists → refresh ────────────────────────────
    const byUrl = await prisma.job.findUnique({ where: { sourceUrl: jobData.sourceUrl } });
    if (byUrl) {
        // Only stamp fingerprint onto a pre-P0 row if no other row already holds it.
        // If another row already has this fingerprint, leave it null to avoid conflict.
        let fingerprintToWrite = jobData.fingerprint as string | null | undefined;
        if (!byUrl.fingerprint && fingerprintToWrite) {
            const fpConflict = await prisma.job.findUnique({
                where: { fingerprint: fingerprintToWrite },
            });
            if (fpConflict) fingerprintToWrite = undefined; // skip — already claimed
        }
        return await prisma.job.update({
            where: { id: byUrl.id },
            data: { ...update, fingerprint: fingerprintToWrite },
        });
    }

    // ── Path 2: sourceUrl is new, but fingerprint matches → cross-source dedup ─
    // (fingerprint is nullable; only check when set)
    if (jobData.fingerprint) {
        const byFingerprint = await prisma.job.findUnique({
            where: { fingerprint: jobData.fingerprint as string },
        });
        if (byFingerprint) {
            // Update the canonical record with fresher data, but keep its sourceUrl.
            // The DB trigger handles stale-overwrite protection automatically.
            await prisma.job.update({ where: { id: byFingerprint.id }, data: update });
            return 'deduped';
        }
    }

    // ── Path 3: new job — insert ──────────────────────────────────────────────
    return await prisma.job.create({ data: jobData });
}

/**
 * Push a single Postgres job to CTS and write the CTS resource name back.
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

    await prisma.job.update({
        where: { id: job.id },
        data: { ctsJobName },
    });
}
