/**
 * P1 Dedup Worker — three-tier ObservedListing reconciliation
 *
 * Matches ObservedListings to canonical Job records using three tiers:
 *   Tier 1: exact canonicalUrl match        → always "same" (no ambiguity)
 *   Tier 2: fingerprint match               → "same" with high confidence
 *   Tier 3: embedding cosine similarity     → "same" if ≥ 0.90, "uncertain" if 0.75–0.90
 *
 * Every comparison is logged to DedupeDecision for audit and threshold tuning.
 * This worker is designed to run after ingestion, not in the ingestion hot path.
 *
 * Current status: Tiers 1 and 2 are fully implemented.
 * Tier 3 (embedding similarity) is stubbed — requires pgvector or an embedding
 * API. The stub returns 'uncertain' so uncertain listings queue for future resolution.
 *
 * Usage:
 *   npx tsx scripts/run-dedup-worker.ts
 */

import { prisma } from '@/lib/prisma';

type DedupeOutcome = 'same' | 'different' | 'uncertain';
type DedupeMethod = 'exact_url' | 'fingerprint' | 'embedding' | 'llm';

interface DedupeResult {
    outcome: DedupeOutcome;
    method: DedupeMethod;
    similarity?: number;
    mergedIntoJobId?: string;
    llmReasoning?: string;
}

/**
 * Process all unresolved ObservedListings — those with no jobId yet.
 * For each, try to find a matching canonical Job and link it.
 * Log every comparison to DedupeDecision.
 */
export async function runDedupWorker(): Promise<void> {
    const unresolved = await prisma.observedListing.findMany({
        where: { jobId: null },
        orderBy: { extractedAt: 'asc' },
    });

    if (unresolved.length === 0) {
        console.log('Dedup worker: no unresolved listings.');
        return;
    }

    console.log(`Dedup worker: processing ${unresolved.length} unresolved listings...`);

    let linked = 0;
    let uncertain = 0;
    let noMatch = 0;

    for (const listing of unresolved) {
        const result = await resolveToCanonicalJob(listing);

        // Log decision
        await prisma.dedupeDecision.create({
            data: {
                listingAId: listing.id,
                listingBId: listing.id, // self-reference for single-listing resolution
                method: result.method,
                outcome: result.outcome,
                similarity: result.similarity ?? null,
                mergedIntoJobId: result.mergedIntoJobId ?? null,
                llmReasoning: result.llmReasoning ?? null,
            },
        });

        if (result.outcome === 'same' && result.mergedIntoJobId) {
            await prisma.observedListing.update({
                where: { id: listing.id },
                data: { jobId: result.mergedIntoJobId },
            });
            linked++;
        } else if (result.outcome === 'uncertain') {
            uncertain++;
        } else {
            noMatch++;
        }
    }

    console.log(`Dedup worker done: ${linked} linked | ${uncertain} uncertain | ${noMatch} no match`);
}

/**
 * Try to resolve a single ObservedListing to a canonical Job.
 * Returns the result of the best-matching tier.
 */
async function resolveToCanonicalJob(
    listing: { id: string; canonicalUrl: string | null; sourceUrl: string; extractedTitle: string | null; extractedCompany: string | null; extractedLocation: string | null }
): Promise<DedupeResult> {

    // ── Tier 1: exact canonicalUrl match ─────────────────────────────────────
    if (listing.canonicalUrl) {
        const byCanonical = await prisma.job.findFirst({
            where: { canonicalUrl: listing.canonicalUrl },
            select: { id: true },
        });
        if (byCanonical) {
            return { outcome: 'same', method: 'exact_url', mergedIntoJobId: byCanonical.id };
        }
    }

    // Also try sourceUrl as a fallback canonical match
    const bySourceUrl = await prisma.job.findUnique({
        where: { sourceUrl: listing.sourceUrl },
        select: { id: true },
    });
    if (bySourceUrl) {
        return { outcome: 'same', method: 'exact_url', mergedIntoJobId: bySourceUrl.id };
    }

    // ── Tier 2: fingerprint match ─────────────────────────────────────────────
    if (listing.extractedTitle && listing.extractedCompany && listing.extractedLocation) {
        const fp = buildFingerprint(
            listing.extractedCompany,
            listing.extractedTitle,
            listing.extractedLocation
        );
        const byFingerprint = await prisma.job.findUnique({
            where: { fingerprint: fp },
            select: { id: true },
        });
        if (byFingerprint) {
            return { outcome: 'same', method: 'fingerprint', mergedIntoJobId: byFingerprint.id };
        }
    }

    // ── Tier 3: embedding similarity (stubbed) ────────────────────────────────
    // TODO: implement when pgvector is available.
    // For now, return 'uncertain' so listings queue for future resolution.
    // The DedupeDecision log will show these as uncertain/embedding for monitoring.
    return {
        outcome: 'uncertain',
        method: 'embedding',
        similarity: undefined,
        llmReasoning: 'Embedding tier not yet implemented — queued for future resolution',
    };
}

/**
 * Inline fingerprint builder (mirrors normalization.ts) to avoid import cycles.
 */
function buildFingerprint(company: string, title: string, location: string): string {
    const crypto = require('crypto');
    const normalize = (s: string) =>
        s.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
    const corpus = `${normalize(company)}|${normalize(title)}|${normalize(location)}`;
    return crypto.createHash('sha256').update(corpus).digest('hex');
}
