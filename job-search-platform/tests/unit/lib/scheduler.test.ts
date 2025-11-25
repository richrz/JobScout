import cron from 'node-cron';
import { startScheduler } from '../../../src/lib/scheduler';
import { runAggregation } from '../../../src/lib/job-scrapers';
import { sendErrorReport } from '../../../src/lib/error-reporting';

jest.mock('node-cron');
jest.mock('../../../src/lib/job-scrapers');
jest.mock('../../../src/lib/error-reporting');

describe('Scheduler', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should schedule aggregation with default cron expression', () => {
        startScheduler();
        expect(cron.schedule).toHaveBeenCalledWith('0 * * * *', expect.any(Function));
    });

    it('should schedule aggregation with custom cron expression', () => {
        const customCron = '*/15 * * * *';
        startScheduler(customCron);
        expect(cron.schedule).toHaveBeenCalledWith(customCron, expect.any(Function));
    });

    it('should run aggregation when scheduled task triggers', async () => {
        startScheduler();
        const scheduledCallback = (cron.schedule as jest.Mock).mock.calls[0][1];
        await scheduledCallback();
        expect(runAggregation).toHaveBeenCalled();
    });

    it('should report errors if aggregation fails', async () => {
        const error = new Error('Aggregation failed');
        (runAggregation as jest.Mock).mockRejectedValue(error);

        startScheduler();
        const scheduledCallback = (cron.schedule as jest.Mock).mock.calls[0][1];
        await scheduledCallback();

        expect(sendErrorReport).toHaveBeenCalledWith(error);
    });
});
