import cron from 'node-cron';
import { runAggregation } from './n8n-workflows';
import { sendErrorReport } from './error-reporting';

/**
 * Start the job aggregation scheduler.
 * 
 * @param cronExpression - Cron expression for scheduling (default: hourly)
 */
export function startScheduler(cronExpression: string = '0 * * * *'): void {
    console.log(`Initializing scheduler with cron expression: ${cronExpression}`);

    cron.schedule(cronExpression, async () => {
        console.log('Triggering scheduled job aggregation...');
        try {
            await runAggregation();
        } catch (error) {
            console.error('Scheduled aggregation failed.');
            await sendErrorReport(error);
        }
    });
}
