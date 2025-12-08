/**
 * @jest-environment jsdom
 */
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { ConfigProvider, useConfig } from '@/contexts/ConfigContext';

// Mock fetch
global.fetch = jest.fn();

function TestComponent() {
    const { config, isLoading } = useConfig();

    if (isLoading) return <div>Loading...</div>;
    if (!config) return <div>No config</div>;

    return (
        <div>
            <div data-testid="version">{config.version}</div>
            <div data-testid="recency">{config.search.recencyDays}</div>
        </div>
    );
}

describe('ConfigContext', () => {
    beforeEach(() => {
        (global.fetch as jest.Mock).mockClear();
    });

    it('loads config on mount', async () => {
        const mockConfig = {
            search: { cities: [], keywords: [], recencyDays: 30 },
            llm: { provider: 'openai', model: 'gpt-4o-mini', apiKey: '', temperature: 0.7, maxTokens: 2000 },
            automation: { dailyApplicationLimit: 20, autoApply: false, requireManualReview: true },
            version: 1,
            lastUpdated: new Date(),
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockConfig,
        });

        render(
            <ConfigProvider>
                <TestComponent />
            </ConfigProvider>
        );

        expect(screen.getByText('Loading...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByTestId('version')).toHaveTextContent('1');
            expect(screen.getByTestId('recency')).toHaveTextContent('30');
        });
    });

    it('handles fetch errors gracefully', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(
            <ConfigProvider>
                <TestComponent />
            </ConfigProvider>
        );

        await waitFor(() => {
            // Should still render with default config
            expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
        });
    });
});
