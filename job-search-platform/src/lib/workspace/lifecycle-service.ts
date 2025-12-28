/**
 * Lifecycle Automation Service
 * 
 * Handles automatic status transitions for workspaces based on age:
 * - APPLIED > 7 days unchanged → FOLLOW_UP
 * - FOLLOW_UP > 30 days → DORMANT
 * - DORMANT > 60 days → ARCHIVED
 */

import { prisma } from '@/lib/prisma';
import { ApplicationStatus } from '@prisma/client';

export interface LifecycleResult {
    processed: number;
    transitioned: {
        toFollowUp: number;
        toDormant: number;
        toArchived: number;
    };
    errors: string[];
}

const DAYS_TO_FOLLOW_UP = 7;
const DAYS_TO_DORMANT = 30;
const DAYS_TO_ARCHIVED = 60;

/**
 * Get date N days ago
 */
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
            toFollowUp: 0,
            toDormant: 0,
            toArchived: 0
        },
        errors: []
    };

    // 1. APPLIED → FOLLOW_UP (unchanged > 7 days)
    try {
        const appliedToFollowUp = await prisma.workspace.updateMany({
            where: {
                status: 'APPLIED',
                updatedAt: {
                    lt: daysAgo(DAYS_TO_FOLLOW_UP)
                }
            },
            data: {
                status: 'FOLLOW_UP'
            }
        });
        result.transitioned.toFollowUp = appliedToFollowUp.count;
        result.processed += appliedToFollowUp.count;
    } catch (error: any) {
        result.errors.push(`APPLIED→FOLLOW_UP: ${error.message}`);
    }

    // 2. FOLLOW_UP → DORMANT (unchanged > 30 days)
    try {
        const followUpToDormant = await prisma.workspace.updateMany({
            where: {
                status: 'FOLLOW_UP',
                updatedAt: {
                    lt: daysAgo(DAYS_TO_DORMANT)
                }
            },
            data: {
                status: 'DORMANT'
            }
        });
        result.transitioned.toDormant = followUpToDormant.count;
        result.processed += followUpToDormant.count;
    } catch (error: any) {
        result.errors.push(`FOLLOW_UP→DORMANT: ${error.message}`);
    }

    // 3. DORMANT → ARCHIVED (unchanged > 60 days)
    try {
        const dormantToArchived = await prisma.workspace.updateMany({
            where: {
                status: 'DORMANT',
                updatedAt: {
                    lt: daysAgo(DAYS_TO_ARCHIVED)
                }
            },
            data: {
                status: 'ARCHIVED'
            }
        });
        result.transitioned.toArchived = dormantToArchived.count;
        result.processed += dormantToArchived.count;
    } catch (error: any) {
        result.errors.push(`DORMANT→ARCHIVED: ${error.message}`);
    }

    console.log(`Lifecycle automation complete:`, result);
    return result;
}

/**
 * Get statistics on workspace statuses
 */
export async function getLifecycleStats() {
    const stats = await prisma.workspace.groupBy({
        by: ['status'],
        _count: true
    });

    const staleApplied = await prisma.workspace.count({
        where: {
            status: 'APPLIED',
            updatedAt: { lt: daysAgo(DAYS_TO_FOLLOW_UP) }
        }
    });

    const staleFollowUp = await prisma.workspace.count({
        where: {
            status: 'FOLLOW_UP',
            updatedAt: { lt: daysAgo(DAYS_TO_DORMANT) }
        }
    });

    const staleDormant = await prisma.workspace.count({
        where: {
            status: 'DORMANT',
            updatedAt: { lt: daysAgo(DAYS_TO_ARCHIVED) }
        }
    });

    return {
        byStatus: stats.reduce((acc, s) => {
            acc[s.status] = s._count;
            return acc;
        }, {} as Record<ApplicationStatus, number>),
        pendingTransitions: {
            toFollowUp: staleApplied,
            toDormant: staleFollowUp,
            toArchived: staleDormant
        }
    };
}
