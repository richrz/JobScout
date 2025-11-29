import cron from 'node-cron';
import { startScheduler, triggerManualAggregation } from '../../../src/lib/scheduler';
import { runAggregation } from '../../../src/lib/job-scrapers';
import { sendErrorReport } from '../../../src/lib/error-reporting';

jest.mock('node-cron');
jest.mock('../../../src/lib/job-scrapers');
jest.mock('../../../src/lib/error-reporting');

describe('Scheduler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('startScheduler', () => {
        it('should schedule aggregation with default cron expression', () => {
            startScheduler();
            expect(cron.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));
        });

        it('should schedule aggregation with custom cron expression', () => {
            const customCron = '*/15 * * * *';
            startScheduler(customCron);
            expect(cron.schedule).toHaveBeenCalledWith(customCron, expect.any(Function));
        });

        it('should trigger aggregation when scheduled task runs', async () => {
            startScheduler();
            const scheduledCallback = (cron.schedule as jest.Mock).mock.calls[0][1];
            await scheduledCallback();
            expect(runAggregation).toHaveBeenCalled();
        });
    });

    describe('triggerManualAggregation', () => {
        it('should run aggregation manually', async () => {
            await triggerManualAggregation('manual-test');
            expect(runAggregation).toHaveBeenCalled();
        });

        it('should prevent concurrent runs', async () => {
            // Mock runAggregation to take some time
            (runAggregation as jest.Mock).mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

            // Trigger twice
            const p1 = triggerManualAggregation('run1');
            const p2 = triggerManualAggregation('run2');

            await Promise.all([p1, p2]);

            // Should only be called once
            expect(runAggregation).toHaveBeenCalledTimes(1);
        });

        it('should report errors with context', async () => {
            const error = new Error('Aggregation failed');
            (runAggregation as jest.Mock).mockRejectedValue(error);

            await triggerManualAggregation('error-test');

            expect(sendErrorReport).toHaveBeenCalledWith(error, { source: 'error-test' });
        });
    });
});
