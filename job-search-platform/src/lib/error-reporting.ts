/**
 * Error reporting utility for job aggregation system.
 * Currently logs to console, but can be extended to support Slack/Email/Sentry.
 */
export async function sendErrorReport(error: unknown): Promise<void> {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error(`[${timestamp}] Job Aggregation Error:`, errorMessage);
    if (errorStack) {
        console.error(errorStack);
    }

    // TODO: Integrate with external monitoring service (e.g., Sentry, Slack webhook)
}
