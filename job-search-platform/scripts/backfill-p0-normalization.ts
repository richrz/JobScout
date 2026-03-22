#!/usr/bin/env tsx
/**
 * Backfill P0 normalization fields on pre-migration Job records.
 *
 * Pre-P0 records (imported before 2026-03-22) have NULL for:
 *   fingerprint, sourceType, workMode, seniority, skillsTags,
 *   recordConfidence, normalizationVersion, lastExtractedAt
 *
 * This script re-runs normalization over every record that lacks a
 * normalizationVersion stamp, updating only the new P0 fields.
 * It does NOT touch sourceUrl, source, title, company, location, description,
 * salary, or postedAt — those are the canonical values already in use.
 *
 * Safe to run multiple times (idempotent — skips already-normalized records).
 * Run time: ~1-2s for 158 records at batch size 50.
 */

import dotenv from 'dotenv';
import { resolve } from 'path';
dotenv.config({ path: resolve(__dirname, '../../.env') });

import { prisma } from '../src/lib/prisma';
import { buildFingerprint, classifyWorkMode, classifySeniority, extractSkillTags, computeConfidence } from '../src/lib/ingest/normalization';

const BATCH_SIZE = 50;
const NORMALIZATION_VERSION = '1.0';

async function backfill() {
    console.log('🔄 Backfilling P0 normalization fields on pre-migration records...\n');

    const total = await prisma.job.count({ where: { normalizationVersion: null } });
    console.log(`📋 Records to backfill: ${total}`);
    if (total === 0) {
        console.log('✅ Nothing to do — all records already normalized.');
        return;
    }

    let updated = 0;
    let skipped = 0;

    while (true) {
        // Always fetch from the head of unnormalized records — no skip/offset.
        // Records leave this query as they get stamped, so each batch is fresh.
        const batch = await prisma.job.findMany({
            where: { normalizationVersion: null },
            select: {
                id: true,
                title: true,
                company: true,
                location: true,
                description: true,
                salary: true,
                source: true,
                sourceUrl: true,
                postedAt: true,
                createdAt: true,
                fingerprint: true,
            },
            take: BATCH_SIZE,
        });

        for (const job of batch) {
            try {
                const fp = buildFingerprint(job.company, job.title, job.location);

                // Check if this fingerprint is already held by another record.
                // If so, skip stamping fingerprint on this one to avoid unique conflict.
                let fingerprintToWrite: string | null = fp;
                if (fp) {
                    const conflict = await prisma.job.findUnique({
                        where: { fingerprint: fp },
                        select: { id: true },
                    });
                    if (conflict && conflict.id !== job.id) {
                        fingerprintToWrite = null; // already claimed — leave null
                    }
                }

                const corpus = `${job.title} ${job.description ?? ''}`;
                const salary = typeof job.salary === 'string' ? job.salary : null;

                await prisma.job.update({
                    where: { id: job.id },
                    data: {
                        fingerprint: job.fingerprint ?? fingerprintToWrite,
                        sourceType: job.source === 'company' ? 'scraped' : 'api',
                        workMode: classifyWorkMode(job.title, job.location, job.description ?? ''),
                        seniority: classifySeniority(job.title),
                        skillsTags: extractSkillTags(corpus),
                        recordConfidence: computeConfidence({
                            salary,
                            postedAt: job.postedAt,
                            description: job.description,
                            location: job.location,
                        }),
                        normalizationVersion: NORMALIZATION_VERSION,
                        lastExtractedAt: job.createdAt, // best proxy for pre-P0 records
                    },
                });
                updated++;
            } catch (err: any) {
                console.warn(`  ⚠️  Skipped ${job.id} (${job.title}): ${err?.message}`);
                skipped++;
            }
        }

        process.stdout.write(`  Progress: ${updated + skipped}/${total}\r`);
    }

    console.log(`\n\n✅ Done. Updated: ${updated} | Skipped: ${skipped}`);

    // Final stats
    const stats = await prisma.$queryRaw<Array<Record<string, bigint>>>`
        SELECT
          COUNT(*) as total,
          COUNT(fingerprint) as with_fp,
          COUNT("normalizationVersion") as normalized,
          COUNT(CASE WHEN "workMode" != 'unknown' THEN 1 END) as classified_workmode
        FROM "Job"
    `;
    console.log('\n📊 Final DB state:');
    console.log(`   Total jobs:        ${stats[0].total}`);
    console.log(`   With fingerprint:  ${stats[0].with_fp}`);
    console.log(`   Normalized:        ${stats[0].normalized}`);
    console.log(`   Classified workMode: ${stats[0].classified_workmode}`);
}

backfill()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
