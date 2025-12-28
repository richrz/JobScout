/**
 * Environment Utilities
 * 
 * Centralized logic for checking environment-specific flags.
 */

/**
 * Checks if the application is currently running in Mock Mode.
 * When true, external API calls should be short-circuited to return mock data.
 */
export const isMockMode = (): boolean => {
    return process.env.NEXT_PUBLIC_MOCK_MODE === 'true';
};
