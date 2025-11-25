import { startScheduler } from '../lib/scheduler';

const cronExpr = process.env.AGGREGATION_CRON || '0 * * * *';

console.log('Starting Job Aggregation Scheduler Service...');
startScheduler(cronExpr);

// Keep the process alive
process.stdin.resume();

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('Stopping scheduler...');
    process.exit(0);
});
