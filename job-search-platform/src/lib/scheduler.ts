import cron from 'node-cron';
import { runAggregation } from './job-scrapers';
import { sendErrorReport } from './error-reporting';

/**
 * Start the job aggregation scheduler.
 * 
 * @param cronExpression - Cron expression for scheduling (default: hourly)
 */
let isRunning = false;

/**
 * Start the job aggregation scheduler.
 * 
 * @param cronExpression - Cron expression for scheduling (default: hourly)
 */
export function startScheduler(cronExpression: string = '0 * * * *'): void {
    console.log(`Initializing scheduler with cron expression: ${cronExpression}`);

    cron.schedule(cronExpression, async () => {
        console.log('Triggering scheduled job aggregation...');
        await triggerManualAggregation('scheduled');
    });
}

/**
 * Manually trigger the job aggregation process.
 * Prevents concurrent runs.
 * 
 * @param source - Source of the trigger (e.g., 'manual', 'scheduled')
 * @returns Promise that resolves when aggregation is complete
 */
export async function triggerManualAggregation(source: string = 'manual'): Promise<void> {
    if (isRunning) {
        console.warn(`[${source}] Aggregation already in progress. Skipping.`);
        return;
    }

    isRunning = true;
    try {
        console.log(`[${source}] Starting job aggregation...`);
        await runAggregation();
        console.log(`[${source}] Job aggregation completed successfully.`);
    } catch (error) {
        console.error(`[${source}] Aggregation failed.`);
        await sendErrorReport(error, { source });
    } finally {
        isRunning = false;
    }
}
