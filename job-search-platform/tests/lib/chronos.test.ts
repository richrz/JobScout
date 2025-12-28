import { injectSimulatedJobs } from '../../src/lib/simulation/simulator-service';
import { prisma } from '../../src/lib/prisma';

// Mocking prisma so we don't hit the real DB during unity tests
jest.mock('../../src/lib/prisma', () => ({
    prisma: {
        job: {
            create: jest.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'test-id', ...data }))
        }
    }
}));

describe('Chronos Simulator Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should inject the requested number of jobs', async () => {
        const count = 5;
        const injected = await injectSimulatedJobs(count, 0.5);
        expect(injected.length).toBe(count);
        expect(prisma.job.create).toHaveBeenCalledTimes(count);
    });

    it('should respect high junk ratios (mostly non-elite)', async () => {
        const count = 10;
        const injected = await injectSimulatedJobs(count, 1.0); // 100% junk

        // Check that none of the titles match the ELITE titles from our templates
        // For a mock, we just check what was passed to prisma.job.create
        const calls = (prisma.job.create as jest.Mock).mock.calls;
        calls.forEach(call => {
            const title = call[0].data.title;
            expect(title).not.toBe('Principal AI Research Engineer');
            expect(title).not.toBe('Full Stack Glassmorphism Expert');
        });
    });

    it('should respect low junk ratios (mostly elite)', async () => {
        const count = 5;
        const injected = await injectSimulatedJobs(count, 0.0); // 0% junk (all elite)

        const calls = (prisma.job.create as jest.Mock).mock.calls;
        calls.forEach(call => {
            const title = call[0].data.title;
            const isElite = [
                'Principal AI Research Engineer',
                'Full Stack Glassmorphism Expert',
                'Director of Product Overhaul'
            ].includes(title);
            expect(isElite).toBe(true);
        });
    });
});
