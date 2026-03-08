import cron, { type ScheduledTask } from 'node-cron';
import { injectSimulatedJobs } from './simulator-service';

// In-memory state for the simulation (reset on server restart)
class ChronosManager {
    private static instance: ChronosManager;
    private task: ScheduledTask | null = null;
    private isRunning: boolean = false;
    private config = {
        jobsPerHour: 10,
        junkRatio: 0.5
    };

    private constructor() { }

    public static getInstance(): ChronosManager {
        if (!ChronosManager.instance) {
            ChronosManager.instance = new ChronosManager();
        }
        return ChronosManager.instance;
    }

    public start() {
        if (this.isRunning) return;

        console.log(`[Chronos] Starting simulation: ${this.config.jobsPerHour} jobs/hr, ${this.config.junkRatio} junk ratio`);

        // Schedule based on jobs per hour. 
        // For smoothness, we'll divide into smaller batches if needed, 
        // but for MVP simplicity, let's run once per minute and inject (jobsPerHour / 60).
        // OR better: just run a cron expression that approximates it.
        // Let's stick to a robust interval: Every minute check if we need to inject.

        // Actually, let's simplify: Run every minute.
        // Probability of injection = jobsPerHour / 60.
        // If jobsPerHour is 600, that's 10 per minute.

        this.task = cron.schedule('* * * * *', async () => {
            const jobsPerMinute = this.config.jobsPerHour / 60;
            const count = Math.floor(jobsPerMinute) + (Math.random() < (jobsPerMinute % 1) ? 1 : 0);

            if (count > 0) {
                await injectSimulatedJobs(count, this.config.junkRatio);
            }
        });

        this.isRunning = true;
    }

    public stop() {
        if (this.task) {
            this.task.stop();
            this.task = null;
        }
        this.isRunning = false;
        console.log('[Chronos] Simulation stopped');
    }

    public updateConfig(jobsPerHour: number, junkRatio: number) {
        this.config = { jobsPerHour, junkRatio };
        // Restart if running to apply new frequency logic immediately if we changed strategy,
        // but since we check config inside the cron callback, it applies next tick automatically.
        console.log(`[Chronos] Config updated: ${this.config.jobsPerHour} jobs/hr`);
    }

    public getStatus() {
        return {
            isRunning: this.isRunning,
            config: this.config
        };
    }
}

export const chronos = ChronosManager.getInstance();
