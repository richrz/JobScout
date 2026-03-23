/**
 * Lifecycle Automation Service
 *
 * Handles automatic status transitions for workspaces based on age.
 * Workspace.status is the single source of truth for lifecycle state.
 *
 * Auto-transition rules:
 * - APPLIED > 14 days unchanged → SCREENING (assumed moved forward without explicit tracking)
 * - SCREENING > 21 days unchanged → DORMANT
 * - INTERVIEW > 21 days unchanged → DORMANT
 * - Legacy FOLLOW_UP > 21 days unchanged → DORMANT (migration path; FOLLOW_UP is being retired)
 * - DORMANT > 60 days → ARCHIVED
 *
 * New code should use SCREENING / INTERVIEW / OFFER directly.
 * FOLLOW_UP is preserved for existing rows but will stop being written by new paths.
 */

import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export interface LifecycleResult {
    processed: number;
    transitioned: {
        toScreening: number;
        toDormant: number;
        toArchived: number;
    };
    errors: string[];
}

const DAYS_APPLIED_TO_SCREENING = 14;
const DAYS_SCREENING_TO_DORMANT = 21;
const DAYS_INTERVIEW_TO_DORMANT = 21;
const DAYS_FOLLOWUP_TO_DORMANT = 21;
const DAYS_DORMANT_TO_ARCHIVED = 60;

function daysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
}

/**
 * Run lifecycle automation on all workspaces.
 * Called by cron job or manual trigger.
 */
export async function runLifecycleAutomation(): Promise<LifecycleResult> {
    const result: LifecycleResult = {
        processed: 0,
        transitioned: {
            toScreening: 0,
            toDormant: 0,
            toArchived: 0,
        },
        errors: [],
    };

    // 1. APPLIED → SCREENING (unchanged > 14 days)
    try {
        const r = await prisma.workspace.updateMany({
            where: { status: 'APPLIED', updatedAt: { lt: daysAgo(DAYS_APPLIED_TO_SCREENING) } },
            data: { status: 'SCREENING' },
        });
        result.transitioned.toScreening = r.count;
        result.processed += r.count;
    } catch (error: any) {
        result.errors.push(`APPLIED→SCREENING: ${error.message}`);
    }

    // 2. SCREENING → DORMANT (unchanged > 21 days)
    try {
        const r = await prisma.workspace.updateMany({
            where: { status: 'SCREENING', updatedAt: { lt: daysAgo(DAYS_SCREENING_TO_DORMANT) } },
            data: { status: 'DORMANT' },
        });
        result.transitioned.toDormant += r.count;
        result.processed += r.count;
    } catch (error: any) {
        result.errors.push(`SCREENING→DORMANT: ${error.message}`);
    }

    // 3. INTERVIEW → DORMANT (unchanged > 21 days)
    try {
        const r = await prisma.workspace.updateMany({
            where: { status: 'INTERVIEW', updatedAt: { lt: daysAgo(DAYS_INTERVIEW_TO_DORMANT) } },
            data: { status: 'DORMANT' },
        });
        result.transitioned.toDormant += r.count;
        result.processed += r.count;
    } catch (error: any) {
        result.errors.push(`INTERVIEW→DORMANT: ${error.message}`);
    }

    // 4. Legacy FOLLOW_UP → DORMANT (migration path — FOLLOW_UP is being retired)
    try {
        const r = await prisma.workspace.updateMany({
            where: { status: 'FOLLOW_UP', updatedAt: { lt: daysAgo(DAYS_FOLLOWUP_TO_DORMANT) } },
            data: { status: 'DORMANT' },
        });
        result.transitioned.toDormant += r.count;
        result.processed += r.count;
    } catch (error: any) {
        result.errors.push(`FOLLOW_UP→DORMANT: ${error.message}`);
    }

    // 5. DORMANT → ARCHIVED (unchanged > 60 days)
    try {
        const r = await prisma.workspace.updateMany({
            where: { status: 'DORMANT', updatedAt: { lt: daysAgo(DAYS_DORMANT_TO_ARCHIVED) } },
            data: { status: 'ARCHIVED' },
        });
        result.transitioned.toArchived = r.count;
        result.processed += r.count;
    } catch (error: any) {
        result.errors.push(`DORMANT→ARCHIVED: ${error.message}`);
    }

    console.log('Lifecycle automation complete:', result);
    return result;
}

/**
 * Get statistics on workspace statuses
 */
export async function getLifecycleStats() {
    const stats = await prisma.workspace.groupBy({
        by: ['status'],
        _count: true,
    });

    const staleApplied = await prisma.workspace.count({
        where: { status: 'APPLIED', updatedAt: { lt: daysAgo(DAYS_APPLIED_TO_SCREENING) } },
    });

    const staleScreening = await prisma.workspace.count({
        where: { status: 'SCREENING', updatedAt: { lt: daysAgo(DAYS_SCREENING_TO_DORMANT) } },
    });

    const staleInterview = await prisma.workspace.count({
        where: { status: 'INTERVIEW', updatedAt: { lt: daysAgo(DAYS_INTERVIEW_TO_DORMANT) } },
    });

    const staleDormant = await prisma.workspace.count({
        where: { status: 'DORMANT', updatedAt: { lt: daysAgo(DAYS_DORMANT_TO_ARCHIVED) } },
    });

    return {
        byStatus: stats.reduce((acc, s) => {
            acc[s.status] = s._count;
            return acc;
        }, {} as Record<ApplicationStatus, number>),
        pendingTransitions: {
            toScreening: staleApplied,
            toDormant: staleScreening + staleInterview,
            toArchived: staleDormant,
        },
    };
}
